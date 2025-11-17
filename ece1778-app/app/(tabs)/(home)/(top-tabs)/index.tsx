import MonthlyRecap from "@app/components/MonthlyRecap";
import { useAuthContext } from "@app/contexts/AuthContext";
import { globalStyles } from "@app/styles/globalStyles";
import { router } from "expo-router";
import {Pressable, ScrollView, Text } from "react-native";
import * as Notifications from "expo-notifications"
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Tables } from "@app/types/database.types";
import { supabase } from "@app/lib/supabase.web";

type Movie = Tables<"movies">;
export default function TabAll() {
  const { isLoggedIn,profile } = useAuthContext();
  const firstDay = new Date(new Date().getFullYear(),new Date().getMonth() - 1, 1)
  const lastDay = new Date(new Date().getFullYear(),new Date().getMonth() - 1, 1)
  const [movies, setMovies] = useState<Movie[]>([]);
  const [reviews, setReviews] = useState<any>([]);
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
      if (!isLoggedIn) return;
      console.log("here")
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
      if(!profile) return
      const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: reviewData, error: reviewError } = await supabase
          .from("reviews")
          .select(`id,rating,review,user_id,profiles (username)`)
          .eq("user_id", profile.id)
          .order("id", { ascending: true });        
        
          // console.log(reviewData)

      
        if (reviewError) {
          throw (reviewError);
        }
        const filtered_reviews = reviewData
				.filter(r => r.review !== null || r.user_id === profile?.id)
				.map(r => ({
					id: r.id,
					user_id: r.user_id,
					username: r.profiles?.username ?? "Anonymous",
					rating: r.rating,
					review: r.review
				}));

        setReviews(filtered_reviews || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch reviews");
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };
      fetchMovies();
      fetchReviews();
    }, [isLoggedIn]);
  async function registerForNotifications(){ await Notifications.requestPermissionsAsync();}

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={[globalStyles.container, globalStyles.center]} edges={['bottom', 'left', 'right']}>
        <Text style={globalStyles.errorText}>Error: User not authenticated</Text>
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

  return (
    <SafeAreaView style={globalStyles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView>
        <Text style={globalStyles.titleText}>Media Recap</Text>
        <MonthlyRecap user="User" type="Movie" action="Watched" data={movies} review={reviews[0]}></MonthlyRecap>
        <MonthlyRecap user="User" type="Book" action="Read" data={movies}></MonthlyRecap>
      </ScrollView>
    </SafeAreaView>
  );
}