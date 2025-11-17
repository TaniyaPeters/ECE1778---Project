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
  const [monthlyLoading, setMonthlyLoading] = useState<boolean>(true);
  const [monthlyError, setMonthlyError] = useState<string | null>(null);
  const [monthlyMovies, setMonthlyMovies] = useState<Movie[]>([]);
  const [monthlyReviews, setMonthlyReviews] = useState<any[]>([]);
  const lastDay = new Date(new Date().getFullYear(),new Date().getMonth(),0).toISOString()
  const firstDay = new Date(new Date().getFullYear(),new Date().getMonth() - 1, 1).toISOString()
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
    const fetchData = async () => {
        try {
          setMonthlyLoading(true);
          setMonthlyError(null);  
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
          if (sessionError || !session?.user?.id) {
            throw new Error("User not authenticated");
          }
  
          const { data: reviewData, error: reviewError } = await supabase
            .from("reviews")
            .select(`movie_id, id,rating,review,user_id,profiles (username)`)
            .eq("user_id", session.user.id)
            .gt('updated_at',firstDay)
            .lt('updated_at',lastDay)
            .order("updated_at", { ascending: false });        

          if (reviewError) {
            throw (reviewError);
          }
          const movieIds = reviewData.map((item)=>{return item.movie_id})
          const { data: moviesData, error: moviesError } = await supabase
            .from("movies")
            .select("*")
            .in('id', movieIds);
  
          if (moviesError) {
            throw moviesError;
          }
          const filtered_reviews = reviewData
            .filter(r => r.review !== null || r.user_id === session.user.id)
            .map(r => ({
            id: r.id,
            user_id: r.user_id,
            username: r.profiles?.username ?? "Anonymous",
            rating: r.rating,
            review: r.review
          }));

          setMonthlyReviews(filtered_reviews || []);
          setMonthlyMovies(moviesData || []);
        } catch (err: any) {
          setError(err.message || "Failed to fetch movies or reviews");
          console.error("Error fetching movies or reviews:", err);
        } finally {
          setMonthlyLoading(false);
        }
      };
    fetchMovies();
    fetchData();

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

  if (loading || monthlyLoading) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.light.secondary} />
        <Text style={styles.loadingText}>Loading movies...</Text>
      </SafeAreaView>
    );
  }

  if (error || monthlyError) {
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
        <MonthlyRecap type="Movie" action="Watched" data={monthlyMovies} review={monthlyReviews}></MonthlyRecap>
        
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