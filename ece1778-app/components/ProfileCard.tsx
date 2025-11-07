import { accountStyles } from "@app/styles/accountStyles";
import { globalStyles } from "@app/styles/globalStyles";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { useTheme } from "@contexts/ThemeContext";

export default function ProfileCard({
	avatar_url,
	username,
	removeFriend,
}: {
	avatar_url: string;
	username: string;
	removeFriend: () => void;
}) {
	const { theme } = useTheme();

	return (
		<View
			style={[
				styles.card,
				theme === "light"
					? accountStyles.bgLight
					: accountStyles.secondaryDark,
				{ borderColor: theme === "light" ? "#ccc" : "#444" },
			]}
		>
			<Image
				source={{ uri: avatar_url }}
				style={[globalStyles.profileImage, { width: 50, height: 50 }]}
			/>
			<Text
				style={[
					accountStyles.profileUsername,
					theme === "light"
						? accountStyles.textLight
						: accountStyles.textDark,
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
