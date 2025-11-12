import { useEffect, useState, useRef } from "react";
import {
	FlatList,
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
	Modal,
	Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { globalStyles } from "@styles/globalStyles";
import { Review } from "@app/types/types";
import ReviewListItem from "@components/ReviewListItem";
import Card from "@components/Card";
import RatingReviewPopup from "@components/RatingReviewPopup";
import AddToCollection, { AddToCollectionHandle } from "@components/AddToCollection";
import { colors } from "@constants/colors";
import { supabase } from "@lib/supabase.web";
import { useAuthContext } from "@contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function movieDetails() {
	const { profile } = useAuthContext();
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

	const [userReview, setUserReview] = useState<Review | null>(null); 
	const [popupVisible, setPopupVisible] = useState<boolean>(false);
	const addToCollectionRef = useRef<AddToCollectionHandle>(null);
	const [deleteReviewModalVisible, setDeleteReviewModalVisible] = useState<boolean>(false);
	const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
	const [deleting, setDeleting] = useState<boolean>(false);

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
		setUserReview(null);

		//Retrieve reviews for movie
		const { data, error } = await supabase
		.from("reviews")
		.select(`id,rating,review,user_id,profiles (username)`)
		.eq("movie_id", id_num)
		.order("id", { ascending: true });

		//If no error in retrieving reviews, set all the reviews
		if (!error && data && data.length > 0) {
			const filtered_reviews = data
				.filter(r => r.review !== null || r.user_id === profile?.id)
				.map(r => ({
					id: r.id,
					user_id: r.user_id,
					username: r.profiles?.username ?? "Anonymous",
					rating: r.rating,
					review: r.review
				}));

			//Put the review of the logged-in user at the top of list
			const ordered_reviews = profile ? [...filtered_reviews.filter(r => r.user_id === profile.id), ...filtered_reviews.filter(r=> r.user_id !== profile.id)] : filtered_reviews;
			setReviews(ordered_reviews);
			
			//Also save the user's review (eg. for updating purposes)
			if (profile) {
				const userReviewIndex = ordered_reviews.findIndex(r => r.user_id === profile.id);
				if (userReviewIndex !== -1) {
					setUserReview(ordered_reviews[userReviewIndex]);
				}
			}
		}
		else {
			setReviews([]);
			setUserReview(null);
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
	}, [id, profile]);


	const handleSubmitReview = async (ratingNew: number, reviewTextNew: string) => {
		if (!id || Number.isNaN(Number(id))) {
			console.error("Invalid movie id");
			return;
		}
		
		if (profile) {
			const reviewValue = reviewTextNew === "" ? null : reviewTextNew;

			if (userReview) { //update
				try {
					const { data, error } = await supabase
						.from('reviews')
						.update({rating: ratingNew, review: reviewValue})
						.eq('id', userReview.id)
						.select();

					if (!data || data.length === 0) {
						console.error("Error updating user review:");
					}
				} catch (err) {
					console.error("Error updating user review", err);
				}
			}
			else { //create
				try {
					const { data, error } = await supabase
						.from ('reviews')
						.insert([{movie_id: Number(id), user_id: profile?.id ?? "", rating: ratingNew, review: reviewValue}])
						.select();

					if (!data || data.length === 0) {
						console.error("Error creating user review");
					}
				} catch (err) {
					console.error("Error creating user review:", err);
				}
			}
		}

		//Recalculate and set the number of ratings and average rating for movie
		try {
			let { data: dataAgg, error: errorAgg } = await supabase
				.from('reviews')
				.select('rating')
				.eq('movie_id', Number(id));

			if (!errorAgg && dataAgg) {
				const ratingValues = dataAgg
					.map(r => r.rating)
					.filter((r): r is number => r !== null && r !== undefined);
				const rating_count = ratingValues.length;
				const rating_avg = rating_count > 0 
					? Math.round((ratingValues.reduce((sum, r) => sum + r, 0) / rating_count) * 10) / 10
					: null;

				const { data: dataUpdate, error: errorUpdate } = await supabase 
					.from('movies')
					.update({rating_count: rating_count, avg_rating: rating_avg})
					.eq("id", Number(id))
					.select();

				if (errorUpdate) {
					console.error("Error updating rating count and average for movie: ", errorUpdate);
				}
			}
			else {
				console.error("Error retrieving rating count and average for movie: ", errorAgg)
			}
		} catch (err) {
			console.error("Error updating rating count and average for movie:", err);
		}
		
		//Refresh 
		try {
			await Promise.all([retrieveMovieDetails(Number(id)), retrieveReviews(Number(id))]);
		} catch (err) {
			console.error("Error fetching movie details:", err);
		}

		setPopupVisible(false);
	}

	const handleDeleteReview = (review: Review) => {
		setReviewToDelete(review);
		setDeleteReviewModalVisible(true);
	};

	const confirmDeleteReview = async () => {
		if (!reviewToDelete || !id || Number.isNaN(Number(id))) {
			return;
		}

		try {
			setDeleting(true);

			// Delete the review from the database
			const { error: deleteError } = await supabase
				.from("reviews")
				.delete()
				.eq("id", reviewToDelete.id);

			if (deleteError) {
				throw deleteError;
			}

			// Recalculate and set the number of ratings and average rating for movie
			try {
				let { data: dataAgg, error: errorAgg } = await supabase
					.from('reviews')
					.select('rating')
					.eq('movie_id', Number(id));

				if (!errorAgg && dataAgg) {
					const ratingValues = dataAgg
						.map(r => r.rating)
						.filter((r): r is number => r !== null && r !== undefined);
					const rating_count = ratingValues.length;
					const rating_avg = rating_count > 0 
						? Math.round((ratingValues.reduce((sum, r) => sum + r, 0) / rating_count) * 10) / 10
						: null;

					const { data: dataUpdate, error: errorUpdate } = await supabase 
						.from('movies')
						.update({rating_count: rating_count, avg_rating: rating_avg})
						.eq("id", Number(id))
						.select();

					if (errorUpdate) {
						console.error("Error updating rating count and average for movie: ", errorUpdate);
					}
				}
				else {
					console.error("Error retrieving rating count and average for movie: ", errorAgg)
				}
			} catch (err) {
				console.error("Error updating rating count and average for movie:", err);
			}

			// Close modal and reset
			setDeleteReviewModalVisible(false);
			setReviewToDelete(null);

			// Refresh reviews and movie details
			await Promise.all([retrieveMovieDetails(Number(id)), retrieveReviews(Number(id))]);
		} catch (err: any) {
			Alert.alert("Error", err.message || "Failed to delete review");
			console.error("Error deleting review:", err);
		} finally {
			setDeleting(false);
		}
	};

	return (
		<SafeAreaView style={[globalStyles.container, globalStyles.center]} edges={['bottom', 'left', 'right']}>
			<ScrollView>			
				{/* Movie title */}
				<Text style={globalStyles.titleText}>{title}</Text>

				<View style={[globalStyles.center, styles.yearAndAddContainer]}>
					{/* Release year */}
					<Text style={[globalStyles.paragraph, styles.year]}>
						{releaseYear}
					</Text>
					<Pressable
						onPress={() => {
							if (id && !Number.isNaN(Number(id))) {
								addToCollectionRef.current?.open(Number(id));
							}
						}}
						style={({ pressed }) => [
							styles.addButton,
							{ opacity: pressed ? 0.7 : 1 },
						]}
					>
						<Image
							source={require("@assets/addIconBlue.png")}
							style={styles.addIcon}
						/>
					</Pressable>
				</View>

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
				<View style={styles.imageContainer}>
					<Image
						source={moviePoster ? { uri: `https://image.tmdb.org/t/p/w500/${moviePoster}` } : require("@assets/no-image.jpg") }
						style={globalStyles.detailsImage}
						resizeMode="contain"
					/>
				</View>

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

				{/* Reviews */}
				<View style={styles.horizontalContainer}>
					<Text style={globalStyles.paragraphBold}>Reviews ({reviews.length}):</Text>
					<Pressable
						style={({ pressed }: { pressed: boolean }) => [
							styles.button, { opacity: pressed ? 0.6 : 1},
						]}
						onPress={() => setPopupVisible(true)}
						disabled={!profile}
					>
						<Text style={[globalStyles.paragraphBold, styles.buttonText]}>{userReview ? "Update Review" : "Add Review"}</Text>
					</Pressable>
				</View>
				<FlatList
					data={reviews}
					keyExtractor={(item: Review) => item.id.toString()}
					renderItem={({ item }) => (
						<ReviewListItem review={item} delFunction={profile?.id === item.user_id ? () => handleDeleteReview(item) : () => {}}></ReviewListItem>
					)}
					scrollEnabled={false} //disable FlatList's own scrolling and use ScrollViews scrolling instead (both enabled gives error)
					contentContainerStyle={styles.reviewList}
				/>

				{/* Add/update review and rating popup*/}
				<RatingReviewPopup
					visible={popupVisible}
					review={userReview}
					onClose={() => setPopupVisible(false)}
					onSubmit={handleSubmitReview}
				/>
			</ScrollView>

			<AddToCollection ref={addToCollectionRef} />

			{/* Delete Review Confirmation Modal */}
			<Modal
				visible={deleteReviewModalVisible}
				animationType="fade"
				transparent
				onRequestClose={() => {
					setDeleteReviewModalVisible(false);
					setReviewToDelete(null);
				}}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalBox}>
						<Text style={styles.modalTitle}>Delete Review</Text>
						
						<Text style={styles.modalLabel}>
							Are you sure you want to delete your review?
						</Text>
						<Text style={styles.modalWarningText}>
							This action cannot be undone.
						</Text>

						<View style={styles.modalButtonContainer}>
							<Pressable
								style={({ pressed }) => [
									styles.modalButtonSecondary,
									{ opacity: pressed ? 0.6 : 1 },
								]}
								onPress={() => {
									setDeleteReviewModalVisible(false);
									setReviewToDelete(null);
								}}
							>
								<Text style={styles.modalButtonText}>Cancel</Text>
							</Pressable>
							<Pressable
								style={({ pressed }) => [
									styles.modalButtonDanger,
									{ opacity: pressed ? 0.6 : 1 },
								]}
								onPress={confirmDeleteReview}
								disabled={deleting}
							>
								<Text style={styles.modalButtonText}>
									{deleting ? "Deleting..." : "Delete"}
								</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
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
		alignItems: "center",
		marginHorizontal: 15,
		marginTop: 14,
		marginBottom: 5,
		justifyContent: 'space-between',
	},
	verticalContainer: {
		flexDirection: "column",
	},
	button: {
		paddingVertical: 8,
		width: 120,
		height: 50,
		borderRadius: 15,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 16,
		backgroundColor: colors.light.secondary,
	},
	buttonText: {
		fontSize: 14,
		color: colors.light.background
	},
	reviewList: {
		paddingBottom: 20,
		paddingTop: 10,
	},
	card: {
		backgroundColor: colors.light.background,
	},
	imageContainer: {
		alignSelf: "center", // center container itself
		alignItems: 'center',
		marginBottom: 16,
		borderRadius: 12,
		shadowColor: "#000",
		shadowOpacity: 0.3,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 4 },
		elevation: 5,
	},
	yearAndAddContainer: {
		flexDirection: "row", 
		alignItems: "center", 
		gap: 3
	},
	addButton: {
		padding: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	addIcon: {
		width: 24,
		height: 24,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalBox: {
		backgroundColor: colors.light.background,
		width: "85%",
		borderRadius: 12,
		padding: 20,
		shadowColor: colors.light.black,
		shadowOpacity: 0.3,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 8,
		elevation: 5,
	},
	modalTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: colors.light.secondary,
		marginBottom: 20,
		textAlign: "center",
	},
	modalLabel: {
		fontSize: 16,
		fontWeight: "bold",
		color: colors.light.secondary,
		marginBottom: 8,
		textAlign: "center",
	},
	modalWarningText: {
		fontSize: 14,
		color: colors.light.danger,
		marginBottom: 20,
		textAlign: "center",
	},
	modalButtonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: 12,
	},
	modalButtonSecondary: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.light.secondary,
	},
	modalButtonDanger: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.light.danger,
	},
	modalButtonText: {
		fontSize: 16,
		fontWeight: "bold",
		color: colors.light.background,
	},
});
