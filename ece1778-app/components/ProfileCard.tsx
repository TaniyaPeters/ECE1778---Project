import { selectTheme } from "@app/features/theme/themeSlice";
import { RootState } from "@app/store/store";
import { accountStyles } from "@app/styles/accountStyles";
import { globalStyles } from "@app/styles/globalStyles";
import { colorsType } from "@app/types/types";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { useSelector } from "react-redux";

export default function ProfileCard({
	avatar_url,
	username,
	removeFriend,
}: {
	avatar_url: string;
	username: string;
	removeFriend: () => void;
}) {
	const colors = useSelector((state:RootState)=>selectTheme(state));
	const styles = getStyles(colors)
	const setGlobalStyles = globalStyles()

	return (
		<View
			style={[
				styles.card,
				{backgroundColor: colors.secondary},
				{ borderColor: colors.name === "light" ? "#ccc" : "#444" },
			]}
		>
			<Image
				source={{ uri: avatar_url }}
				style={[setGlobalStyles.profileImage, { width: 50, height: 50 }]}
			/>
			<Text
				style={[
					accountStyles.profileUsername,
					{color: colors.text},
				]}
			>
				{username}
			</Text>
			<Pressable
				style={({ pressed }: { pressed: boolean }) => [
					{ marginLeft: "auto" },
					{ opacity: pressed ? 0.6 : 1 },
				]}
				onPress={removeFriend}
			>
				<Image
					source={require("@assets/minus.png")}
					style={[accountStyles.icon, { opacity: 0.4 }]}
				/>
			</Pressable>
		</View>
	);
}

function getStyles(colors:colorsType){	
	const styles = StyleSheet.create({
		card: {
			flexDirection: "row",
			alignItems: "center",
			padding: 10,
			gap: 15,
			borderRadius: 10,
			borderWidth: 1,
			shadowColor: "#000",
			// width: 500,
		},
	});
	return styles
}