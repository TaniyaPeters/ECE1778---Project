import { colors } from "@app/constants/colors";
import { globalStyles } from "@app/styles/globalStyles";
import { View, StyleSheet, Text, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { accountStyles } from "@app/styles/accountStyles";
import { router } from "expo-router";
import ProfileCard from "@app/components/ProfileCard";

const dummyData = [
	{
		id: "c14e3e37-6024-4512-9716-8640b7a59276",
		username: "friend1",
		avatar_url: "https://avatars.githubusercontent.com/u/44341921?v=4",
	},
	{
		id: "99a290c5-8bda-4496-94a9-d69a5b8ebdb8",
		username: "friend2",
		avatar_url:
			"https://bcvznyabnzjhwrgsfxaj.supabase.co/storage/v1/object/sign/avatars/fern.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83OGZhYTBkNC1jZGI0LTQzNzEtOWU1OC1mNTg1NDI4YTNlZTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdmF0YXJzL2Zlcm4uanBnIiwiaWF0IjoxNzU5NDk5MDcyLCJleHAiOjE3NjAxMDM4NzJ9.evUuAv0wn2urMfy6q4ZDJUs1kZ0pj_TkLSOEv44kUnM",
	},
];

export default function EditFriendsScreen() {
	return (
		<SafeAreaView style={[globalStyles.container, { paddingTop: 0 }]}>
			<View style={[accountStyles.container, accountStyles.bgLight]}>
				<Text style={[accountStyles.header, accountStyles.textLight]}>
					Friends
				</Text>
				<FlatList
					data={dummyData}
					contentContainerStyle={styles.list}
					renderItem={({ item }) => (
						<Pressable
							onPress={() => router.push(`/account/${item.id}`)}
						>
							<ProfileCard
								avatar_url={item.avatar_url}
								username={item.username}
							/>
						</Pressable>
					)}
					keyExtractor={(item) => item.id}
				/>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	list: {
		width: 350,
		gap: 10,
	},
});
