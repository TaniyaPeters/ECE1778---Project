import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../../lib/supabase.web";
import { Tables } from "../../../../types/database.types";
import GeneralCard from "../../../../components/generalCard";
import { globalStyles } from "../../../../styles/globalStyles";
import { colors } from "../../../../constants/colors";
import { dimentions } from "../../../../constants/dimentions";
import { getLocalImage } from "../../../../constants/postersMap";
import AutoImage from "../../../../components/autoScaledImage";

type Collection = Tables<"collections">;
type Movie = Tables<"movies">;

export default function CollectionScreen() {
  const { id } = useLocalSearchParams();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        setError(null);

        // Convert id to number
        const collectionId = typeof id === "string" ? parseInt(id, 10) : Number(id);
        
        if (isNaN(collectionId)) {
          throw new Error("Invalid collection ID");
        }

        // Fetch collection data
        const { data: collectionData, error: collectionError } = await supabase
          .from("collections")
          .select("*")
          .eq("id", collectionId)
          .maybeSingle();

        // Debug logging
        console.log("Fetching collection:", {
          collectionId,
          collectionError,
          collectionData,
          hasData: !!collectionData,
        });

        if (collectionError) {
          console.error("Collection error details:", collectionError);
          throw collectionError;
        }

        if (!collectionData) {
          // Check if there's an auth issue
          const { data: { session } } = await supabase.auth.getSession();
          console.log("Session check:", { hasSession: !!session, userId: session?.user?.id });
          throw new Error(`Collection with ID ${collectionId} not found. This may be due to Row Level Security (RLS) or the collection belonging to a different user.`);
        }

        setCollection(collectionData);

        // Fetch movies if collection has a movie_list
        if (collectionData?.movie_list && collectionData.movie_list.length > 0) {
          const { data: moviesData, error: moviesError } = await supabase
            .from("movies")
            .select("*")
            .in("id", collectionData.movie_list);

          if (moviesError) {
            throw moviesError;
          }

          // Sort movies to match the order in movie_list
          const sortedMovies = collectionData.movie_list
            .map((movieId) => moviesData?.find((m) => m.id === movieId))
            .filter((m): m is Movie => m !== undefined);

          setMovies(sortedMovies);
        } else {
          setMovies([]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch collection");
        console.error("Error fetching collection:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCollection();
    }
  }, [id]);

  // Get collection thumbnail (use first movie's poster or default)
  const getCollectionThumbnail = () => {
    console.log("movies[0].poster_path", movies[0].poster_path);
    if (movies.length > 0 && movies[0].poster_path) {
      // Use TMDB poster URL - poster_path should be a poster path (e.g., "/abc123.jpg")
      const posterPath = movies[0].poster_path.startsWith("/")
        ? movies[0].poster_path
        : `/${movies[0].poster_path}`;
      return {
        uri: `https://image.tmdb.org/t/p/w500${posterPath}`,
        localPath: false,
      };
    } else if (movies.length > 0) {
      // Fallback to local image
      return {
        uri: null,
        localPath: true,
        key: "brokenImage.png", // Default fallback
      };
    }
    return null;
  };

  if (loading) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.center]} edges={['bottom', 'left', 'right']}>
        <ActivityIndicator size="large" color={colors.light.secondary} />
        <Text style={styles.loadingText}>Loading collection...</Text>
      </SafeAreaView>
    );
  }

  if (error || !collection) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.center]} edges={['bottom', 'left', 'right']}>
        <Text style={styles.errorText}>
          {error || "Collection not found"}
        </Text>
      </SafeAreaView>
    );
  }

  const thumbnail = getCollectionThumbnail();
  const numberOfItems = collection.movie_list?.length || 0;

  return (
    <SafeAreaView style={globalStyles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView>
        {/* Collection Header */}
        <View style={styles.headerContainer}>
          {/* Collection Thumbnail */}
          {thumbnail && (
            <View style={styles.thumbnailContainer}>
              {thumbnail.localPath ? (
                <AutoImage
                  style={styles.thumbnail}
                  source={
                    thumbnail.key
                      ? getLocalImage(thumbnail.key)
                      : getLocalImage("brokenImage.png")
                  }
                />
              ) : (
                <Image
                  style={styles.thumbnail}
                  source={{ uri: thumbnail.uri! }}
                  resizeMode="cover"
                />
              )}
            </View>
          )}

          {/* Collection Name */}
          <Text style={styles.collectionName}>{collection.name}</Text>

          {/* Number of Items */}
          <Text style={styles.itemCount}>
            {numberOfItems} {numberOfItems === 1 ? "item" : "items"}
          </Text>
        </View>

        {/* Movies List */}
        {movies.length > 0 ? (
          <View style={styles.moviesContainer}>
            <Text style={styles.sectionTitle}>Movies in Collection</Text>
            <FlatList
              data={movies}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false} // Use ScrollView's scrolling instead
              renderItem={({ item }) => {
                // Determine image source for the movie
                let imageSource: string;
                let localPath: boolean = false;

                if (item.poster_path) {
                  // Use TMDB poster URL - poster_path should be a poster path (e.g., "/abc123.jpg")
                  const posterPath = item.poster_path.startsWith("/")
                    ? item.poster_path
                    : `/${item.poster_path}`;
                  imageSource = `https://image.tmdb.org/t/p/w500${posterPath}`;
                  localPath = false;
                } else {
                  // Fallback to local image
                  imageSource = "interstellar";
                  localPath = true;
                }

                return (
                  <GeneralCard
                    image={imageSource}
                    localPath={localPath}
                    name={item.title}
                    views={true}
                    leftSubText={
                      item.release_date
                        ? item.release_date
                        : undefined
                    }
                    rightSubText={
                      item.rating_count
                        ? item.rating_count.toFixed(1)
                        : '0'
                    }
                    starRating={item.avg_rating ? item.avg_rating : 0}
                  />
                );
              }}
              contentContainerStyle={styles.moviesList}
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              This collection doesn't have any movies yet.
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
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 20,
  },
  thumbnailContainer: {
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  thumbnail: {
    width: dimentions.windowWidth * 0.4,
    height: dimentions.windowWidth * 0.4 * 1.5, // 2:3 poster aspect ratio
    borderRadius: 12,
  },
  collectionName: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.light.secondary,
    textAlign: "center",
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 18,
    color: colors.light.black,
    textAlign: "center",
  },
  moviesContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.light.secondary,
    marginBottom: 12,
    marginLeft: 5,
  },
  moviesList: {
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

