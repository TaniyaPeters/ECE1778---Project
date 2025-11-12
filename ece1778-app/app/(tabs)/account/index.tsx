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
import { useTheme } from "@contexts/ThemeContext";

export default function AccountScreen() {
	const { profile, isLoggedIn, signInWithEmail, signOut } = useAuthContext();
	const { theme, toggleTheme } = useTheme();
	const params = useLocalSearchParams();
	const [email, setEmail] = useState((params.email as string) || "");
	const [password, setPassword] = useState((params.password as string) || "");
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
		<SafeAreaView
			style={[
				globalStyles.container,
				{
					backgroundColor:
						theme === "light"
							? colors.light.background
							: colors.dark.background,
				},
			]}
		>
			<View style={accountStyles.row}>
				<Pressable
					style={({ pressed }) => [
						{
							opacity: pressed ? 0.6 : 1,
						},
					]}
					onPress={toggleTheme}
				>
					<Image
						source={theme === "light" ? moon : sun}
						style={accountStyles.icon}
					/>
				</Pressable>
				{isLoggedIn && (
					<Pressable
						style={({ pressed }) => [
							{
								alignSelf: "flex-end",
								paddingBottom: 5,
								opacity: pressed ? 0.6 : 1,
							},
						]}
						onPress={signOut}
					>
						<Text
							style={[
								accountStyles.text,
								theme === "light"
									? accountStyles.textLight
									: accountStyles.textDark,
							]}
						>
							Log Out
						</Text>
					</Pressable>
				)}
			</View>
			{isLoggedIn ? (
				<View
					style={[
						accountStyles.container,
						theme === "light"
							? accountStyles.bgLight
							: accountStyles.bgDark,
					]}
				>
					<Image
						source={{
							uri:
								profile?.avatar_url ??
								"https://bcvznyabnzjhwrgsfxaj.supabase.co/storage/v1/object/sign/avatars/fern.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83OGZhYTBkNC1jZGI0LTQzNzEtOWU1OC1mNTg1NDI4YTNlZTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdmF0YXJzL2Zlcm4uanBnIiwiaWF0IjoxNzYyOTc5NDIzLCJleHAiOjE3OTQ1MTU0MjN9.Ax6ONyGoqi7EZJUceWpyuHhxD0RoYwajNTfjWp4Pvus",
						}}
						style={globalStyles.profileImage}
					/>
					<Text
						style={[
							accountStyles.profileUsername,
							theme === "light"
								? accountStyles.textLight
								: accountStyles.textDark,
						]}
					>
						@{profile?.username}
					</Text>
					<View style={[accountStyles.row, { gap: 10 }]}>
						<Pressable
							style={({ pressed }: { pressed: boolean }) => [
								accountStyles.button,
								theme === "light"
									? accountStyles.primaryLight
									: accountStyles.primaryDark,
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
									theme === "light"
										? accountStyles.textLight
										: accountStyles.textDark,
								]}
							>
								Edit Profile
							</Text>
						</Pressable>
						<Pressable
							style={({ pressed }: { pressed: boolean }) => [
								accountStyles.button,
								theme === "light"
									? accountStyles.primaryLight
									: accountStyles.primaryDark,
								{
									opacity: pressed ? 0.6 : 1,
								},
							]}
							onPress={async () => {}}
						>
							<Text
								style={[
									accountStyles.text,
									theme === "light"
										? accountStyles.textLight
										: accountStyles.textDark,
								]}
							>
								Share Profile
							</Text>
						</Pressable>
					</View>
					<Pressable
						style={({ pressed }) => [
							styles.hiddenButton,
							{ opacity: pressed ? 0.6 : 1 },
						]}
						onPress={() => router.push("/account/edit-friends")}
					>
						<Text
							style={[
								accountStyles.text,
								theme === "light"
									? accountStyles.textLight
									: accountStyles.textDark,
							]}
						>
							Friends:{" "}
							<Text style={{ fontWeight: "bold" }}>
								{profile?.friends || 0}
							</Text>
						</Text>
					</Pressable>
					<Pressable
						style={({ pressed }: { pressed: boolean }) => [
							accountStyles.button,
							theme === "light"
								? accountStyles.primaryLight
								: accountStyles.primaryDark,
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
								theme === "light"
									? accountStyles.textLight
									: accountStyles.textDark,
							]}
						>
							Collections
						</Text>
					</Pressable>
				</View>
			) : (
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<View
						style={[
							accountStyles.container,
							theme === "light"
								? accountStyles.bgLight
								: accountStyles.bgDark,
						]}
					>
						<Text
							style={[
								accountStyles.header,
								theme === "light"
									? accountStyles.textLight
									: accountStyles.textDark,
							]}
						>
							Welcome! Sign in or create an account.
						</Text>
						<Pressable>
							<TextInput
								style={[
									styles.input,
									{
										borderColor: colors.light.secondary,
									},
									theme === "light"
										? accountStyles.textLight
										: accountStyles.textDark,
								]}
								placeholderTextColor={
									theme === "light"
										? accountStyles.textLight.color
										: accountStyles.textDark.color
								}
								placeholder="Email"
								value={email}
								onChangeText={setEmail}
							/>
						</Pressable>
						<Pressable>
							<TextInput
								style={[
									styles.input,
									{
										borderColor: colors.light.secondary,
										color:
											theme === "light"
												? accountStyles.textLight.color
												: accountStyles.textDark.color,
									},
								]}
								placeholderTextColor={
									theme === "light"
										? accountStyles.textLight.color
										: accountStyles.textDark.color
								}
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
									theme === "light"
										? accountStyles.primaryLight
										: accountStyles.primaryDark,
									{
										opacity: pressed ? 0.6 : 1,
									},
								]}
								onPress={handleLogin}
							>
								<Text
									style={[
										accountStyles.text,
										theme === "light"
											? accountStyles.textLight
											: accountStyles.textDark,
									]}
								>
									Login
								</Text>
							</Pressable>
							<Pressable
								style={({ pressed }: { pressed: boolean }) => [
									accountStyles.button,
									theme === "light"
										? accountStyles.primaryLight
										: accountStyles.primaryDark,
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
										theme === "light"
											? accountStyles.textLight
											: accountStyles.textDark,
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
