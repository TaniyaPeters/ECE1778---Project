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
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import OAuthSignInButton from "@app/components/OAuthSignIn";
import { accountStyles } from "@app/styles/accountStyles";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@app/store/store";
import { selectTheme, setTheme } from "@app/features/theme/themeSlice";
import { colors } from "@app/constants/colors";
import { colorsType } from "@app/types/types";

export default function AccountScreen() {
	const { profile, isLoggedIn, signInWithEmail, signOut } = useAuthContext();
	const params = useLocalSearchParams();
	const [email, setEmail] = useState((params.email as string) || "");
	const [password, setPassword] = useState((params.password as string) || "");
	const sun = require("@assets/sun.png");
	const moon = require("@assets/moon.png");
  	const getColors = useSelector((state:RootState)=>selectTheme(state));
	const [colorsTheme, setColorsTheme] = useState<colorsType>(getColors)
	const dispatch:AppDispatch = useDispatch<AppDispatch>()
	const setGlobalStyles = globalStyles()


	async function toggleTheme(){
		if (colorsTheme.name == 'light'){
			setColorsTheme(colors.dark)
			dispatch(setTheme(colors.dark));		
		}
		else{
			setColorsTheme(colors.light)
			dispatch(setTheme(colors.light));		
		}

	}

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
		setColorsTheme(getColors)
	}, [isLoggedIn]);
	return (
		<SafeAreaView
			style={[setGlobalStyles.container, {backgroundColor:colorsTheme.background}]}
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
						source={colorsTheme.name === "light" ? moon : sun}
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
								{color: colorsTheme.text},
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
						{backgroundColor: colorsTheme.background},
					]}
				>
					<Image
						source={{
							uri:
								profile?.avatar_url ??
								"https://bcvznyabnzjhwrgsfxaj.supabase.co/storage/v1/object/sign/avatars/fern.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83OGZhYTBkNC1jZGI0LTQzNzEtOWU1OC1mNTg1NDI4YTNlZTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdmF0YXJzL2Zlcm4uanBnIiwiaWF0IjoxNzYyOTc5NDIzLCJleHAiOjE3OTQ1MTU0MjN9.Ax6ONyGoqi7EZJUceWpyuHhxD0RoYwajNTfjWp4Pvus",
						}}
						style={setGlobalStyles.profileImage}
					/>
					<Text
						style={[
							accountStyles.profileUsername,
							{color: colorsTheme.text},
						]}
					>
						@{profile?.username}
					</Text>
					<View style={[accountStyles.row, { gap: 10 }]}>
						<Pressable
							style={({ pressed }: { pressed: boolean }) => [
								accountStyles.button,
								{backgroundColor: colorsTheme.primary},
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
									{color: colorsTheme.text},
								]}
							>
								Edit Profile
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
								{color: colorsTheme.text},
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
							{backgroundColor: colorsTheme.primary},
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
								{color: colorsTheme.text},
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
							{backgroundColor: colorsTheme.background},
						]}
					>
						<Text
							style={[
								accountStyles.header,
								{color: colorsTheme.text},
							]}
						>
							Welcome! Sign in or create an account.
						</Text>
						<Pressable>
							<TextInput
								style={[
									styles.input,
									{
										borderColor: colorsTheme.secondary,
									},
									{color: colorsTheme.text},
								]}
								placeholderTextColor={
									colorsTheme.text
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
										borderColor: colorsTheme.secondary,
										color:colorsTheme.text,
									},
								]}
								placeholderTextColor={
									colorsTheme.text
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
									{backgroundColor: colorsTheme.primary},
									{
										opacity: pressed ? 0.6 : 1,
									},
								]}
								onPress={handleLogin}
							>
								<Text
									style={[
										accountStyles.text,
										{color: colorsTheme.text},
									]}
								>
									Login
								</Text>
							</Pressable>
							<Pressable
								style={({ pressed }: { pressed: boolean }) => [
									accountStyles.button,
									{backgroundColor: colorsTheme.primary},
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
										{color: colorsTheme.text},
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
