import React, { useState, useImperativeHandle, forwardRef } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { supabase } from "../lib/supabase.web";
import { Tables } from "../types/database.types";
import GeneralCard from "./generalCard";
import { useSelector } from "react-redux";
import { RootState } from "@app/store/store";
import { selectTheme } from "@app/features/theme/themeSlice";
import { colorsType } from "@app/types/types";

type Collection = Tables<"collections">;

export type AddToCollectionHandle = {
  open: (itemId: number) => void;
};

type AddToCollectionProps = {
  isBooks?: boolean;
};

const AddToCollection = forwardRef<AddToCollectionHandle, AddToCollectionProps>((props, ref) => {
  const { isBooks = false } = props;
  const [itemId, setItemId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<Set<number>>(new Set());
  const [collectionThumbnails, setCollectionThumbnails] = useState<
    Map<number, { imageSource: string; localPath: boolean }>
  >(new Map());
  const [updating, setUpdating] = useState<boolean>(false);
  const colors = useSelector((state:RootState)=>selectTheme(state));
  const styles = getStyles(colors)

  const fetchCollectionsForModal = async (id: number) => {
    try {
      // Get user ID from session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user?.id) {
        throw new Error("User not authenticated");
      }

      const userId = session.user.id;

      // Fetch collections for the user
      // For movies: book_list must be null
      // For books: movie_list must be null
      let query = supabase
        .from("collections")
        .select("*")
        .eq("user_id", userId);

      if (isBooks) {
        query = query.is("movie_list", null);
      } else {
        query = query.is("book_list", null);
      }

      const { data: collectionsData, error: collectionsError } = await query.order("updated_at", { ascending: false });

      if (collectionsError) {
        throw collectionsError;
      }

      setCollections(collectionsData || []);

      // Determine which collections contain this item
      const selectedIds = new Set<number>();
      if (collectionsData) {
        for (const collection of collectionsData) {
          if (isBooks) {
            const bookList = (collection as any).book_list;
            if (bookList && Array.isArray(bookList) && bookList.includes(id)) {
              selectedIds.add(collection.id);
            }
          } else {
            if (collection.movie_list && collection.movie_list.includes(id)) {
              selectedIds.add(collection.id);
            }
          }
        }
      }
      setSelectedCollectionIds(selectedIds);

      // Fetch thumbnails for each collection
      if (collectionsData && collectionsData.length > 0) {
        const thumbnailsMap = new Map<
          number,
          { imageSource: string; localPath: boolean }
        >();

        for (const collection of collectionsData) {
          if (isBooks) {
            // Fetch book cover
            const bookList = (collection as any).book_list;
            if (bookList && Array.isArray(bookList) && bookList.length > 0) {
              const firstBookId = bookList[0];
              const { data: bookData, error: bookError } = await supabase
                .from("books")
                .select("cover_image")
                .eq("id", firstBookId)
                .maybeSingle();

              if (!bookError && bookData?.cover_image) {
                thumbnailsMap.set(collection.id, {
                  imageSource: `https://covers.openlibrary.org/b/id/${bookData.cover_image}-M.jpg`,
                  localPath: false,
                });
              } else {
                thumbnailsMap.set(collection.id, {
                  imageSource: "brokenImage",
                  localPath: true,
                });
              }
            } else {
              thumbnailsMap.set(collection.id, {
                imageSource: "brokenImage",
                localPath: true,
              });
            }
          } else {
            // Fetch movie poster
            if (collection.movie_list && collection.movie_list.length > 0) {
              const firstMovieId = collection.movie_list[0];
              const { data: movieData, error: movieError } = await supabase
                .from("movies")
                .select("poster_path")
                .eq("id", firstMovieId)
                .maybeSingle();

              if (!movieError && movieData?.poster_path) {
                const posterPath = movieData.poster_path.startsWith("/")
                  ? movieData.poster_path
                  : `/${movieData.poster_path}`;
                thumbnailsMap.set(collection.id, {
                  imageSource: `https://image.tmdb.org/t/p/w500${posterPath}`,
                  localPath: false,
                });
              } else {
                thumbnailsMap.set(collection.id, {
                  imageSource: "brokenImage",
                  localPath: true,
                });
              }
            } else {
              thumbnailsMap.set(collection.id, {
                imageSource: "brokenImage",
                localPath: true,
              });
            }
          }
        }

        setCollectionThumbnails(thumbnailsMap);
      }
    } catch (err: any) {
      console.error("Error fetching collections:", err);
    }
  };

  const open = async (id: number) => {
    setItemId(id);
    await fetchCollectionsForModal(id);
    setModalVisible(true);
  };

  useImperativeHandle(ref, () => ({
    open,
  }));

  const toggleCollectionSelection = (collectionId: number) => {
    const newSelected = new Set(selectedCollectionIds);
    if (newSelected.has(collectionId)) {
      newSelected.delete(collectionId);
    } else {
      newSelected.add(collectionId);
    }
    setSelectedCollectionIds(newSelected);
  };

  const handleUpdateCollections = async () => {
    if (!itemId) return;

    try {
      setUpdating(true);

      // Update all collections
      for (const collection of collections) {
        const isSelected = selectedCollectionIds.has(collection.id);
        
        if (isBooks) {
          // Handle book collections
          const bookList = (collection as any).book_list || [];
          const currentlyHasItem = Array.isArray(bookList) && bookList.includes(itemId);

          // Only update if the state has changed
          if (isSelected !== currentlyHasItem) {
            let updatedBookList: number[];
            
            if (isSelected) {
              // Add book to collection
              updatedBookList = [...bookList, itemId];
            } else {
              // Remove book from collection
              updatedBookList = bookList.filter((id: number) => id !== itemId);
            }

            const { error: updateError } = await supabase
              .from("collections")
              .update({
                book_list: updatedBookList,
                movie_list: null,
                updated_at: new Date().toISOString(),
              } as any)
              .eq("id", collection.id)
              .is("movie_list", null);

            if (updateError) {
              throw updateError;
            }
          }
        } else {
          // Handle movie collections
          const currentlyHasItem = collection.movie_list?.includes(itemId) || false;

          // Only update if the state has changed
          if (isSelected !== currentlyHasItem) {
            let updatedMovieList: number[];
            
            if (isSelected) {
              // Add movie to collection
              updatedMovieList = [...(collection.movie_list || []), itemId];
            } else {
              // Remove movie from collection
              updatedMovieList = (collection.movie_list || []).filter((id) => id !== itemId);
            }

            const { error: updateError } = await supabase
              .from("collections")
              .update({
                movie_list: updatedMovieList,
                book_list: null,
                updated_at: new Date().toISOString(),
              } as any)
              .eq("id", collection.id)
              .is("book_list", null);

            if (updateError) {
              throw updateError;
            }
          }
        }
      }

      // Close modal and reset
      setModalVisible(false);
      setSelectedCollectionIds(new Set());
    } catch (err: any) {
      console.error("Error updating collections:", err);
      // You might want to show an alert here
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedCollectionIds(new Set());
    setItemId(null);
  };

  return (
    <>
      {/* Add to Collection Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add to Collection</Text>
            
            <ScrollView style={styles.modalScrollView}>
              {collections.length > 0 ? (
                <FlatList
                  data={collections}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                  renderItem={({ item }) => {
                    const thumbnail = collectionThumbnails.get(item.id);
                    const numberOfItems = isBooks 
                      ? ((item as any).book_list?.length || 0)
                      : (item.movie_list?.length || 0);
                    const isSelected = selectedCollectionIds.has(item.id);
                    const cardBackgroundColor = isSelected 
                      ? colors.primary 
                      : colors.grey;

                    return (
                      <Pressable
                        onPress={() => toggleCollectionSelection(item.id)}
                        style={({ pressed }) => [
                          { opacity: pressed ? 0.7 : 1 },
                        ]}
                      >
                        <GeneralCard
                          image={thumbnail?.imageSource || "brokenImage"}
                          localPath={thumbnail?.localPath ?? true}
                          name={item.name}
                          leftSubText={`${numberOfItems} ${numberOfItems === 1 ? "item" : "items"}`}
                          rightSubText={
                            item.updated_at
                              ? new Date(item.updated_at).toLocaleDateString()
                              : undefined
                          }
                          backgroundColor={cardBackgroundColor}
                        />
                      </Pressable>
                    );
                  }}
                  contentContainerStyle={styles.collectionsList}
                />
              ) : (
                <View style={styles.emptyModalContainer}>
                  <Text style={styles.emptyModalText}>
                    No collections found. Create a collection in the Library tab.
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalButtonContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButtonCancel,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
                onPress={handleCloseModal}
              >
                <Text style={[styles.modalButtonText, {color: colors.white}]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButtonUpdate,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
                onPress={handleUpdateCollections}
                disabled={updating}
              >
                <Text style={[styles.modalButtonText, {color: colors.background}]}>
                  {updating ? "Updating..." : "Update"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
});

AddToCollection.displayName = "AddToCollection";

function getStyles(colors:colorsType){  
  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalBox: {
      backgroundColor: colors.background,
      width: "90%",
      maxHeight: "80%",
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
    modalScrollView: {
      maxHeight: 400,
      marginBottom: 20,
    },
    collectionsList: {
      paddingBottom: 10,
    },
    emptyModalContainer: {
      padding: 20,
      alignItems: "center",
    },
    emptyModalText: {
      fontSize: 16,
      color: colors.secondary,
      textAlign: "center",
    },
    modalButtonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    modalButtonCancel: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.danger,
    },
    modalButtonUpdate: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.secondary,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: "bold"
    },
  });
  return styles
}

export default AddToCollection;

