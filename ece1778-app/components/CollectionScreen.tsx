import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useNavigation, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@lib/supabase.web";
import { Tables } from "@app/types/database.types";
import GeneralCard from "@components/generalCard";
import { globalStyles } from "@styles/globalStyles";
import { dimentions } from "@constants/dimentions";
import { useSelector } from "react-redux";
import { RootState } from "@app/store/store";
import { selectTheme } from "@app/features/theme/themeSlice";
import { colorsType } from "@app/types/types";

type Collection = Tables<"collections">;
type Movie = Tables<"movies">;

type CollectionScreenProps = {
  movieDetailsPath?: string; // Optional path for movie details navigation
};

export default function CollectionScreen({ movieDetailsPath = "../../movieDetails" }: CollectionScreenProps) {
  const { id, username } = useLocalSearchParams();
  const navigation = useNavigation();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnCollection, setIsOwnCollection] = useState<boolean>(false);
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
	const colors = useSelector((state:RootState)=>selectTheme(state));
  const styles = getStyles(colors)
  const setGlobalStyles = globalStyles()

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

        if (collectionError) {
          console.error("Collection error details:", collectionError);
          throw collectionError;
        }

        if (!collectionData) {
          const { data: { session } } = await supabase.auth.getSession();
          console.log("Session check:", { hasSession: !!session, userId: session?.user?.id });
          throw new Error(`Collection with ID ${collectionId} not found. This may be due to Row Level Security (RLS) or the collection belonging to a different user.`);
        }

        setCollection(collectionData);

        // Check if this collection belongs to the current user
        const { data: { session } } = await supabase.auth.getSession();
        const isOwn = session?.user?.id === collectionData.user_id;
        setIsOwnCollection(isOwn);

        // If username is passed as param, use it; otherwise fetch the profile
        let displayUsername: string | null = null;
        if (username && typeof username === 'string') {
          displayUsername = username;
          setProfileUsername(username);
        } else if (!isOwn && collectionData.name === "Watched") {
          // Fetch the profile username for other users' Watched collections
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", collectionData.user_id)
            .maybeSingle();
          
          if (!profileError && profileData?.username) {
            displayUsername = profileData.username;
            setProfileUsername(profileData.username);
          }
        }

        // Update navigation header title with collection name
        if (collectionData?.name) {
          let title = collectionData.name;
          if (collectionData.name === "Watched" && displayUsername && !isOwn) {
            title = `${displayUsername}'s Watched Collection`;
          }
          navigation.setOptions({
            title: title,
          });
        }

        // Fetch movies if collection has a movie_list
        if (collectionData?.movie_list && collectionData.movie_list.length > 0) {
          const { data: moviesData, error: moviesError } = await supabase
            .from("movies")
            .select("*")
            .in("id", collectionData.movie_list);

          if (moviesError) {
            throw moviesError;
          }

          // Order movies by when they were added to the collection
          const insertionOrderMovies = collectionData.movie_list
            .map((movieId) => moviesData?.find((m) => m.id === movieId))
            .filter((m): m is Movie => m !== undefined);

          const displayOrderMovies = [...insertionOrderMovies].reverse();

          setMovies(displayOrderMovies);
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
  }, [id, username]);

  const handleRemoveMovieFromCollection = async (movieId: number) => {
    if (!collection) return;

    try {
      const updatedMovieList = (collection.movie_list || []).filter((id) => id !== movieId);

      const { error: updateError } = await supabase
        .from("collections")
        .update({
          movie_list: updatedMovieList,
          updated_at: new Date().toISOString(),
        })
        .eq("id", collection.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state to reflect the change
      setCollection({ ...collection, movie_list: updatedMovieList });
      setMovies((prevMovies) => prevMovies.filter((movie) => movie.id !== movieId));
    } catch (err) {
      console.error("Error removing movie from collection:", err);
    }
  };

  // Get collection thumbnail (use first movie's poster or default)
  const getCollectionThumbnail = () => {
    // Thumbnail should always be the first movie added to the collection
    if (!collection || !collection.movie_list || collection.movie_list.length === 0) {
      return undefined;
    }

    const firstAddedMovieId = collection.movie_list[0];
    const firstMovie = movies.find((m) => m.id === firstAddedMovieId);

    if (firstMovie && firstMovie.poster_path) {
      const posterPath = firstMovie.poster_path.startsWith("/")
        ? firstMovie.poster_path
        : `/${firstMovie.poster_path}`;
      return `https://image.tmdb.org/t/p/w500${posterPath}`;
    }

    return undefined;
  };

  if (loading) {
    return (
      <SafeAreaView style={[setGlobalStyles.container, setGlobalStyles.center]} edges={['bottom', 'left', 'right']}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={styles.loadingText}>Loading collection...</Text>
      </SafeAreaView>
    );
  }

  if (error || !collection) {
    return (
      <SafeAreaView style={[setGlobalStyles.container, setGlobalStyles.center]} edges={['bottom', 'left', 'right']}>
        <Text style={setGlobalStyles.errorText}>
          {error || "Collection not found"}
        </Text>
      </SafeAreaView>
    );
  }

  const thumbnail = getCollectionThumbnail();
  const numberOfItems = collection.name === "Watched" ? movies.length : (collection.movie_list?.length || 0);

  return (
    <SafeAreaView style={setGlobalStyles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView>
        {/* Collection Header */}
        <View style={styles.headerContainer}>
          {/* Collection Thumbnail */}
          {thumbnail && (
            <View style={styles.thumbnailContainer}>
                <Image
                  style={styles.thumbnail}
                  source={{ uri: thumbnail }}
                  resizeMode="cover"
                />
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
                let imageSource: string | undefined;

                if (item.poster_path) {
                  // Use TMDB poster URL - poster_path should be a poster path (e.g., "/abc123.jpg")
                  const posterPath = item.poster_path.startsWith("/")
                    ? item.poster_path
                    : `/${item.poster_path}`;
                  imageSource = `https://image.tmdb.org/t/p/w500${posterPath}`;
                } else {
                  imageSource = undefined;
                }

                return (
                  <TouchableOpacity
                    onPress={() => router.push(`${movieDetailsPath}/${item.id}` as any)}
                    activeOpacity={0.7}
                  >
                    <GeneralCard
                      image={imageSource}
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
                      del={isOwnCollection}
                      delFunction={async () => await handleRemoveMovieFromCollection(item.id)}
                    />
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={styles.moviesList}
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={setGlobalStyles.errorDescriptionText}>
              This collection doesn't have any movies yet.
            </Text>
          </View>
        )}
      </ScrollView>
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
      color: colors.secondary,
      textAlign: "center",
      marginBottom: 8,
    },
    itemCount: {
      fontSize: 18,
      color: colors.black,
      textAlign: "center",
    },
    moviesContainer: {
      marginTop: 20,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.secondary,
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
  });
  return styles
}

