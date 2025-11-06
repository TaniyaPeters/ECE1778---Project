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
import { accountStyles } from "@app/styles/accountStyles";

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
			<View style={accountStyles.row}>
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
							paddingBottom: 5,
						}}
						onPress={signOut}
					>
						<Text
							style={[
								accountStyles.text,
								accountStyles.textLight,
							]}
						>
							Log Out
						</Text>
					</Pressable>
				)}
			</View>
			{isLoggedIn ? (
				<View style={[accountStyles.container, accountStyles.bgLight]}>
					<Image
						source={{
							uri:
								profile?.avatar_url ??
								"https://bcvznyabnzjhwrgsfxaj.supabase.co/storage/v1/object/sign/avatars/fern.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83OGZhYTBkNC1jZGI0LTQzNzEtOWU1OC1mNTg1NDI4YTNlZTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdmF0YXJzL2Zlcm4uanBnIiwiaWF0IjoxNzU5NDk5MDcyLCJleHAiOjE3NjAxMDM4NzJ9.evUuAv0wn2urMfy6q4ZDJUs1kZ0pj_TkLSOEv44kUnM",
						}}
						style={globalStyles.profileImage}
					/>
					<Text
						style={[
							accountStyles.profileUsername,
							accountStyles.textLight,
						]}
					>
						@{profile?.username}
					</Text>
					<View style={[accountStyles.row, { gap: 10 }]}>
						<Pressable
							style={({ pressed }: { pressed: boolean }) => [
								accountStyles.button,
								accountStyles.primaryLight,
								{
									opacity: pressed ? 0.6 : 1,
								},
							]}
							onPress={() => {
								router.push("/account/edit-account");
							}}
						>
							<Text
								style={[
									accountStyles.text,
									accountStyles.textLight,
								]}
							>
								Edit Profile
							</Text>
						</Pressable>
						<Pressable
							style={({ pressed }: { pressed: boolean }) => [
								accountStyles.button,
								accountStyles.primaryLight,
								{
									opacity: pressed ? 0.6 : 1,
								},
							]}
							onPress={async () => {}}
						>
							<Text
								style={[
									accountStyles.text,
									accountStyles.textLight,
								]}
							>
								Share Profile
							</Text>
						</Pressable>
					</View>
					<Pressable
						style={styles.hiddenButton}
						onPress={() => router.push("/account/edit-friends")}
					>
						<Text
							style={[
								accountStyles.text,
								accountStyles.textLight,
							]}
						>
							Friends:{" "}
							<Text style={{ fontWeight: "bold" }}>0</Text>
						</Text>
					</Pressable>
					<Pressable
						style={({ pressed }: { pressed: boolean }) => [
							accountStyles.button,
							accountStyles.primaryLight,
							{
								opacity: pressed ? 0.6 : 1,
							},
						]}
						onPress={() => {
							router.push("/account/collection/1");
						}}
					>
						<Text
							style={[
								accountStyles.text,
								accountStyles.textLight,
							]}
						>
							Collections
						</Text>
					</Pressable>
				</View>
			) : (
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<View
						style={[accountStyles.container, accountStyles.bgLight]}
					>
						<Text
							style={[
								accountStyles.header,
								accountStyles.textLight,
							]}
						>
							Welcome! Sign in or create an account.
						</Text>
						<Pressable>
							<TextInput
								style={[
									styles.input,
									{ borderColor: colors.light.secondary },
								]}
								placeholder="Email"
								value={email}
								onChangeText={setEmail}
							/>
						</Pressable>
						<Pressable>
							<TextInput
								style={[
									styles.input,
									{ borderColor: colors.light.secondary },
								]}
								placeholder="Password"
								value={password}
								onChangeText={setPassword}
								secureTextEntry={true}
							/>
						</Pressable>
						<View
							style={[
								accountStyles.row,
								{ marginBottom: 32, gap: 10 },
							]}
						>
							<Pressable
								style={({ pressed }: { pressed: boolean }) => [
									accountStyles.button,
									accountStyles.primaryLight,
									{
										opacity: pressed ? 0.6 : 1,
									},
								]}
								onPress={handleLogin}
							>
								<Text
									style={[
										accountStyles.text,
										accountStyles.textLight,
									]}
								>
									Login
								</Text>
							</Pressable>
							<Pressable
								style={({ pressed }: { pressed: boolean }) => [
									accountStyles.button,
									accountStyles.primaryLight,
									{
										opacity: pressed ? 0.6 : 1,
									},
								]}
								onPress={() => {
									router.push("/account/create-account");
								}}
							>
								<Text
									style={[
										accountStyles.text,
										accountStyles.textLight,
									]}
								>
									Sign Up
								</Text>
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
	hiddenButton: {
		paddingVertical: 8,
		marginTop: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	input: {
		width: 300,
		borderWidth: 1,
		borderRadius: 10,
		padding: 10,
		marginVertical: 10,
	},
});
