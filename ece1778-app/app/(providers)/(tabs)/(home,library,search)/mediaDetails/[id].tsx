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
import { colorsType, Review } from "@app/types/types";
import ReviewListItem from "@components/ReviewListItem";
import Card from "@components/Card";
import RatingReviewPopup from "@components/RatingReviewPopup";
import AddToCollection, {
	AddToCollectionHandle,
} from "@components/AddToCollection";
import { supabase } from "@lib/supabase.web";
import { useAuthContext } from "@contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { sendPushNotification } from "@app/components/Notifications";
import { useSelector } from "react-redux";
import { RootState } from "@app/store/store";
import { selectTheme } from "@app/features/theme/themeSlice";

type MediaType = "movies" | "books";

type Media = {
	id: number;
	title: string;
	description: string;
	releaseYear: string;
	image: string | null;
	type: MediaType;
	rating: number | null;
	numRatings: number | null;
	creators: string[];
	genres: string[];
};

const defaultMedia: Media = {
	id: 0,
	title: "Unknown",
	description: "No description available.",
	releaseYear: "",
	image: null,
	type: "movies",
	rating: null,
	numRatings: null,
	creators: [],
	genres: [],
};

export default function mediaDetails() {
	const { profile } = useAuthContext();
	const { id, type } = useLocalSearchParams(); //Passed from prev screen, note: id is a string by default

	//State variables for all movie info
	const [media, setMedia] = useState<Media>(defaultMedia);
	const [reviews, setReviews] = useState<Review[]>([]);

	const [userReview, setUserReview] = useState<Review | null>(null);
	const [popupVisible, setPopupVisible] = useState<boolean>(false);
	const addToCollectionRef = useRef<AddToCollectionHandle>(null);
	const [deleteReviewModalVisible, setDeleteReviewModalVisible] =
		useState<boolean>(false);
	const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
	const [deleting, setDeleting] = useState<boolean>(false);

	const colors = useSelector((state: RootState) => selectTheme(state));
	const styles = getStyles(colors);
	const setGlobalStyles = globalStyles();

	const isValidSearchParams = () => {
		if (!id || Number.isNaN(Number(id))) return false;
		if (type !== "movies" && type !== "books") return false;
		return true;
	};

	async function retrieveMediaDetails(idNum: number, mediaType: MediaType) {
		//Retrieve movie details from movies table
		const { data, error } = await supabase
			.from(mediaType)
			.select("*")
			.eq("id", idNum);

		//If no error in retrieving movie, set all the movie details
		if (!error && data && data.length > 0) {
			setMedia({
				id: idNum,
				title: data[0].title,
				description: data[0].description ?? "",
				releaseYear:
					"release_date" in data[0]
						? data[0].release_date?.substring(0, 4) ?? ""
						: data[0].publish_year ?? "",
				image:
					"poster_path" in data[0]
						? data[0].poster_path
						: data[0].cover_image,
				type: mediaType,
				rating: data[0].avg_rating,
				numRatings: data[0].rating_count,
				creators:
					"cast_members" in data[0]
						? data[0].cast_members ?? []
						: data[0].authors ?? [],
				genres: data[0].genres ?? [],
			});
		} else {
			clearMediaDetails();
		}
	}

	async function retrieveReviews(idNum: number, mediaType: MediaType) {
		setReviews([]); //clear old reviews
		setUserReview(null);

		const searchField = mediaType === "movies" ? "movie_id" : "book_id";

		//Retrieve reviews for movie
		const { data, error } = await supabase
			.from("reviews")
			.select(`id,rating,review,user_id,profiles (username)`)
			.eq(searchField, idNum)
			.order("id", { ascending: true });

		//If no error in retrieving reviews, set all the reviews
		if (!error && data && data.length > 0) {
			const filtered_reviews = data
				.filter((r) => r.review !== null || r.user_id === profile?.id)
				.map((r) => ({
					id: r.id,
					user_id: r.user_id,
					username: r.profiles?.username ?? "Anonymous",
					rating: r.rating,
					review: r.review,
				}));

			//Put the review of the logged-in user at the top of list
			const ordered_reviews = profile
				? [
						...filtered_reviews.filter(
							(r) => r.user_id === profile.id
						),
						...filtered_reviews.filter(
							(r) => r.user_id !== profile.id
						),
				  ]
				: filtered_reviews;
			setReviews(ordered_reviews);

			//Also save the user's review (eg. for updating purposes)
			if (profile) {
				const userReviewIndex = ordered_reviews.findIndex(
					(r) => r.user_id === profile.id
				);
				if (userReviewIndex !== -1) {
					setUserReview(ordered_reviews[userReviewIndex]);
				}
			}
		} else {
			setReviews([]);
			setUserReview(null);
		}
	}

	//Set movie details to default values
	const clearMediaDetails = () => {
		setMedia(defaultMedia);
	};

	useEffect(() => {
		if (!isValidSearchParams()) {
			clearMediaDetails();
			setReviews([]);
			return;
		}

		(async () => {
			try {
				await Promise.all([
					retrieveMediaDetails(Number(id), type as MediaType),
					retrieveReviews(Number(id), type as MediaType),
				]);
			} catch (err) {
				console.error("Error fetching media details:", err);
				clearMediaDetails();
				setReviews([]);
			}
		})();
	}, [id, profile]);

	const handleSubmitReview = async (
		ratingNew: number,
		reviewTextNew: string
	) => {
		if (!isValidSearchParams()) return;

		const idNum = Number(id);
		const mediaType = type as MediaType;

		if (ratingNew == 5) {
			sendPushNotification(media.title, `${idNum}?type=${type}`, profile);
		}

		if (profile) {
			const movieIdNum = Number(id);
			const reviewValue = reviewTextNew === "" ? null : reviewTextNew;

			if (userReview) {
				//update
				try {
					const { data, error } = await supabase
						.from("reviews")
						.update({ rating: ratingNew, review: reviewValue })
						.eq("id", userReview.id)
						.select();

					if (!data || data.length === 0) {
						console.error("Error updating user review:");
					}
				} catch (err) {
					console.error("Error updating user review", err);
				}
			} else {
				//create
				try {
					const { data, error } = await supabase
						.from("reviews")
						.insert([
							{
								[mediaType === "movies"
									? "movie_id"
									: "book_id"]: idNum,
								user_id: profile?.id ?? "",
								rating: ratingNew,
								review: reviewValue,
							},
						])
						.select();

					if (!data || data.length === 0) {
						console.error("Error creating user review");
					}
				} catch (err) {
					console.error("Error creating user review:", err);
				}
			}

			// Ensure the movie is in the user's "Watched" collection
			try {
				const { data: watchedCollection, error: watchedError } = await supabase
					.from("collections")
					.select("id, movie_list")
					.eq("user_id", profile.id)
					.eq("name", "Watched")
					.is("book_list", null)
					.maybeSingle();

				if (!watchedError && watchedCollection) {
					const currentList: number[] =
						watchedCollection.movie_list || [];
					if (!currentList.includes(movieIdNum)) {
						const updatedMovieList = [...currentList, movieIdNum];

						const { error: updateWatchedError } = await supabase
							.from("collections")
							.update({
								movie_list: updatedMovieList,
								updated_at: new Date().toISOString(),
							})
							.eq("id", watchedCollection.id)
							.is("book_list", null);

						if (updateWatchedError) {
							console.error(
								"Error updating Watched collection:",
								updateWatchedError
							);
						}
					}
				}
			} catch (err) {
				console.error(
					"Error ensuring movie is in Watched collection:",
					err
				);
			}
		}

		//Recalculate and set the number of ratings and average rating for movie
		try {
			const searchField = mediaType === "movies" ? "movie_id" : "book_id";
			const { data: dataAgg, error: errorAgg } = await supabase
				.from("reviews")
				.select("rating")
				.eq(searchField, idNum);

			if (!errorAgg && dataAgg) {
				const ratingValues = dataAgg
					.map((r) => r.rating)
					.filter((r): r is number => r !== null && r !== undefined);
				const rating_count = ratingValues.length;
				const rating_avg =
					rating_count > 0
						? Math.round(
								(ratingValues.reduce((sum, r) => sum + r, 0) /
									rating_count) *
									10
						  ) / 10
						: null;

				const { data: dataUpdate, error: errorUpdate } = await supabase
					.from(mediaType)
					.update({
						rating_count: rating_count,
						avg_rating: rating_avg,
					})
					.eq("id", idNum)
					.select();

				if (errorUpdate) {
					console.error(
						"Error updating rating count and average for movie: ",
						errorUpdate
					);
				}
			} else {
				console.error(
					"Error retrieving rating count and average for movie: ",
					errorAgg
				);
			}
		} catch (err) {
			console.error(
				"Error updating rating count and average for movie:",
				err
			);
		}

		//Refresh
		try {
			await Promise.all([
				retrieveMediaDetails(idNum, mediaType),
				retrieveReviews(idNum, mediaType),
			]);
		} catch (err) {
			console.error("Error fetching movie details:", err);
		}

		setPopupVisible(false);
	};

	const handleDeleteReview = (review: Review) => {
		setReviewToDelete(review);
		setDeleteReviewModalVisible(true);
	};

	const confirmDeleteReview = async () => {
		if (!reviewToDelete || !isValidSearchParams()) {
			return;
		}

		const idNum = Number(id);
		const mediaType = type as MediaType;

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
				const searchField =
					mediaType === "movies" ? "movie_id" : "book_id";
				const { data: dataAgg, error: errorAgg } = await supabase
					.from("reviews")
					.select("rating")
					.eq(searchField, idNum);

				if (!errorAgg && dataAgg) {
					const ratingValues = dataAgg
						.map((r) => r.rating)
						.filter(
							(r): r is number => r !== null && r !== undefined
						);
					const rating_count = ratingValues.length;
					const rating_avg =
						rating_count > 0
							? Math.round(
									(ratingValues.reduce(
										(sum, r) => sum + r,
										0
									) /
										rating_count) *
										10
							  ) / 10
							: null;

					const { data: dataUpdate, error: errorUpdate } =
						await supabase
							.from(mediaType)
							.update({
								rating_count: rating_count,
								avg_rating: rating_avg,
							})
							.eq("id", idNum)
							.select();

					if (errorUpdate) {
						console.error(
							"Error updating rating count and average for movie: ",
							errorUpdate
						);
					}
				} else {
					console.error(
						"Error retrieving rating count and average for movie: ",
						errorAgg
					);
				}
			} catch (err) {
				console.error(
					"Error updating rating count and average for movie:",
					err
				);
			}

			// Close modal and reset
			setDeleteReviewModalVisible(false);
			setReviewToDelete(null);

			// Refresh reviews and movie details
			await Promise.all([
				retrieveMediaDetails(idNum, mediaType),
				retrieveReviews(idNum, mediaType),
			]);
		} catch (err: any) {
			Alert.alert("Error", err.message || "Failed to delete review");
			console.error("Error deleting review:", err);
		} finally {
			setDeleting(false);
		}
	};

	return (
		<SafeAreaView
			style={[setGlobalStyles.container, setGlobalStyles.center]}
			edges={["bottom", "left", "right"]}
		>
			<ScrollView>
				{/* Media title */}
				<Text style={setGlobalStyles.titleText}>{media.title}</Text>

				<View
					style={[setGlobalStyles.center, styles.yearAndAddContainer]}
				>
					{/* Release year */}
					<Text style={[setGlobalStyles.paragraph, styles.year]}>
						{media.releaseYear}
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
							source={
								colors.name === "dark"
									? require("@assets/addIconWhite.png")
									: require("@assets/addIconBlue.png")
							}
							style={styles.addIcon}
						/>
					</Pressable>
				</View>

				{/* Rating out of 5 and number of ratings */}
				<View style={styles.ratingContainer}>
					<Text style={[setGlobalStyles.paragraph, styles.rating]}>
						⭐{" "}
						{media.numRatings && media.numRatings > 0
							? `${media.rating?.toFixed(1) ?? "N/A"} / 5`
							: ""}
					</Text>
					<Text
						style={[setGlobalStyles.paragraph, styles.num_ratings]}
					>
						{" "}
						({media.numRatings ?? 0} ratings)
					</Text>
				</View>

				{/* Media image */}
				<View style={styles.imageContainer}>
					<Image
						source={
							media.image
								? {
										uri:
											media.type === "movies"
												? `https://image.tmdb.org/t/p/w500/${media.image}`
												: `https://covers.openlibrary.org/b/id/${media.image}-M.jpg`,
								  }
								: require("@assets/brokenFile.png")
						}
						style={setGlobalStyles.detailsImage}
						resizeMode="contain"
					/>
				</View>

				<Card style={styles.card}>
					{/* Media description */}
					<Text style={setGlobalStyles.paragraph}>
						{media.description}
					</Text>

					{/* Genres */}
					<View style={styles.verticalContainer}>
						<Text style={setGlobalStyles.paragraphBold}>
							Genres:{" "}
						</Text>
						{media.genres.map((genre, index) => (
							<Text key={index} style={setGlobalStyles.paragraph}>
								• {genre}
							</Text>
						))}
					</View>

					{/* Cast or Author */}
					<View style={styles.verticalContainer}>
						<Text style={setGlobalStyles.paragraphBold}>
							{media.type === "movies"
								? "Cast"
								: media.creators.length === 1
								? "Author"
								: "Authors"}
							:
						</Text>
						{media.creators.map((creator, index) => (
							<Text key={index} style={setGlobalStyles.paragraph}>
								• {creator}
							</Text>
						))}
					</View>
				</Card>

				{/* Reviews */}
				<View style={styles.horizontalContainer}>
					<Text style={setGlobalStyles.paragraphBold}>
						Reviews ({reviews.length}):
					</Text>
					<Pressable
						style={({ pressed }: { pressed: boolean }) => [
							styles.button,
							{ opacity: pressed ? 0.6 : 1 },
						]}
						onPress={() => setPopupVisible(true)}
						disabled={!profile}
					>
						<Text
							style={[
								setGlobalStyles.paragraphBold,
								styles.buttonText,
							]}
						>
							{userReview ? "Update Review" : "Add Review"}
						</Text>
					</Pressable>
				</View>
				<FlatList
					data={reviews}
					keyExtractor={(item: Review) => item.id.toString()}
					renderItem={({ item }) => (
						<ReviewListItem
							review={item}
							delFunction={
								profile?.id === item.user_id
									? () => handleDeleteReview(item)
									: () => {}
							}
						></ReviewListItem>
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
								<Text style={styles.modalButtonText}>
									Cancel
								</Text>
							</Pressable>
							<Pressable
								style={({ pressed }) => [
									styles.modalButtonDanger,
									{ opacity: pressed ? 0.6 : 1 },
								]}
								onPress={confirmDeleteReview}
								disabled={deleting}
							>
								<Text
									style={[
										styles.modalButtonText,
										{ color: colors.white },
									]}
								>
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

function getStyles(colors: colorsType) {
	const styles = StyleSheet.create({
		year: {
			textAlign: "center",
			fontWeight: "bold",
			color: colors.secondary,
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
			justifyContent: "space-between",
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
			backgroundColor: colors.secondary,
		},
		buttonText: {
			fontSize: 14,
			color: colors.background,
		},
		reviewList: {
			paddingBottom: 20,
			paddingTop: 10,
		},
		card: {
			backgroundColor: colors.primary,
		},
		imageContainer: {
			alignSelf: "center", // center container itself
			alignItems: "center",
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
			gap: 3,
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
			backgroundColor: colors.background,
			width: "85%",
			borderRadius: 12,
			padding: 20,
			shadowColor: colors.black,
			shadowOpacity: 0.3,
			shadowOffset: { width: 0, height: 2 },
			shadowRadius: 8,
			elevation: 5,
		},
		modalTitle: {
			fontSize: 24,
			fontWeight: "bold",
			color: colors.secondary,
			marginBottom: 20,
			textAlign: "center",
		},
		modalLabel: {
			fontSize: 16,
			fontWeight: "bold",
			color: colors.secondary,
			marginBottom: 8,
			textAlign: "center",
		},
		modalWarningText: {
			fontSize: 14,
			color: colors.danger,
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
			backgroundColor: colors.secondary,
		},
		modalButtonDanger: {
			flex: 1,
			paddingVertical: 12,
			borderRadius: 8,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: colors.danger,
		},
		modalButtonText: {
			fontSize: 16,
			fontWeight: "bold",
			color: colors.background,
		},
	});
	return styles;
}
