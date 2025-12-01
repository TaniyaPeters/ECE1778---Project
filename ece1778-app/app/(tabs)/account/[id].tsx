import { supabase } from "@app/lib/supabase.web";
import { Tables } from "@app/types/database.types";
import { globalStyles } from "@styles/globalStyles";
import { accountStyles } from "@app/styles/accountStyles";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Image, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "@app/store/store";
import { selectTheme } from "@app/features/theme/themeSlice";

export default function ProfileScreen() {
	const { id } = useLocalSearchParams();
	const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  	const setGlobalStyles = globalStyles()
	const colors = useSelector((state:RootState)=>selectTheme(state));

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
		<SafeAreaView
			style={[
				setGlobalStyles.container,
				{backgroundColor: colors.background}
			]}
		>
			<View
				style={[
					accountStyles.container,
					{backgroundColor: colors.background}
				]}
			>
				<Image
					source={{
						uri:
							profile?.avatar_url ??
							"https://bcvznyabnzjhwrgsfxaj.supabase.co/storage/v1/object/sign/avatars/fern.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83OGZhYTBkNC1jZGI0LTQzNzEtOWU1OC1mNTg1NDI4YTNlZTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdmF0YXJzL2Zlcm4uanBnIiwiaWF0IjoxNzU5NDk5MDcyLCJleHAiOjE3NjAxMDM4NzJ9.evUuAv0wn2urMfy6q4ZDJUs1kZ0pj_TkLSOEv44kUnM",
					}}
					style={setGlobalStyles.profileImage}
				/>
				<Text
					style={[
						accountStyles.profileUsername,
						{backgroundColor: colors.text}
					]}
				>
					@{profile?.username}
				</Text>
			</View>
		</SafeAreaView>
	);
}
