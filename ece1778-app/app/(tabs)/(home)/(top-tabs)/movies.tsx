import React, { useEffect, useState } from "react";
import GeneralCard from "@app/components/generalCard";
import MonthlyRecap from "@app/components/MonthlyRecap";
import { globalStyles } from "@app/styles/globalStyles";
import { router } from "expo-router";
import { 
  ScrollView, 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../../lib/supabase.web";
import { Tables } from "../../../../types/database.types";
import { colors } from "../../../../constants/colors";

type Movie = Tables<"movies">;

export default function TabMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.light.secondary} />
        <Text style={styles.loadingText}>Loading movies...</Text>
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

  return (
      <ScrollView style={globalStyles.container}>
        <Text style={globalStyles.titleText}>Movies Tab</Text>
        <MonthlyRecap user="User" type="Movie" action="Watched"></MonthlyRecap>
        
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