import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	ScrollView,
	FlatList,
	StyleSheet,
	Image,
	ActivityIndicator,
	TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useNavigation, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@lib/supabase.web";
import { Tables } from "@app/types/database.types";
import GeneralCard from "@components/generalCard";
import { globalStyles } from "@styles/globalStyles";
import { dimentions } from "@constants/dimentions";
import { useSelector } from "react-redux";
import { RootState } from "@app/store/store";
import { selectTheme } from "@app/features/theme/themeSlice";
import { colorsType } from "@app/types/types";

type Collection = Tables<"collections">;
type Movie = Tables<"movies">;

export default function CollectionScreen() {
	const { id } = useLocalSearchParams();
	const navigation = useNavigation();
	const [collection, setCollection] = useState<Collection | null>(null);
	const [movies, setMovies] = useState<Movie[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const colors = useSelector((state: RootState) => selectTheme(state));
	const styles = getStyles(colors);
	const setGlobalStyles = globalStyles();

	useEffect(() => {
		const fetchCollection = async () => {
			try {
				setLoading(true);
				setError(null);

				// Convert id to number
				const collectionId =
					typeof id === "string" ? parseInt(id, 10) : Number(id);

				if (isNaN(collectionId)) {
					throw new Error("Invalid collection ID");
				}

				// Fetch collection data
				const { data: collectionData, error: collectionError } =
					await supabase
						.from("collections")
						.select("*")
						.eq("id", collectionId)
						.maybeSingle();

				// Debug logging
				console.log("Fetching collection:", {
					collectionId,
					collectionError,
					collectionData,
					hasData: !!collectionData,
				});

				if (collectionError) {
					console.error("Collection error details:", collectionError);
					throw collectionError;
				}

				if (!collectionData) {
					// Check if there's an auth issue
					const {
						data: { session },
					} = await supabase.auth.getSession();
					console.log("Session check:", {
						hasSession: !!session,
						userId: session?.user?.id,
					});
					throw new Error(
						`Collection with ID ${collectionId} not found. This may be due to Row Level Security (RLS) or the collection belonging to a different user.`
					);
				}

				setCollection(collectionData);

				// Update navigation header title with collection name
				if (collectionData?.name) {
					navigation.setOptions({
						title: collectionData.name,
					});
				}

				// If collection is "Watched", fetch movies from reviews table
				if (collectionData.name === "Watched") {
					// Get user ID from session
					const {
						data: { session },
						error: sessionError,
					} = await supabase.auth.getSession();

					if (sessionError || !session?.user?.id) {
						throw new Error("User not authenticated");
					}

					const userId = session.user.id;

					// Fetch reviews for this user to get movie IDs with updated_at dates
					const { data: reviewsData, error: reviewsError } =
						await supabase
							.from("reviews")
							.select("movie_id, updated_at")
							.eq("user_id", userId)
							.order("updated_at", { ascending: false });

					if (reviewsError) {
						throw reviewsError;
					}

					if (!reviewsData || reviewsData.length === 0) {
						setMovies([]);
					} else {
						// Create a map of movie_id to latest updated_at
						const movieReviewMap = new Map<number, string>();
						for (const review of reviewsData) {
							if (review.movie_id !== null && review.updated_at) {
								movieReviewMap.set(
									review.movie_id,
									review.updated_at
								);
							}
						}

						// Get unique movie IDs sorted by latest review date
						const movieIds = Array.from(movieReviewMap.keys());

						if (movieIds.length > 0) {
							// Fetch movies
							const { data: moviesData, error: moviesError } =
								await supabase
									.from("movies")
									.select("*")
									.in("id", movieIds);

							if (moviesError) {
								throw moviesError;
							}

							// Sort movies by latest review date (most recent first)
							const sortedMovies =
								moviesData?.sort((a, b) => {
									const dateA =
										movieReviewMap.get(a.id) || "";
									const dateB =
										movieReviewMap.get(b.id) || "";
									return dateB.localeCompare(dateA); // Descending order (newest first)
								}) || [];

							setMovies(sortedMovies);
						} else {
							setMovies([]);
						}
					}
				} else {
					// Fetch movies if collection has a movie_list
					if (
						collectionData?.movie_list &&
						collectionData.movie_list.length > 0
					) {
						const { data: moviesData, error: moviesError } =
							await supabase
								.from("movies")
								.select("*")
								.in("id", collectionData.movie_list);

						if (moviesError) {
							throw moviesError;
						}

						// Sort movies to match the order in movie_list
						const sortedMovies = collectionData.movie_list
							.map((movieId) =>
								moviesData?.find((m) => m.id === movieId)
							)
							.filter((m): m is Movie => m !== undefined);

						setMovies(sortedMovies);
					} else {
						setMovies([]);
					}
				}
			} catch (err: any) {
				setError(err.message || "Failed to fetch collection");
				console.error("Error fetching collection:", err);
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchCollection();
		}
	}, [id]);

	// Get collection thumbnail (use first movie's poster or default)
	const getCollectionThumbnail = () => {
		const index = collection?.name === "Watched" ? movies.length - 1 : 0;
		if (movies.length > 0 && movies[index].poster_path) {
			// Use TMDB poster URL - poster_path should be a poster path (e.g., "/abc123.jpg")
			const posterPath = movies[index].poster_path.startsWith("/")
				? movies[index].poster_path
				: `/${movies[index].poster_path}`;
			return `https://image.tmdb.org/t/p/w500${posterPath}`;
		}
		return undefined;
	};

	if (loading) {
		return (
			<SafeAreaView
				style={[setGlobalStyles.container, setGlobalStyles.center]}
				edges={["bottom", "left", "right"]}
			>
				<ActivityIndicator size="large" color={colors.secondary} />
				<Text style={styles.loadingText}>Loading collection...</Text>
			</SafeAreaView>
		);
	}

	if (error || !collection) {
		return (
			<SafeAreaView
				style={[setGlobalStyles.container, setGlobalStyles.center]}
				edges={["bottom", "left", "right"]}
			>
				<Text style={setGlobalStyles.errorText}>
					{error || "Collection not found"}
				</Text>
			</SafeAreaView>
		);
	}

	const thumbnail = getCollectionThumbnail();
	const numberOfItems =
		collection.name === "Watched"
			? movies.length
			: collection.movie_list?.length || 0;

	return (
		<SafeAreaView
			style={setGlobalStyles.container}
			edges={["bottom", "left", "right"]}
		>
			<ScrollView>
				{/* Collection Header */}
				<View style={styles.headerContainer}>
					{/* Collection Thumbnail */}
					{thumbnail && (
						<View style={styles.thumbnailContainer}>
							<Image
								style={styles.thumbnail}
								source={{ uri: thumbnail }}
								resizeMode="cover"
							/>
						</View>
					)}

					{/* Collection Name */}
					<Text style={styles.collectionName}>{collection.name}</Text>

					{/* Number of Items */}
					<Text style={styles.itemCount}>
						{numberOfItems} {numberOfItems === 1 ? "item" : "items"}
					</Text>
				</View>

				{/* Movies List */}
				{movies.length > 0 ? (
					<View style={styles.moviesContainer}>
						<Text style={styles.sectionTitle}>
							Movies in Collection
						</Text>
						<FlatList
							data={movies}
							keyExtractor={(item) => item.id.toString()}
							scrollEnabled={false} // Use ScrollView's scrolling instead
							renderItem={({ item }) => {
								// Determine image source for the movie
								let imageSource: string | undefined;

								if (item.poster_path) {
									// Use TMDB poster URL - poster_path should be a poster path (e.g., "/abc123.jpg")
									const posterPath =
										item.poster_path.startsWith("/")
											? item.poster_path
											: `/${item.poster_path}`;
									imageSource = `https://image.tmdb.org/t/p/w500${posterPath}`;
								} else {
									imageSource = undefined;
								}

								return (
									<TouchableOpacity
										onPress={() =>
											router.push(
												`../../mediaDetails/${item.id}?type=movies`
											)
										}
										activeOpacity={0.7}
									>
										<GeneralCard
											image={imageSource}
											name={item.title}
											views={true}
											leftSubText={
												item.release_date
													? item.release_date
													: undefined
											}
											rightSubText={
												item.rating_count
													? item.rating_count.toFixed(
															1
													  )
													: "0"
											}
											starRating={
												item.avg_rating
													? item.avg_rating
													: 0
											}
										/>
									</TouchableOpacity>
								);
							}}
							contentContainerStyle={styles.moviesList}
						/>
					</View>
				) : (
					<View style={styles.emptyContainer}>
						<Text style={setGlobalStyles.errorDescriptionText}>
							This collection doesn't have any movies yet.
						</Text>
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

function getStyles(colors: colorsType) {
	const styles = StyleSheet.create({
		loadingText: {
			marginTop: 16,
			fontSize: 16,
			color: colors.secondary,
		},
		headerContainer: {
			alignItems: "center",
			marginBottom: 20,
			paddingTop: 20,
		},
		thumbnailContainer: {
			marginBottom: 16,
			borderRadius: 12,
			shadowColor: "#000",
			shadowOpacity: 0.3,
			shadowRadius: 8,
			shadowOffset: { width: 0, height: 4 },
			elevation: 5,
		},
		thumbnail: {
			width: dimentions.windowWidth * 0.4,
			height: dimentions.windowWidth * 0.4 * 1.5, // 2:3 poster aspect ratio
			borderRadius: 12,
		},
		collectionName: {
			fontSize: 32,
			fontWeight: "bold",
			color: colors.secondary,
			textAlign: "center",
			marginBottom: 8,
		},
		itemCount: {
			fontSize: 18,
			color: colors.black,
			textAlign: "center",
		},
		moviesContainer: {
			marginTop: 20,
		},
		sectionTitle: {
			fontSize: 24,
			fontWeight: "bold",
			color: colors.secondary,
			marginBottom: 12,
			marginLeft: 5,
		},
		moviesList: {
			paddingBottom: 20,
		},
		emptyContainer: {
			padding: 20,
			alignItems: "center",
			marginTop: 40,
		},
	});
	return styles;
}
