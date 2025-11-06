import { useEffect, useState } from "react";
import {
	FlatList,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { globalStyles } from "@styles/globalStyles";
import { Review } from "@app/types/types";
import ReviewListItem from "@components/ReviewListItem";
import Card from "@components/Card";
import { colors } from "@constants/colors";
import { supabase } from "@lib/supabase.web";

export default function movieDetails() {
	const { id } = useLocalSearchParams(); //Passed from prev screen, note: id is a string by default

	//State variables for all movie info
	const [title, setTitle] = useState<string>("Movie not found");
	const [releaseYear, setReleaseYear] = useState<string>("");
	const [description, setDescription] = useState<string>("");
	const [rating, setRating] = useState<number | null>(null);
	const [numRatings, setNumRatings] = useState<number | null>(null);
	const [moviePoster, setMoviePoster] = useState<string | null>(null);
	const [castMembers, setCastMembers] = useState<string[]>([]);
	const [genres, setGenres] = useState<string[]>([]);
	const [reviews, setReviews] = useState<Review[]>([]);

	async function retrieveMovieDetails(id_num: number) {
		//Retrieve movie details from movies table
		const { data, error } = await supabase
		.from("movies")
		.select("title,avg_rating,rating_count,description,release_date,poster_path,genres,cast_members")
		.eq("id", id_num);

		//If no error in retrieving movie, set all the movie details
		if (!error && data && data.length > 0) {
			setTitle(data[0].title);
			setReleaseYear(data[0].release_date?.substring(0,4) ?? "");
			setDescription(data[0].description ?? "");
			setRating(data[0].avg_rating);
			setNumRatings(data[0].rating_count);
			setMoviePoster(data[0].poster_path ?? null);
			setCastMembers(data[0].cast_members ?? []);
			setGenres(data[0].genres ?? []);
		}
		else {
			clearMovieDetails();
		}
	}

	async function retrieveReviews(id_num: number) {
		setReviews([]); //clear old reviews

		//Retrieve reviews for movie
		const { data, error } = await supabase
		.from("reviews")
		.select(`id,rating,review,user_id,profiles (username)`)
		.eq("movie_id", id_num);

		//If no error in retrieving reviews, set all the reviews
		if (!error && data && data.length > 0) {
			const filtered_reviews = data
				.filter(r => r.review !== null)
				.map(r => ({
					id: r.id,
					username: r.profiles?.username ?? "Anonymous",
					rating: r.rating,
					review: r.review
				}));
			setReviews(filtered_reviews);
		}
		else {
			setReviews([]);
		}
	}

	//Set movie details to default values
	const clearMovieDetails = () => {
		setTitle("Movie not found");
		setReleaseYear("");
		setDescription("");
		setRating(null);
		setNumRatings(null);
		setMoviePoster(null);
		setCastMembers([]);
		setGenres([]);
	};

	useEffect(() => {
		if (id) {
			//id in db is a number so convert it and make sure it's valid
			const id_num = Number(id);
			if (!Number.isNaN(id_num)) {
				//Run both fetches
				(async () => {
					try {
						await Promise.all([retrieveMovieDetails(id_num), retrieveReviews(id_num)]);
					} catch (err) {
						console.error("Error fetching movie details:", err);
    					clearMovieDetails();
						setReviews([]);
					}
				})();
			}
			else {
				//Clear if id is not a number
				clearMovieDetails();
				setReviews([]);
			}
		}
		else {
			//Clear if id doesn't exist
			clearMovieDetails();
			setReviews([]);
		}
	}, [id]);

	return (
		<ScrollView style={globalStyles.container}>
			{/* Movie title */}
			<Text style={globalStyles.titleText}>{title}</Text>

			{/* Release year */}
			<Text style={[globalStyles.paragraph, styles.year]}>
				{releaseYear}
			</Text>

			{/* Rating out of 5 and number of ratings */}
			<View style={styles.ratingContainer}>
				<Text style={[globalStyles.paragraph, styles.rating]}>
					⭐ {numRatings && numRatings > 0 ? `${rating?.toFixed(1) ?? "N/A"} / 5` : ""}
				</Text>
				<Text style={[globalStyles.paragraph, styles.num_ratings]}>
					{" "}
					({numRatings ?? 0} ratings)
				</Text>
			</View>

			{/* Movie poster */}
			<Image
				source={moviePoster ? { uri: `https://image.tmdb.org/t/p/w500/${moviePoster}` } : require("@assets/no-image.jpg") }
				style={globalStyles.detailsImage}
				resizeMode="contain"
			/>

			<Card style={styles.card}>
				{/* Movie description */}
				<Text style={globalStyles.paragraph}>{description}</Text>

				{/* Genres */}
				<View style={styles.verticalContainer}>
					<Text style={globalStyles.paragraphBold}>Genres: </Text>
					{genres.map((genre, index) => (
						<Text key={index} style={globalStyles.paragraph}>
							• {genre}
						</Text>
					))}
				</View>

				{/* Cast */}
				<View style={styles.verticalContainer}>
					<Text style={globalStyles.paragraphBold}>Cast: </Text>
					{castMembers.map((actor, index) => (
						<Text key={index} style={globalStyles.paragraph}>
							• {actor}
						</Text>
					))}
				</View>
			</Card>

			{/* Reviews by other users */}
			<Text style={globalStyles.paragraphBold}>Reviews ({reviews.length}):</Text>
			<FlatList
				data={reviews}
				keyExtractor={(item: Review) => item.id.toString()}
				renderItem={({ item }) => (
					<ReviewListItem review={item}></ReviewListItem>
				)}
				scrollEnabled={false} //disable FlatList's own scrolling and use ScrollViews scrolling instead (both enabled gives error)
				contentContainerStyle={styles.reviewList}
			/>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	year: {
		textAlign: "center",
		fontWeight: "bold",
		color: colors.light.secondary,
	},
	ratingContainer: {
		flexDirection: "row",
		alignSelf: "center",
		alignItems: "baseline",
	},
	rating: {
		textAlign: "center",
		fontWeight: "bold",
		fontSize: 25,
	},
	num_ratings: {
		textAlign: "center",
	},
	horizontalContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "flex-start",
		marginTop: 14,
	},
	verticalContainer: {
		flexDirection: "column",
	},
	reviewList: {
		paddingBottom: 20,
		paddingTop: 10,
	},
	card: {
		backgroundColor: colors.light.background,
		marginTop: 10,
		marginBottom: 10,
	},
});
