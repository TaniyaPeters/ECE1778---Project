import { StatusBar } from "expo-status-bar";
import {
	StyleSheet,
	Text,
	View,
	Image,
	Alert,
	TextInput,
	Keyboard,
	TouchableWithoutFeedback,
} from "react-native";
import { useAuthContext } from "../../hooks/use-auth-context";
import { globalStyles } from "../../styles/globalStyles";
import { supabase } from "../../lib/supabase.web";
import { Quicksand_400Regular, useFonts } from "@expo-google-fonts/quicksand";
import { Barlow_500Medium } from "@expo-google-fonts/barlow";
import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import { colors } from "../../constants/colors";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
	const { session, profile, isLoggedIn } = useAuthContext();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLightMode, setIsLightMode] = useState(true);
	const sun = require("../../assets/sun.png");
	const moon = require("../../assets/moon.png");

	useFonts({ Quicksand_400Regular, Barlow_500Medium });

	useEffect(() => {
		// Load fonts or any other async tasks
	}, []);

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
			email: "socials@yhnl.mozmail.com",
			password: "password",
		});

		Alert.alert("Signed In!", JSON.stringify({ data, error }));
	}

	async function signOut() {
		const { error } = await supabase.auth.signOut();
	}

	return (
		<SafeAreaView style={globalStyles.container}>
			{isLoggedIn ? (
				<View style={styles.container}>
					<View style={styles.row}>
						<Pressable onPress={() => setIsLightMode(!isLightMode)}>
							<Image
								source={isLightMode ? moon : sun}
								style={{ width: 24, height: 24 }}
							/>
						</Pressable>
						<Pressable
							style={{
								alignSelf: "flex-end",
							}}
							onPress={signOut}
						>
							<Text style={styles.text}>Log Out</Text>
						</Pressable>
					</View>
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
									opacity: pressed ? 0.6 : 1,
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
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<View style={styles.container}>
						<Text style={styles.header}>
							Welcome! Sign in or create an account.
						</Text>
						<Pressable>
							<TextInput
								style={styles.input}
								placeholder="Email"
								value={email}
								onChangeText={setEmail}
							/>
						</Pressable>
						<Pressable>
							<TextInput
								style={styles.input}
								placeholder="Password"
								value={password}
								onChangeText={setPassword}
								secureTextEntry={true}
							/>
						</Pressable>
						<Pressable
							style={({ pressed }: { pressed: boolean }) => [
								styles.button,
								{
									opacity: pressed ? 0.6 : 1,
								},
							]}
							onPress={signInWithEmail}
						>
							<Text style={styles.text}>Login</Text>
						</Pressable>
						<Pressable
							style={styles.hiddenButton}
							onPress={() =>
								router.push("/accounts/reset-password")
							}
						>
							<Text style={styles.text}>Forgot Password?</Text>
						</Pressable>
					</View>
				</TouchableWithoutFeedback>
			)}
			<StatusBar style="auto" />
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	button: {
		paddingVertical: 8,
		width: 120,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 16,
		backgroundColor: colors.light.primary,
	},
	header: {
		fontSize: 32,
		fontFamily: "Quicksand_400Regular",
		// fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
	},
	hiddenButton: {
		paddingVertical: 8,
		marginTop: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	input: {
		width: 300,
		borderWidth: 1,
		borderColor: colors.light.secondary,
		borderRadius: 10,
		padding: 10,
		marginVertical: 10,
	},
	text: {
		fontFamily: "Barlow_500Medium",
		fontSize: 12,
	},
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.light.background,
		marginBottom: 150,
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
