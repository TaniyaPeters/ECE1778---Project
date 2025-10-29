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
import { Review } from "@app/types";
import ReviewListItem from "@components/ReviewListItem";
import Card from "@components/Card";
import { colors } from "@constants/colors";
import GeneralCard from "@components/generalCard";

export default function movieDetails() {
	const { id } = useLocalSearchParams(); //Passed from prev screen, note: id is a string by default

  //Hardcoding for now - later retrieve using api
  const title: string = "Harry Potter and the Sorcerer's Stone";
  const release_year: number = 2001;
  const description: string =
    "An orphaned boy enrolls in a school of wizardry, where he learns the truth about himself, his family and the terrible evil that haunts the magical world.";
  const rating: number = 3.85;
  const num_ratings: number = 879;
  const reviews: Review[] = [
    {
      id: 1,
      user: "bob123",
      text: "This movie is a delight for those of all ages. I have seen it several times and each time I am enchanted by the characters and magic. The cast is outstanding, the special effects delightful, everything most believable.",
    },
    {
      id: 2,
      user: "lesley67",
      text: "I know I'm probably the only one that didn't care for this film, but I thought it was plain boring. The adaptation of the book is just OK and the acting is average.",
    },
  ];
  const director: string = "Chris Columbus";
  const cast: string[] = ["Daniel Radcliffe", "Rupert Grint", "Emma Watson"]; //could also be just a string depending on how the info is returned from api
  const moviePoster = require("@assets/harry-potter-movie-poster.jpg"); //delete this image from assets folder later

	return (
		<ScrollView style={globalStyles.container}>
			{/* Movie title */}
			<Text style={globalStyles.titleText}>{title}</Text>

			{/* Release year */}
			<Text style={[globalStyles.paragraph, styles.year]}>
				{release_year}
			</Text>

			{/* Rating out of 5 and number of ratings */}
			<View style={styles.ratingContainer}>
				<Text style={[globalStyles.paragraph, styles.rating]}>
					⭐ {rating} / 5
				</Text>
				<Text style={[globalStyles.paragraph, styles.num_ratings]}>
					{" "}
					({num_ratings} ratings)
				</Text>
			</View>

			{/* Movie poster */}
			<Image
				source={moviePoster}
				style={globalStyles.detailsImage}
				resizeMode="contain"
			/>

			<Card style={styles.card}>
				{/* Movie description */}
				<Text style={globalStyles.paragraph}>{description}</Text>

				{/* Director */}
				<View style={styles.horizontalContainer}>
					<Text style={globalStyles.paragraphBold}>Director: </Text>
					<Text style={globalStyles.paragraph}>{director}</Text>
				</View>

				{/* Cast */}
				<View style={styles.verticalContainer}>
					<Text style={globalStyles.paragraphBold}>Cast: </Text>
					{cast.map((actor, index) => (
						<Text key={index} style={globalStyles.paragraph}>
							{actor}
						</Text>
					))}
				</View>
			</Card>

			{/* Reviews by other users */}
			<Text style={globalStyles.paragraphBold}>Reviews:</Text>
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
