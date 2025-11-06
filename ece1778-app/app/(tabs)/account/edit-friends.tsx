import { colors } from "@app/constants/colors";
import { globalStyles } from "@app/styles/globalStyles";
import { View, StyleSheet, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { accountStyles } from "@app/styles/accountStyles";
import { router } from "expo-router";

export default function EditFriendsScreen() {
	return (
		<SafeAreaView style={globalStyles.container}>
			<View style={[accountStyles.container, accountStyles.bgLight]}>
				<Pressable
					onPress={() =>
						router.push(
							"/account/c14e3e37-6024-4512-9716-8640b7a59276"
						)
					}
				>
					<Text>Friend</Text>
				</Pressable>
			</View>
		</SafeAreaView>
	);
}
