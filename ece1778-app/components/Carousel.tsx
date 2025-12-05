import {
	ScrollView,
	StyleSheet,
	ViewProps,
	Text,
	StyleProp,
	ViewStyle,
	View,
	Button,
	Dimensions,
	FlatList,
	TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import AutoImage from "./autoScaledImage";
import { getLocalImage } from "@app/constants/postersMap";
import { useSelector } from "react-redux";
import { RootState } from "@app/store/store";
import { selectTheme } from "@app/features/theme/themeSlice";
import { colorsType } from "@app/types/types";

type Props = ViewProps & {
	cards?: any;
	style?: StyleProp<ViewStyle>;
};

export default function Carousel({ cards, style, ...props }: Props) {
	const colors = useSelector((state: RootState) => selectTheme(state));
	const styles = getStyles(colors);

	if (!cards) {
		cards = <Text>There is Nothing to Show</Text>;
	}

	return (
		<ScrollView
			horizontal={true}
			style={[styles.carousel, style]}
			{...props}
		>
			<FlatList
				data={cards}
				keyExtractor={(item) => item.id.toString()}
				scrollEnabled={false} // Use ScrollView's scrolling instead
				horizontal={true}
				renderItem={({ item }) => {
					// Determine image source for the movie
					let imageSource: string;
					let localPath: boolean = false;

					if (item.poster_path) {
						// Use TMDB poster URL - poster_path should be a poster path (e.g., "/abc123.jpg")
						const posterPath = item.poster_path.startsWith("/")
							? item.poster_path
							: `/${item.poster_path}`;
						imageSource = `https://image.tmdb.org/t/p/w500${posterPath}`;
						localPath = false;
					} else {
						// Fallback to local image
						imageSource = "brokenImage";
						localPath = true;
					}

					return (
						<TouchableOpacity
							onPress={() =>
								router.push(
									`../mediaDetails/${item.id}?type=movies`
								)
							}
							activeOpacity={0.7}
						>
							<View style={styles.cardCollection}>
								<AutoImage
									style={{ width: 90, height: 125 }}
									source={
										localPath
											? getLocalImage(imageSource)
											: { uri: imageSource }
									}
								/>
							</View>
						</TouchableOpacity>
					);
				}}
			/>
		</ScrollView>
	);
}

function getStyles(colors: colorsType) {
	const styles = StyleSheet.create({
		carousel: {
			flexDirection: "row",
			backgroundColor: colors.tertiary,
		},
		cardCollection: {
			paddingRight: 5,
		},
	});
	return styles;
}
