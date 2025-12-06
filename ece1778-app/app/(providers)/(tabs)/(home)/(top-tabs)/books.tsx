import React, { useEffect, useState, useRef } from "react";
import GeneralCard from "@app/components/generalCard";
import AddToCollection, { AddToCollectionHandle } from "@app/components/AddToCollection";
import { globalStyles } from "@app/styles/globalStyles";
import { router } from "expo-router";
import { 
  ScrollView, 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  Pressable
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@lib/supabase.web";
import { Tables } from "@app/types/database.types";
import { useAuthContext } from "@app/contexts/AuthContext";
import { useSelector } from "react-redux";
import { RootState } from "@app/store/store";
import { selectTheme } from "@app/features/theme/themeSlice";
import { colorsType } from "@app/types/types";
type Book = Tables<"books">;

export default function TabBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn } = useAuthContext();
  const addToCollectionRef = useRef<AddToCollectionHandle>(null);
  const colors = useSelector((state:RootState)=>selectTheme(state));
  const styles = getStyles(colors)
  const setGlobalStyles = globalStyles()

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: booksData, error: booksError } = await supabase
          .from("books")
          .select("*")
          .order("publish_year", { ascending: false });

        if (booksError) {
          throw booksError;
        }

        setBooks(booksData || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch books");
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={[setGlobalStyles.container, setGlobalStyles.center]} edges={['bottom', 'left', 'right']}>
        <Text style={setGlobalStyles.errorText}>Error: User not authenticated</Text>
        <Text style={setGlobalStyles.errorDescriptionText}>Please login to view the available books.</Text>
        <Pressable
          style={({ pressed }: { pressed: boolean }) => [
            setGlobalStyles.errorLoginButton,
            { opacity: pressed ? 0.6 : 1, },
          ]}
          onPress={() => router.push('/account')}
        >
          <Text style={setGlobalStyles.errorDescriptionText}>Login</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[setGlobalStyles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={setGlobalStyles.loadingText}>Loading books...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[setGlobalStyles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  const handleAddToCollection = (bookId: number) => {
    addToCollectionRef.current?.open(bookId);
  };
return (
    <SafeAreaView style={setGlobalStyles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView>
        {books.length > 0 ? (
          <View>
            <FlatList
              data={books}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false} // Use ScrollView's scrolling instead
              renderItem={({ item }) => {
                // Determine image source for the book
                let imageSource: string;
                let localPath: boolean = false;

                if (item.cover_image) {
                  // Use openlibrary poster URL - cover_image should be a poster path (e.g., "/abc123-M.jpg")
                  const posterPath = item.cover_image.startsWith("/")
                    ? item.cover_image
                    : `/${item.cover_image}`;
                  imageSource = `https://covers.openlibrary.org/b/id${posterPath}-M.jpg`;
                  localPath = false;
                } else {
                  // Fallback to local image
                  imageSource = "brokenImage";
                  localPath = true;
                }

                return (
                  <TouchableOpacity
                    onPress={() => router.push(`../movieDetails/${item.id}`)}
                    activeOpacity={0.7}
                  >
                    <GeneralCard
                      image={imageSource}
                      localPath={localPath}
                      name={item.title}
                      views={true}
                      leftSubText={
                        item.publish_year
                          ? item.publish_year
                          : undefined
                      }
                      rightSubText={
                        item.rating_count
                          ? item.rating_count.toFixed(1)
                          : '0'
                      }
                      add
                      addFunction={() => handleAddToCollection(item.id)}
                      starRating={item.avg_rating ? item.avg_rating : 0}
                    />
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No books found in the database.
            </Text>
          </View>
        )}
      </ScrollView>

      <AddToCollection ref={addToCollectionRef} />
    </SafeAreaView>
  );
}

function getStyles(colors:colorsType){
  const styles = StyleSheet.create({
      center: {
        justifyContent: "center",
        alignItems: "center",
      },
      errorText: {
        fontSize: 18,
        color: colors.danger,
        textAlign: "center",
      },
      emptyContainer: {
        padding: 20,
        alignItems: "center",
        marginTop: 40,
      },
      emptyText: {
        fontSize: 18,
        color: colors.secondary,
        textAlign: "center",
      },
      });
    return styles
}