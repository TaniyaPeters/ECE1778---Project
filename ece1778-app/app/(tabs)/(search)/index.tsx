import { useEffect, useState } from "react";
import { View, ScrollView, Text, TextInput, Pressable, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import { globalStyles } from "@styles/globalStyles";
import GeneralCard from "@app/components/generalCard";
import { Tables } from "../../../types/database.types";
import { colors } from "@constants/colors";
import { supabase } from "@lib/supabase.web";

type Movie = Tables<"movies">;

export default function Search() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchString, setSearchString] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  //Retrieve movies from movies table
  async function retrieveMovies() {
		try {
      setLoading(true);
      setError(null);

      //Retrieves all movies with title containing the search string (case insensitive)
      //Note: if search string is empty ("") then all movies are returned
      const { data: moviesData, error: moviesError } = await supabase
        .from("movies")
        .select("*")
        .ilike('title', `%${searchString.trim()}%`);

      if (moviesError) {
        setMovies([]);
        throw moviesError;
      }

      setMovies(moviesData || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch movies");
      console.error("Error fetching movies:", err);
    } finally {
      setLoading(false);
    }
  }

  //Display all movies when screen is first opened
  useEffect(() => {
    retrieveMovies(); 
  }, []);

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.titleText}>Search Screen</Text>
      <View style={styles.horizontalContainer}>
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Search for movies..."
            value={searchString}
            onChangeText={setSearchString}
            placeholderTextColor={colors.light.black}
          />
          {searchString.length > 0 && (
            <Pressable
              style={({ pressed }: { pressed: boolean }) => [
                styles.clearButton, { opacity: pressed ? 0.6 : 1},
              ]}
              onPress={() => setSearchString("")}
            >
              <Text style={styles.clearButtonText}>x</Text>
            </Pressable>
          )}
        </View>

        <Pressable
          style={({ pressed }: { pressed: boolean }) => [
            styles.searchButton, { opacity: pressed ? 0.6 : 1},
          ]}
          onPress={retrieveMovies}
        >
          <Text style={[globalStyles.paragraphBold, styles.searchButtonText]}>Search</Text>
        </Pressable>
      </View>

      {loading && (
        <View style={[globalStyles.container, styles.center]}>
          <ActivityIndicator size="large" color={colors.light.secondary} />
          <Text style={styles.loadingText}>Loading movies...</Text>
        </View>
      )}

      {error && (
        <View style={[globalStyles.container, styles.center]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

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
  horizontalContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 14,
    paddingBottom: 15,
	},
  searchWrapper: {
    flex: 4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.light.background,
    borderWidth: 1,
    borderColor: colors.light.secondary,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 50,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.light.black,
  },
  clearButton: {
    marginLeft: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#929292ff",
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    color: colors.light.background,
    fontSize: 14,
    fontWeight: "bold",
    lineHeight: 16,
  },
  searchButton: {
    flex: 1,
		height: 50,
		borderRadius: 15,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.light.secondary,
    paddingHorizontal: 10,
	},
	searchButtonText: {
		fontSize: 14,
		color: colors.light.background
	},
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