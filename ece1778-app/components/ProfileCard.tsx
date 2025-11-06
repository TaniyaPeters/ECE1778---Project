import { accountStyles } from "@app/styles/accountStyles";
import { globalStyles } from "@app/styles/globalStyles";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";

export default function ProfileCard({
	avatar_url,
	username,
}: {
	avatar_url: string;
	username: string;
}) {
	return (
		<View style={[styles.card, accountStyles.bgLight]}>
			<Image
				source={{ uri: avatar_url }}
				style={[globalStyles.profileImage, { width: 50, height: 50 }]}
			/>
			<Text style={[accountStyles.profileUsername]}>{username}</Text>
			<Pressable style={{ marginLeft: "auto" }} onPress={() => {}}>
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
		borderColor: "#ccc",
		shadowColor: "#000",
		// width: 500,
	},
});
