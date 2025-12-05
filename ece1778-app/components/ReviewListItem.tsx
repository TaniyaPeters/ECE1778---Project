import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { colorsType, Review } from "../types/types";
import Card from "./Card";
import StarRating from "@components/starRating";
import { globalStyles } from "../styles/globalStyles";
import { useAuthContext } from "@contexts/AuthContext";
import { useSelector } from "react-redux";
import { RootState } from "@app/store/store";
import { selectTheme } from "@app/features/theme/themeSlice";

type Props = {
	review: Review;
	delFunction?: null | (() => void);
};

export default function ReviewListItem({ review, delFunction = null }: Props) {
	const { profile } = useAuthContext();
	const colors = useSelector((state:RootState)=>selectTheme(state));
	const styles = getStyles(colors)
	const setGlobalStyles = globalStyles()

	return (
		<Card style={styles.card}>
			<View style={styles.content}>
				<View style={styles.headerRow}>
					{/* User who wrote review */}
					<Text style={profile?.id === review.user_id ? 
						[setGlobalStyles.paragraphBold, styles.text] 
						: [setGlobalStyles.paragraph, styles.text]}>
						{review.username}
					</Text>
					{/* Rating associated to the review depicted out of 5 stars */}
					<View style={styles.starAndDeleteContainer}>
						{review.rating && (
							<StarRating rating={review.rating} color={colors.secondary} />
						)}
						{delFunction && profile?.id === review.user_id && (
							<Pressable onPress={delFunction}>
								<Image
								source={require("../assets/trashIcon.png")}
								style={{ width: 24, height: 24 }}
								/>
							</Pressable>
						)}
					</View>
				</View>
				{/* Divider line */}
				<View style={styles.line} />
				{/* Review text */}
				<Text style={profile?.id === review.user_id ? [setGlobalStyles.paragraphBold, styles.text] : [setGlobalStyles.paragraph, styles.text]}>
					{review.review}
				</Text>
			</View>
		</Card>
	);
}

function getStyles(colors:colorsType){
	const styles = StyleSheet.create({
		card: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			backgroundColor: colors.background
		},
		content: {
			flex: 1,
			flexDirection: "column",
		},
		headerRow: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
		},
		text: {
			fontSize: 17,
			marginVertical: 3,
			color: colors.secondary
		},
		line: {
			height: 1,
			backgroundColor: colors.secondary,
			width: "100%",
			marginVertical: 10,
		},
		starAndDeleteContainer: {
			flexDirection:"row", 
			alignItems: "center", 
			gap: 4}
		},
	);
	return styles
}