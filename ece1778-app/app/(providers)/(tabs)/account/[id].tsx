import { supabase } from "@app/lib/supabase.web";
import { Tables } from "@app/types/database.types";
import { globalStyles } from "@styles/globalStyles";
import { accountStyles } from "@app/styles/accountStyles";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Image, Text, Alert, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "@app/store/store";
import { selectTheme } from "@app/features/theme/themeSlice";
import GeneralCard from "@app/components/generalCard";

type Collection = Tables<"collections">;

export default function ProfileScreen() {
	const { id } = useLocalSearchParams();
	const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
	const [watchedCollection, setWatchedCollection] = useState<Collection | null>(null);
	const [watchedThumbnail, setWatchedThumbnail] = useState<string | undefined>(undefined);
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

	const getWatchedCollection = async (userId: string) => {
		try {
			const { data: collectionData, error: collectionError } = await supabase
				.from("collections")
				.select("*")
				.eq("user_id", userId)
				.eq("name", "Watched")
				.maybeSingle();

			if (collectionError) {
				console.error("Error fetching Watched collection:", collectionError);
				return;
			}

			if (collectionData) {
				setWatchedCollection(collectionData);

				// Fetch thumbnail (first movie's poster)
				if (collectionData.movie_list && collectionData.movie_list.length > 0) {
					const firstMovieId = collectionData.movie_list[0];
					const { data: movieData, error: movieError } = await supabase
						.from("movies")
						.select("poster_path")
						.eq("id", firstMovieId)
						.maybeSingle();

					if (!movieError && movieData?.poster_path) {
						const posterPath = movieData.poster_path.startsWith("/")
							? movieData.poster_path
							: `/${movieData.poster_path}`;
						setWatchedThumbnail(`https://image.tmdb.org/t/p/w500${posterPath}`);
					}
				}
			}
		} catch (err) {
			console.error("Error fetching Watched collection:", err);
		}
	};

	useEffect(() => {
		if (id) {
			getProfileById(id as string);
			getWatchedCollection(id as string);
		}
	}, [id]);

	return (
		<SafeAreaView
			style={[
				setGlobalStyles.container,
				{backgroundColor: colors.background}
			]}
		>
			<ScrollView>
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
							{color: colors.text}
						]}
					>
						@{profile?.username}
					</Text>
				</View>

				{/* Watched Collection Card */}
				{watchedCollection && profile && (
					<TouchableOpacity
						onPress={() => router.push(`./collection/${watchedCollection.id}?username=${encodeURIComponent(profile.username)}`)}
						activeOpacity={0.7}
					>
						<GeneralCard
							image={watchedThumbnail}
							name={watchedCollection.name}
							leftSubText={`${watchedCollection.movie_list?.length || 0} ${(watchedCollection.movie_list?.length || 0) === 1 ? "item" : "items"}`}
							rightSubText={
								watchedCollection.updated_at
									? new Date(watchedCollection.updated_at).toLocaleDateString()
									: undefined
							}
						/>
					</TouchableOpacity>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}
