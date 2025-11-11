import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabase.web";
import { Tables } from "../../../types/database.types";
import GeneralCard from "../../../components/generalCard";
import { globalStyles } from "../../../styles/globalStyles";
import { colors } from "../../../constants/colors";

type Collection = Tables<"collections">;
type Movie = Tables<"movies">;

export default function Library() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionThumbnails, setCollectionThumbnails] = useState<
    Map<number, { imageSource: string; localPath: boolean }>
  >(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

        // Fetch collections for the user
        const { data: collectionsData, error: collectionsError } = await supabase
          .from("collections")
          .select("*")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false });

        if (collectionsError) {
          throw collectionsError;
        }

        setCollections(collectionsData || []);

        // Fetch thumbnails for each collection (first movie's poster)
        if (collectionsData && collectionsData.length > 0) {
          const thumbnailsMap = new Map<
            number,
            { imageSource: string; localPath: boolean }
          >();

          for (const collection of collectionsData) {
            if (collection.movie_list && collection.movie_list.length > 0) {
              // Get the first movie's poster
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
                // Fallback to local image
                thumbnailsMap.set(collection.id, {
                  imageSource: "brokenImage",
                  localPath: true,
                });
              }
            } else {
              // No movies in collection, use fallback
              thumbnailsMap.set(collection.id, {
                imageSource: "brokenImage",
                localPath: true,
              });
            }
          }

          setCollectionThumbnails(thumbnailsMap);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch collections");
        console.error("Error fetching collections:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.center]} edges={['bottom', 'left', 'right']}>
        <ActivityIndicator size="large" color={colors.light.secondary} />
        <Text style={styles.loadingText}>Loading collections...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.center]} edges={['bottom', 'left', 'right']}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView>
        <Text style={globalStyles.titleText}>Collections</Text>

        {collections.length > 0 ? (
          <View style={styles.collectionsContainer}>
            <FlatList
              data={collections}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false} // Use ScrollView's scrolling instead
              renderItem={({ item }) => {
                const thumbnail = collectionThumbnails.get(item.id);
                const numberOfItems = item.movie_list?.length || 0;

                return (
                  <TouchableOpacity
                    onPress={() => router.push(`./collection/${item.id}`)}
                    activeOpacity={0.7}
                  >
                    <GeneralCard
                      image={
                        thumbnail?.imageSource || "brokenImage"
                      }
                      localPath={thumbnail?.localPath ?? true}
                      name={item.name}
                      leftSubText={`${numberOfItems} ${numberOfItems === 1 ? "item" : "items"}`}
                      rightSubText={
                        item.updated_at
                          ? new Date(item.updated_at).toLocaleDateString()
                          : undefined
                      }
                    />
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={styles.collectionsList}
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No collections found.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.light.secondary,
  },
  errorText: {
    fontSize: 18,
    color: colors.light.danger,
    textAlign: "center",
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
  emptyText: {
    fontSize: 18,
    color: colors.light.secondary,
    textAlign: "center",
  },
});