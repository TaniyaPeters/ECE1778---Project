import { colors } from "@app/constants/colors";
import { supabase } from "@app/lib/supabase.web";
import { Tables } from "@app/types/database.types";
import { globalStyles } from "@styles/globalStyles";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet, Image, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
	const { id } = useLocalSearchParams();
	const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);

	const getProfileById = async (id: string) => {
		let { data: profiles, error } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", id);

		if (error) {
			Alert.alert("Error", error.message);
			return;
		}

		if (profiles && profiles.length > 0) {
			setProfile(profiles[0]);
		}
	};

	useEffect(() => {
		getProfileById(id as string);
	}, [id]);

	return (
		<SafeAreaView style={globalStyles.container}>
			<View style={styles.container}>
				<Image
					source={{
						uri:
							profile?.avatar_url ??
							"https://bcvznyabnzjhwrgsfxaj.supabase.co/storage/v1/object/sign/avatars/fern.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83OGZhYTBkNC1jZGI0LTQzNzEtOWU1OC1mNTg1NDI4YTNlZTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdmF0YXJzL2Zlcm4uanBnIiwiaWF0IjoxNzU5NDk5MDcyLCJleHAiOjE3NjAxMDM4NzJ9.evUuAv0wn2urMfy6q4ZDJUs1kZ0pj_TkLSOEv44kUnM",
					}}
					style={globalStyles.profileImage}
				/>
				<Text style={styles.profileUsername}>@{profile?.username}</Text>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.light.background,
		marginBottom: 150,
	},
	profileUsername: {
		fontSize: 18,
		fontFamily: "Quicksand_400Regular",
		fontWeight: "bold",
		marginTop: 16,
		textAlign: "center",
		color: colors.light.black,
	},
});
