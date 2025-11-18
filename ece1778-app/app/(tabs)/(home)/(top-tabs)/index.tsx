import MonthlyRecap from "@app/components/MonthlyRecap";
import { useAuthContext } from "@app/contexts/AuthContext";
import { globalStyles } from "@app/styles/globalStyles";
import { router } from "expo-router";
import {ActivityIndicator, Pressable, ScrollView, Text } from "react-native";
import * as Notifications from "expo-notifications"
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Tables } from "@app/types/database.types";
import { supabase } from "@app/lib/supabase.web";
import { colors } from "@app/constants/colors";
import { StyleSheet } from "react-native";

type Movie = Tables<"movies">;
export default function TabAll() {
  const { isLoggedIn } = useAuthContext();
  const lastDay = new Date(new Date().getFullYear(),new Date().getMonth(),0).toISOString()
  const firstDay = new Date(new Date().getFullYear(),new Date().getMonth() - 1, 1).toISOString()
  const [movies, setMovies] = useState<Movie[]>([]);
  const [highestMovies, setHighestMovies] = useState<Movie[]>([]);
  const [highestRating, setHighestRating] = useState<number>(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    registerForNotifications();
  }, []);
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log(
          "User tapped notification:",
          response.notification.request.content
        );
      }
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);  
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
          if (sessionError || !session?.user?.id) {
            throw Error("User not authenticated");
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
          console.log('here')

          setReviews(filtered_reviews || []);
          setMovies(moviesData || []);
          if (reviewData){
            reviewData.sort(
              (a,b) =>{
                if(a.rating == null){a.rating =0}
                if(b.rating == null){b.rating = 0}
                return b.rating - a.rating
              })
          }
          const highestScore = reviewData[0].rating;

          const highestReviews = reviewData
          .filter((index) => index.rating == highestScore)
          .map((index)=> index.movie_id);
 
          const highestMovies = moviesData.filter((index)=>(highestReviews.includes(index.id)));
          console.log(highestMovies)
          setHighestMovies(highestMovies||[]);
          setHighestRating(highestScore||0);
        } catch (err: any) {
            // setError(err.message || "Failed to fetch movies or reviews");
            // console.error("Error fetching movies or reviews:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [isLoggedIn]);
  async function registerForNotifications(){ await Notifications.requestPermissionsAsync();}

  if (!isLoggedIn||error) {
    return (
      <SafeAreaView style={[globalStyles.container, globalStyles.center]} edges={['bottom', 'left', 'right']}>
        <Text style={globalStyles.errorText}>Error: {error}</Text>
        <Text style={globalStyles.errorDescriptionText}>Please login to view your media recap.</Text>
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
      <SafeAreaView style={[globalStyles.container, globalStyles.center]} edges={['bottom', 'left', 'right']}>
        <ActivityIndicator size="large" color={colors.light.secondary} />
        <Text style={globalStyles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView>
        <Text style={globalStyles.titleText}>Media Recap</Text>
        <MonthlyRecap type="Movie" action="Watched" data={movies} review={reviews} highestRating={highestRating} highestRatedMedia={highestMovies}></MonthlyRecap>
        <MonthlyRecap type="Book" action="Read" data={movies} review={reviews}></MonthlyRecap>
      </ScrollView>
    </SafeAreaView>
  );
}