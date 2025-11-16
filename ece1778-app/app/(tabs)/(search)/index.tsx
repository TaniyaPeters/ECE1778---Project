import { useEffect, useState } from "react";
import { View, ScrollView, Text, TextInput, Pressable, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dropdown } from 'react-native-element-dropdown';
import { router } from "expo-router";
import { globalStyles } from "@styles/globalStyles";
import GeneralCard from "@app/components/generalCard";
import { Tables } from "../../../types/database.types";
import { colors } from "@constants/colors";
import { supabase } from "@lib/supabase.web";
import { useAuthContext } from "@app/contexts/AuthContext";

type Movie = Tables<"movies">;

export default function Search() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchString, setSearchString] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [genreFilter, setGenreFilter] = useState<string | null>(null);
  const [dateSort, setDateSort] = useState<'asc' | 'desc' | null>(null);
  const { isLoggedIn } = useAuthContext();

  //Retrieve movies from movies table
  async function retrieveMovies() {
		try {
      setLoading(true);
      setError(null);

      //Retrieves all movies with title containing the search string (case insensitive)
      //Note: if search string is empty ("") then all movies are returned
      let query = supabase
        .from("movies")
        .select("*")
        .ilike('title', `%${searchString.trim()}%`);

      if (genreFilter) {
        query = query.contains("genres", [genreFilter]);
      }

      if (dateSort) {
        query = query.order("release_date", { ascending: dateSort === "asc"});
      }
      
      const { data: moviesData, error: moviesError } = await query;

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

  //Get all unique genres in database
  async function retrieveGenres() {
    const { data, error } = await supabase
      .from("movies")
      .select("genres");
    if (data) {
      const allGenres = Array.from(
        new Set(data.flatMap((movie) => movie.genres || []))
      );
      setAvailableGenres(allGenres.sort());
    }
  }

  //Display all movies when screen is first opened
  useEffect(() => {
    if (!isLoggedIn) return;
    retrieveMovies(); 
    retrieveGenres();
  }, [isLoggedIn]);

  //Update results when filter/sort is updated
  useEffect(() => {
    retrieveMovies(); 
  }, [genreFilter, dateSort]);

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={[globalStyles.container, globalStyles.center]} edges={['bottom', 'left', 'right']}>
        <Text style={globalStyles.errorText}>Error: User not authenticated</Text>
        <Text style={globalStyles.errorDescriptionText}>Please login to search for movies.</Text>
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

  return (
    <ScrollView style={globalStyles.container}>
      <View style={styles.horizontalContainer}>
        {/* Search bar */}
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

      <View style={styles.filterContainer}>
        {/* Genre filter */}
        <Text style={[globalStyles.paragraph, styles.dropdownLabel]}>Genre: </Text>
        <Dropdown
          style={styles.dropdown}
          data={[
            { label: "All Genres", value: null },
            ...availableGenres.map((g) => ({ label: g, value: g})),
          ]}
          labelField="label"
          valueField="value"
          placeholder="All Genres"
          value={genreFilter}
          onChange={(item) => setGenreFilter(item.value)}
        />

        {/* Sort by release date */}
        <Text style={[globalStyles.paragraph, styles.dropdownLabel]}>Sort: </Text>
        <Dropdown
          style={styles.dropdown}
          data={[
            { label: 'No Sorting', value: null},
            { label: 'Newest → Oldest', value: 'desc' },
            { label: 'Oldest → Newest', value: 'asc'},
          ]}
          labelField="label"
          valueField="value"
          placeholder="No Sorting"
          value={dateSort}
          onChange={(item) => setDateSort(item.value)}
        />
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
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingVertical: 4,
    backgroundColor: colors.light.background,
  },
  dropdownLabel: {
    fontSize: 15,
  },
  dropdown: {
    flex: 1,
    height: 45,
    borderColor: colors.light.secondary,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
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