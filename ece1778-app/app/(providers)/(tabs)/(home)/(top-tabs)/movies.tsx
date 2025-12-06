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
  Pressable,
  RefreshControl
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@lib/supabase.web";
import { Tables } from "@app/types/database.types";
import { useAuthContext } from "@app/contexts/AuthContext";
import { useSelector } from "react-redux";
import { RootState } from "@app/store/store";
import { selectTheme } from "@app/features/theme/themeSlice";
import { colorsType } from "@app/types/types";

type Movie = Tables<"movies">;

export default function TabMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn } = useAuthContext();
  const addToCollectionRef = useRef<AddToCollectionHandle>(null);
	const colors = useSelector((state:RootState)=>selectTheme(state));
  const styles = getStyles(colors)
  const setGlobalStyles = globalStyles()

  const fetchMovies = async () => {
    try {
      setError(null);

      const { data: moviesData, error: moviesError } = await supabase
        .from("movies")
        .select("*")
        .order("release_date", { ascending: false });

      if (moviesError) {
        throw moviesError;
      }

      setMovies(moviesData || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch movies");
      console.error("Error fetching movies:", err);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    const loadMovies = async () => {
      setLoading(true);
      await fetchMovies();
      setLoading(false);
    };
    loadMovies();
  }, [isLoggedIn]);

  const onRefresh = async () => {
    if (!isLoggedIn) return;
    setRefreshing(true);
    await fetchMovies();
    setRefreshing(false);
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={[setGlobalStyles.container, setGlobalStyles.center]} edges={['bottom', 'left', 'right']}>
        <Text style={setGlobalStyles.errorText}>Error: User not authenticated</Text>
        <Text style={setGlobalStyles.errorDescriptionText}>Please login to view the available movies.</Text>
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
        <Text style={setGlobalStyles.loadingText}>Loading movies...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[setGlobalStyles.container, styles.center]}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </SafeAreaView>
    );
  }

  const handleAddToCollection = (movieId: number) => {
    addToCollectionRef.current?.open(movieId);
  };
  
  return (
    <SafeAreaView style={setGlobalStyles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.secondary} />
        }
      >
        {movies.length > 0 ? (
          <View>
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
                        item.release_date
                          ? item.release_date
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
              No movies found in the database.
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