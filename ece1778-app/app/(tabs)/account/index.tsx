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
import { useAuthContext } from "@contexts/AuthContext";
import { globalStyles } from "@styles/globalStyles";
import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import { colors } from "@constants/colors";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import OAuthSignInButton from "@app/components/OAuthSignIn";

export default function AccountScreen() {
	const { profile, isLoggedIn, signInWithEmail, signOut } = useAuthContext();
	const params = useLocalSearchParams();
	const [email, setEmail] = useState((params.email as string) || "");
	const [password, setPassword] = useState((params.password as string) || "");
	const [isLightMode, setIsLightMode] = useState(true);
	const sun = require("@assets/sun.png");
	const moon = require("@assets/moon.png");

	const handleLogin = async () => {
		if (email.trim() === "" || password.trim() === "") {
			Alert.alert("Error", "Please enter an email and password.");
			return;
		}

		signInWithEmail(email, password).then(({ error }) => {
			if (error) {
				Alert.alert("Error", error.message);
				return;
			}
		});
	};

	useEffect(() => {
		setEmail("");
		setPassword("");
	}, [isLoggedIn]);

	return (
		<SafeAreaView style={globalStyles.container}>
			<View style={styles.row}>
				<Pressable onPress={() => setIsLightMode(!isLightMode)}>
					<Image
						source={isLightMode ? moon : sun}
						style={{ width: 24, height: 24 }}
					/>
				</Pressable>
				{isLoggedIn && (
					<Pressable
						style={{
							alignSelf: "flex-end",
						}}
						onPress={signOut}
					>
						<Text style={styles.text}>Log Out</Text>
					</Pressable>
				)}
			</View>
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
					<View style={styles.row}>
						<Pressable
							style={({ pressed }: { pressed: boolean }) => [
								styles.button,
								{
									opacity: pressed ? 0.6 : 1,
								},
							]}
							onPress={() => {
								router.push("/account/edit-account");
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
					<Pressable
						style={({ pressed }: { pressed: boolean }) => [
							styles.button,
							{
								opacity: pressed ? 0.6 : 1,
							},
						]}
						onPress={() => {
							router.push("/account/collection/1");
						}}
					>
						<Text style={styles.text}>
							Collections
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
						<View style={[styles.row, { marginBottom: 32 }]}>
							<Pressable
								style={({ pressed }: { pressed: boolean }) => [
									styles.button,
									{
										opacity: pressed ? 0.6 : 1,
									},
								]}
								onPress={handleLogin}
							>
								<Text style={styles.text}>Login</Text>
							</Pressable>
							<Pressable
								style={({ pressed }: { pressed: boolean }) => [
									styles.button,
									{
										opacity: pressed ? 0.6 : 1,
									},
								]}
								onPress={() => {
									router.push("/account/create-account");
								}}
							>
								<Text style={styles.text}>Sign Up</Text>
							</Pressable>
						</View>
						<OAuthSignInButton provider="github" />
						<OAuthSignInButton provider="discord" />
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
		marginBottom: 20,
		textAlign: "center",
		color: colors.light.black,
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
		color: colors.light.black,
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
		color: colors.light.black,
	},
});
