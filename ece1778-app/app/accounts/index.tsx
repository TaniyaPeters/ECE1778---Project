import { StatusBar } from "expo-status-bar";
import {
	StyleSheet,
	Text,
	View,
	Image,
	Alert,
	Button,
	ScrollView,
	TextInput,
} from "react-native";
import { useAuthContext } from "../../hooks/use-auth-context";
import { globalStyles } from "../../styles/globalStyles";
import { supabase } from "../../lib/supabase.web";
import { Quicksand_400Regular, useFonts } from "@expo-google-fonts/quicksand";
import { Barlow_400Regular } from "@expo-google-fonts/barlow";
import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import { colors } from "../../constants/colors";
import { router } from "expo-router";

async function signUpNewUser() {
	const { data, error } = await supabase.auth.signUp({
		email: "ipxic7wjy@mozmail.com",
		password: "password",
		options: {
			data: {
				full_name: "Test User",
				username: "testuser",
				avatar_url:
					"https://bcvznyabnzjhwrgsfxaj.supabase.co/storage/v1/object/sign/avatars/fern.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83OGZhYTBkNC1jZGI0LTQzNzEtOWU1OC1mNTg1NDI4YTNlZTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdmF0YXJzL2Zlcm4uanBnIiwiaWF0IjoxNzU5NDk5MDcyLCJleHAiOjE3NjAxMDM4NzJ9.evUuAv0wn2urMfy6q4ZDJUs1kZ0pj_TkLSOEv44kUnM",
			},
		},
	});

	Alert.alert("Signed Up!", JSON.stringify({ data, error }));
}

async function signInWithEmail() {
	const { data, error } = await supabase.auth.signInWithPassword({
		email: "ipxic7wjy@mozmail.com",
		password: "password",
	});

	Alert.alert("Signed In!", JSON.stringify({ data, error }));
}

export default function AccountScreen() {
	const { session, profile, isLoggedIn } = useAuthContext();
	const [isEditing, setIsEditing] = useState(false);
	const [isLightMode, setIsLightMode] = useState(true);
	const sun = require("../../assets/sun.png");
	const moon = require("../../assets/moon.png");

	useFonts({ Quicksand_400Regular, Barlow_400Regular });

	useEffect(() => {
		// Load fonts or any other async tasks
	}, []);

	const handleEditProfile = () => {
		setIsEditing(!isEditing);
	};

	return (
		<View style={globalStyles.container}>
			<Pressable
				style={{ marginTop: 32, alignSelf: "flex-end" }}
				onPress={() => setIsLightMode(!isLightMode)}
			>
				<Image
					source={isLightMode ? moon : sun}
					style={{ width: 24, height: 24 }}
				/>
			</Pressable>
			{isLoggedIn ? (
				<View style={styles.container}>
					<Image
						source={{
							uri:
								profile?.avatar_url ??
								"https://bcvznyabnzjhwrgsfxaj.supabase.co/storage/v1/object/sign/avatars/fern.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83OGZhYTBkNC1jZGI0LTQzNzEtOWU1OC1mNTg1NDI4YTNlZTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdmF0YXJzL2Zlcm4uanBnIiwiaWF0IjoxNzU5NDk5MDcyLCJleHAiOjE3NjAxMDM4NzJ9.evUuAv0wn2urMfy6q4ZDJUs1kZ0pj_TkLSOEv44kUnM",
						}}
						style={globalStyles.profileImage}
					/>
					<Text style={styles.profileUsername}>
						@{profile?.username}
					</Text>
					{/* <Button title="Sign Up" onPress={signUpNewUser} /> */}
					<View style={styles.row}>
						<Pressable
							style={({ pressed }: { pressed: boolean }) => [
								styles.button,
								{
									opacity: pressed || isEditing ? 0.6 : 1,
								},
							]}
							onPress={() => {
								router.push("/accounts/edit-account");
							}}
						>
							<Text style={styles.text}>Edit Profile</Text>
						</Pressable>
						<Pressable
							style={({ pressed }: { pressed: boolean }) => [
								styles.button,
								{
									opacity: pressed ? 0.6 : 1,
								},
							]}
							onPress={async () => {}}
						>
							<Text style={styles.text}>Share Profile</Text>
						</Pressable>
					</View>
					<Pressable
						style={styles.hiddenButton}
						onPress={async () => {}}
					>
						<Text style={styles.text}>
							Friends:{" "}
							<Text style={{ fontWeight: "bold" }}>0</Text>
						</Text>
					</Pressable>
				</View>
			) : (
				<View>
					<Text>Please sign in to view your account.</Text>
					<Button title="Sign In" onPress={signInWithEmail} />
				</View>
			)}
			<StatusBar style="auto" />
		</View>
	);
}

const styles = StyleSheet.create({
	button: {
		paddingVertical: 8,
		width: 120,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 10,
		backgroundColor: colors.light.primary,
	},
	hiddenButton: {
		paddingVertical: 8,
		marginTop: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	text: {
		fontFamily: "Barlow_400Regular",
		fontSize: 12,
	},
	container: {
		alignItems: "center",
		backgroundColor: colors.light.background,
		marginTop: 200,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 10,
		maxHeight: 100,
	},
	profileUsername: {
		fontSize: 18,
		fontFamily: "Quicksand_400Regular",
		fontWeight: "bold",
		marginTop: 16,
		textAlign: "center",
	},
});
