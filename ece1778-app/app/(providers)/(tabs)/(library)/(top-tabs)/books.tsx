import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@lib/supabase.web";
import { Tables } from "@app/types/database.types";
import GeneralCard from "@components/generalCard";
import { globalStyles } from "@styles/globalStyles";
import { useAuthContext } from "@app/contexts/AuthContext";
import { useSelector } from "react-redux";
import { selectTheme } from "@app/features/theme/themeSlice";
import { RootState } from "@app/store/store";
import { colorsType } from "@app/types/types";

type Collection = Tables<"collections"> & {
  book_list?: number[] | null;
};

export default function TabLibraryBooks() {
  const { isLoggedIn } = useAuthContext();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionThumbnails, setCollectionThumbnails] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [collectionName, setCollectionName] = useState<string>("");
  const [creating, setCreating] = useState<boolean>(false);
  const [duplicateNameError, setDuplicateNameError] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [collectionToDelete, setCollectionToDelete] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const colors = useSelector((state:RootState)=>selectTheme(state));
  const styles = getStyles(colors)
  const setGlobalStyles = globalStyles()

  useFocusEffect(
    useCallback(() => {
      fetchCollections(); // re-fetch from Supabase
    }, [isLoggedIn])
  );

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user ID from session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      const userId = session.user.id;

      // Check if "Read" collection exists, create it if it doesn't
      const { data: readCollection, error: readCheckError } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", userId)
        .eq("name", "Read")
        .is("movie_list", null)
        .maybeSingle();

      if (readCheckError) {
        console.error("Error checking Read collection:", readCheckError);
      }

      // If "Read" collection doesn't exist, create it
      if (!readCollection) {
        const { error: createReadError } = await supabase
          .from("collections")
          .insert({
            name: "Read",
            user_id: userId,
            movie_list: null,
            book_list: [],
          } as any);

        if (createReadError) {
          console.error("Error creating Read collection:", createReadError);
        }
      }

      // Fetch collections for the user where movie_list is null (book collections)
      const { data: collectionsData, error: collectionsError } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", userId)
        .is("movie_list", null)
        .order("updated_at", { ascending: false });

      if (collectionsError) {
        throw collectionsError;
      }

      // Sort collections: "Read" first (if exists), then by updated_at descending
      const sortedCollections = (collectionsData || []).sort((a, b) => {
        // "Read" collection always comes first
        if (a.name === "Read") return -1;
        if (b.name === "Read") return 1;
        
        // Both are not "Read", sort by updated_at descending
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return dateB - dateA; // Descending order (most recent first)
      });

      setCollections(sortedCollections as Collection[]);

      // Fetch thumbnails for each collection (first book's cover)
      if (sortedCollections && sortedCollections.length > 0) {
        const thumbnailsMap = new Map<number, string>();
        for (const collection of sortedCollections) {
          // Access book_list from the collection (it may be in the data even if not in types)
          const bookList = (collection as any).book_list;
          if (bookList && Array.isArray(bookList) && bookList.length > 0) {
            // Get the first book's cover
            const firstBookId = bookList[0];
            const { data: bookData, error: bookError } = await supabase
              .from("books")
              .select("cover_image")
              .eq("id", firstBookId)
              .maybeSingle();

            if (!bookError && bookData?.cover_image) {
              // Book cover_image is a number (cover_i from Open Library)
              // Format: https://covers.openlibrary.org/b/id/<cover_i>-M.jpg
              thumbnailsMap.set(collection.id, `https://covers.openlibrary.org/b/id/${bookData.cover_image}-M.jpg`);
            }
          }
        }

        setCollectionThumbnails(thumbnailsMap);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch collections");
      console.log("Error fetching collections:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    const trimmedName = collectionName.trim();
    
    if (!trimmedName) {
      setDuplicateNameError("Please enter a collection name");
      return;
    }

    // Check if collection name already exists
    const nameExists = collections.some(
      (collection) => collection.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (nameExists) {
      setDuplicateNameError("A collection with this name already exists");
      return;
    }

    try {
      setCreating(true);
      setDuplicateNameError(null);

      // Get user ID from session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user?.id) {
        throw new Error("User not authenticated");
      }

      // Create the collection with book_list and null movie_list
      const { data, error: createError } = await supabase
        .from("collections")
        .insert({
          name: trimmedName,
          user_id: session.user.id,
          movie_list: null,
          book_list: [],
        } as any)
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Close modal and reset form
      setModalVisible(false);
      setCollectionName("");
      setDuplicateNameError(null);

      // Refresh collections list
      await fetchCollections();
    } catch (err: any) {
      setDuplicateNameError(err.message || "Failed to create collection");
      console.log("Error creating collection:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCollection = (collectionId: number) => {
    // Find the collection to get its name for the confirmation
    const collection = collections.find(c => c.id === collectionId);
    if (collection) {
      setCollectionToDelete({ id: collectionId, name: collection.name });
      setDeleteModalVisible(true);
    }
  };

  const confirmDeleteCollection = async () => {
    if (!collectionToDelete) return;

    try {
      setDeleting(true);

      // Delete the collection from the database
      const { error: deleteError } = await supabase
        .from("collections")
        .delete()
        .eq("id", collectionToDelete.id);
        
      if (deleteError) {
        throw deleteError;
      }

      // Remove thumbnail from map
      collectionThumbnails.delete(collectionToDelete.id);
      setCollectionThumbnails(new Map(collectionThumbnails));

      setDeleteModalVisible(false);
      setCollectionToDelete(null);
      await fetchCollections();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to delete collection");
      console.log("Error deleting collection:", err);
    } finally {
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <SafeAreaView style={[setGlobalStyles.container, setGlobalStyles.center]} edges={['bottom', 'left', 'right']}>
        <Text style={setGlobalStyles.errorText}>Error: {error}</Text>
        {!isLoggedIn && 
        <>
          <Text style={setGlobalStyles.errorDescriptionText}>Please login to view your saved collections.</Text>
          <Pressable
            style={({ pressed }: { pressed: boolean }) => [
              setGlobalStyles.errorLoginButton,
              { opacity: pressed ? 0.6 : 1, },
            ]}
            onPress={() => router.push('/account')}
          >
            <Text style={setGlobalStyles.errorDescriptionText}>Login</Text>
          </Pressable>
        </>
        }
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[setGlobalStyles.container, setGlobalStyles.center]} edges={['bottom', 'left', 'right']}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={styles.loadingText}>Loading collections...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[setGlobalStyles.container, setGlobalStyles.center]} edges={['bottom', 'left', 'right']}>
        <Text style={setGlobalStyles.errorText}>Error: {error}</Text>
        {!isLoggedIn && 
        <>
          <Text style={setGlobalStyles.errorDescriptionText}>Please login to view your saved collections.</Text>
          <Pressable
            style={({ pressed }: { pressed: boolean }) => [
              setGlobalStyles.errorLoginButton,
              { opacity: pressed ? 0.6 : 1, },
            ]}
            onPress={() => router.push('/account')}
          >
            <Text style={setGlobalStyles.errorDescriptionText}>Login</Text>
          </Pressable>
        </>
        }
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={setGlobalStyles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView>
        <Text style={setGlobalStyles.titleText}>Collections</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.modalButtonText, {color: colors.background}]}>+  New Collection</Text>
        </TouchableOpacity>

        {collections.length > 0 ? (
          <View style={styles.collectionsContainer}>
            <FlatList
              data={collections}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false} // Use ScrollView's scrolling instead
              renderItem={({ item }) => {
                const thumbnail = collectionThumbnails.get(item.id);
                const bookList = (item as any).book_list;
                const numberOfItems = bookList?.length || 0;

                return (
                  <TouchableOpacity
                    onPress={() => router.push(`./collection/${item.id}`)}
                    activeOpacity={0.7}
                  >
                    <GeneralCard
                      image={thumbnail}
                      name={item.name}
                      leftSubText={`${numberOfItems} ${numberOfItems === 1 ? "item" : "items"}`}
                      rightSubText={
                        item.updated_at
                          ? new Date(item.updated_at).toLocaleDateString()
                          : undefined
                      }
                      del={item.name === 'Read' ? false : true}
                      delFunction={async() => await handleDeleteCollection(item.id)}
                    />
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={styles.collectionsList}
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={setGlobalStyles.errorDescriptionText}>
              No collections found.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Create New Collection Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Create New Collection</Text>
            
            <Text style={styles.modalLabel}>Collection Name</Text>
            <TextInput
              placeholder="Enter collection name"
              placeholderTextColor={colors.secondary}
              value={collectionName}
              onChangeText={(text) => {
                setCollectionName(text);
                // Clear error when user starts typing
                if (duplicateNameError) {
                  setDuplicateNameError(null);
                }
              }}
              style={[styles.modalInput, {color: colors.secondary, borderColor: colors.secondary}]}
              autoFocus
            />

            {duplicateNameError && (
              <Text style={styles.modalErrorText}>{duplicateNameError}</Text>
            )}

            <View style={styles.modalButtonContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButtonDanger,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
                onPress={() => {
                  setModalVisible(false);
                  setCollectionName("");
                  setDuplicateNameError(null);
                }}
              >
                <Text style={[styles.modalButtonText, {color: colors.white}]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButtonSecondary,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
                onPress={handleCreateCollection}
                disabled={creating}
              >
                <Text style={[styles.modalButtonText, {color: colors.background}]}>
                  {creating ? "Creating..." : "Save"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Collection Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => {
          setDeleteModalVisible(false);
          setCollectionToDelete(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete Collection</Text>
            
            <Text style={styles.modalLabel}>
              Are you sure you want to delete "{collectionToDelete?.name}"?
            </Text>
            <Text style={styles.modalWarningText}>
              This action cannot be undone.
            </Text>

            <View style={styles.modalButtonContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButtonSecondary,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setCollectionToDelete(null);
                }}
              >
                <Text style={[styles.modalButtonText, {color: colors.background}]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButtonDanger,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
                onPress={confirmDeleteCollection}
                disabled={deleting}
              >
                <Text style={[styles.modalButtonText, {color: colors.white}]}>
                  {deleting ? "Deleting..." : "Delete"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function getStyles(colors:colorsType){  
  const styles = StyleSheet.create({
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.secondary,
    },
    collectionsContainer: {
      marginTop: 20,
    },
    collectionsList: {
      paddingBottom: 20,
    },
    emptyContainer: {
      padding: 20,
      alignItems: "center",
      marginTop: 40,
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    createButton: {
      backgroundColor: colors.secondary,
      alignItems: "center",
      paddingVertical: 10,
      marginTop: 15,
      marginHorizontal: 15,
      borderRadius: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalBox: {
      backgroundColor: colors.background,
      width: "85%",
      borderRadius: 12,
      padding: 20,
      shadowColor: colors.black,
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.secondary,
      marginBottom: 20,
      textAlign: "center",
    },
    modalLabel: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.secondary,
      marginBottom: 8,
    },
    modalInput: {
      width: "100%",
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.black,
      borderRadius: 8,
      padding: 12,
      marginBottom: 20,
      fontSize: 16,
      color: colors.black,
    },
    modalButtonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    modalButtonDanger: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.danger,
    },
    modalButtonSecondary: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.secondary,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: "bold",
    },
    modalWarningText: {
      fontSize: 14,
      color: colors.danger,
      marginBottom: 20,
      textAlign: "center",
    },
    modalErrorText: {
      fontSize: 14,
      color: colors.danger,
      marginBottom: 10,
      textAlign: "center",
    },
  });
  return styles;
}
