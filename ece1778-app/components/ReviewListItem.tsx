import { View, Text, StyleSheet } from "react-native";
import { Review } from "../types/types";
import Card from "./Card";
import StarRating from "@components/starRating";
import { colors } from "../constants/colors";
import { globalStyles } from "../styles/globalStyles";
import { useAuthContext } from "@contexts/AuthContext";

type Props = {
	review: Review;
};

export default function ReviewListItem({ review }: Props) {
	const { profile } = useAuthContext();

	return (
		<Card style={styles.card}>
			<View style={styles.content}>
				<View style={styles.headerRow}>
					{/* User who wrote review */}
					<Text style={profile?.id === review.user_id ? [globalStyles.paragraphBold, styles.text] : [globalStyles.paragraph, styles.text]}>
						{review.username}
					</Text>
					{/* Rating associated to the review depicted out of 5 stars */}
					{review.rating && (
						<StarRating rating={review.rating} color={colors.light.background} />
					)}
				</View>
				{/* Divider line */}
				<View style={styles.line} />
				{/* Review text */}
				<Text style={profile?.id === review.user_id ? [globalStyles.paragraphBold, styles.text] : [globalStyles.paragraph, styles.text]}>
					{review.review}
				</Text>
			</View>
		</Card>
	);
}

const styles = StyleSheet.create({
	card: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	content: {
		flex: 1,
		flexDirection: "column",
	},
	headerRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	text: {
		fontSize: 17,
		marginVertical: 3,
	},
	line: {
		height: 1,
		backgroundColor: colors.light.black,
		width: "100%",
		marginVertical: 10,
	},
});
