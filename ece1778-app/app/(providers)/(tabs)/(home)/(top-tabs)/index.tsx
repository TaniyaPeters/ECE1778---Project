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
import { useSelector } from "react-redux";
import { RootState } from "@app/store/store";
import { selectTheme } from "@app/features/theme/themeSlice";

type Movie = Tables<"movies">;
type Book = Tables<"books">;
export default function TabAll() {
  const { isLoggedIn } = useAuthContext();
  const lastDay = new Date(new Date().getFullYear(),new Date().getMonth(),0).toISOString()
  const firstDay = new Date(new Date().getFullYear(),new Date().getMonth() - 1, 1).toISOString()
  const [movies, setMovies] = useState<Movie[]>([]);
  const [highestMovies, setHighestMovies] = useState<Movie[]>([]);
  const [highestMovieRating, setHighestMovieRating] = useState<number>(0);
  const [books, setBooks] = useState<Book[]>([]);
  const [highestBooks, setHighestBooks] = useState<Book[]>([]);
  const [highestBookRating, setHighestBookRating] = useState<number>(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const colors = useSelector((state:RootState)=>selectTheme(state));
  const setGlobalStyles = globalStyles()

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
            .select(`movie_id, book_id, id,rating,review,user_id,profiles (username)`)
            .eq("user_id", session.user.id)
            .gt('updated_at',firstDay)
            .lt('updated_at',lastDay)
            .order("updated_at", { ascending: false });        

          if (reviewError) {
            throw (reviewError);
          }
          let movieIds:number[] = []
          let highestMRating:number =0
          let movieListIds:number[] =[]
          let bookIds:number[] = []
          let highestBRating:number =0
          let bookListIds:number[] =[]

          for (let item of reviewData) {
            if (item.movie_id != null){
              movieIds.push(Number(item.movie_id))
              bookIds.push(Number(item.movie_id))
              if (item.rating && item.rating > highestMRating){
                movieListIds =[]
                highestMRating = item.rating
                bookListIds =[]
                highestBRating = item.rating

              }
              else if (item.rating ==highestMRating){
                movieListIds.push(item.movie_id)
                bookListIds.push(item.movie_id)

              }
            }
            if (item.book_id != null){
              bookIds.push(Number(item.book_id))
              if (item.rating && item.rating > highestMRating){
                bookListIds =[]
                highestBRating = item.rating
              }
              else if (item.rating ==highestBRating){
                bookListIds.push(item.book_id)
              }
            }
          }
                   
          const { data: moviesData, error: moviesError } = await supabase
          .from("movies")
          .select("*")
          .in('id', movieIds);

          const { data: bookData, error: booksError } = await supabase
          .from("books")
          .select("*")
          .in('id', movieIds);

          if (moviesError) {
            throw moviesError;
          }
          if (booksError) {
            throw booksError;
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
          
          let highestMoviesCheck = moviesData.filter((index)=>(movieListIds.includes(index.id)));
          let highestBooksCheck = bookData.filter((index)=>(bookListIds.includes(index.id)));

          setReviews(filtered_reviews || []);

          setMovies(moviesData || []);
          setHighestMovies(highestMoviesCheck||[]);
          setHighestMovieRating(highestMRating);

          setBooks(bookData || []);
          setHighestBooks(highestBooksCheck||[]);
          setHighestBookRating(highestBRating);

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
      <SafeAreaView style={[setGlobalStyles.container, setGlobalStyles.center]} edges={['bottom', 'left', 'right']}>
        <Text style={setGlobalStyles.errorText}>Error: {error}</Text>
        <Text style={setGlobalStyles.errorDescriptionText}>Please login to view your media recap.</Text>
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
      <SafeAreaView style={[setGlobalStyles.container, setGlobalStyles.center]} edges={['bottom', 'left', 'right']}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={setGlobalStyles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={setGlobalStyles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView>
        <MonthlyRecap type="Movie" action="Watched" data={movies} review={reviews} highestRating={highestMovieRating} highestRatedMedia={highestMovies}></MonthlyRecap>
        <MonthlyRecap type="Book" action="Read" data={books} review={reviews}  highestRating={highestBookRating} highestRatedMedia={highestBooks}></MonthlyRecap>
      </ScrollView>
    </SafeAreaView>
  );
}