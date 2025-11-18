import React, { useEffect, useState, useRef } from "react";
import GeneralCard from "@app/components/generalCard";
import MonthlyRecap from "@app/components/MonthlyRecap";
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
import { supabase } from "../../../../lib/supabase.web";
import { Tables } from "../../../../types/database.types";
import { colors } from "../../../../constants/colors";
import { useAuthContext } from "@app/contexts/AuthContext";

type Movie = Tables<"movies">;

export default function TabMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn } = useAuthContext();
  const addToCollectionRef = useRef<AddToCollectionHandle>(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchMovies = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={[globalStyles.container, globalStyles.center]} edges={['bottom', 'left', 'right']}>
        <Text style={globalStyles.errorText}>Error: User not authenticated</Text>
        <Text style={globalStyles.errorDescriptionText}>Please login to view the available movies.</Text>
        <Pressable
          style={({ pressed }: { pressed: boolean }) => [
            globalStyles.errorLoginButton,
            { opacity: pressed ? 0.6 : 1, },
          ]}
          onPress={() => router.push('/account')}
        >
          <Text style={globalStyles.errorDescriptionText}>Login</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.light.secondary} />
        <Text style={globalStyles.loadingText}>Loading movies...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  const handleAddToCollection = (movieId: number) => {
    addToCollectionRef.current?.open(movieId);
  };

  return (
    <SafeAreaView style={globalStyles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView>
        <Text style={globalStyles.titleText}>Movies Tab</Text>        
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

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: colors.light.danger,
    textAlign: "center",
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