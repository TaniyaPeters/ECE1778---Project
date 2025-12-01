import { useEffect, useState } from "react";
import {
	Text,
	TextInput,
	View,
	Image,
	Pressable,
	Alert,
	StyleSheet,
	TouchableWithoutFeedback,
	Keyboard,
	Switch,
} from "react-native";
import { globalStyles } from "@styles/globalStyles";
import { useAuthContext } from "@contexts/AuthContext";
import { supabase } from "@lib/supabase.web";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { accountStyles } from "@app/styles/accountStyles";
import { useTheme } from "@contexts/ThemeContext";
import * as Notifications from 'expo-notifications';
import {createNotification, deleteNotification} from "@app/components/Notifications";
import { selectPreferences, setPreferences } from "@app/features/preferences/preferencesSlice";
import { RootState, AppDispatch } from "@app/store/store";
import { useDispatch, useSelector } from "react-redux";
import { selectTheme } from "@app/features/theme/themeSlice";

export default function EditAccountScreen() {
	const { session, profile } = useAuthContext();
	const { theme } = useTheme();
	const [email, setEmail] = useState(profile?.email || "");
	const [password, setPassword] = useState("");
	const [passwordLocked, setPasswordLocked] = useState(true);
	const [username, setUsername] = useState(profile?.username || "");
	const [name, setName] = useState(profile?.full_name || "");
	const lockDark = require("@assets/lock-dark.png");
	const unlockDark = require("@assets/unlock-dark.png");
	const lockWhite = require("@assets/lock-white.png");
	const unlockWhite = require("@assets/unlock-white.png");
	const isOAuth = !session ? false : "iss" in session!.user.user_metadata;
	const preference = useSelector((state:RootState)=>selectPreferences(state));
	const [notificationsEnabled, setNotificationsEnabled] = useState(preference);
	const dispatch:AppDispatch = useDispatch<AppDispatch>()
	const colors = useSelector((state:RootState)=>selectTheme(state));
	const setGlobalStyles = globalStyles()

	async function checkPermissions(){
		const { status: existingStatus } = await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		if (existingStatus !== 'granted') {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;	
		}
		if (finalStatus !== 'granted') {
			Alert.alert("Enable Permissions in App Settings!");
			return
		}
		setNotificationsEnabled(previousState => !previousState);

	}

	// Update profile in public.profiles table
	const updateProfileInDatabase = async () => {
		if (!session?.user) {
			Alert.alert("No user session available");
			return false;
		}

		const { data, error } = await supabase
			.from("profiles")
			.update({ full_name: name, username, email })
			.eq("id", session.user.id)
			.select();

		if (error) {
			Alert.alert("Error updating profile", error.message);
			return false;
		}

		if (data) {
			return true;
		} else {
			return false;
		}
	};

	// Input validation
	const handleSubmit = () => {
		if (username.trim() === "" || email.trim() === "") {
			Alert.alert("Error", "Cannot leave fields empty.");
			return;
		}

		if (name.trim() !== "" && /^[A-Za-z\ ]+$/.test(name) === false) {
			Alert.alert("Error", "Name can only contain letters.");
			return;
		}

		if (username.length < 3) {
			Alert.alert(
				"Error",
				"Username must be at least 3 characters long."
			);
			return;
		}

		if (password.length < 8 && !passwordLocked) {
			Alert.alert(
				"Error",
				"Password must be at least 8 characters long."
			);
			return;
		}

		if (password.trim() === "" && !passwordLocked) {
			Alert.alert(
				"Error",
				"Please enter a new password or lock the field."
			);
			return;
		}

		const updatedPassword: { password?: string } = {};
		if (!passwordLocked) {
			updatedPassword.password = password;
		}
		if(!notificationsEnabled){
			deleteNotification(profile);
      		dispatch(setPreferences(false));		
		}
		else {
			createNotification(profile);
			dispatch(setPreferences(true));
		}


		// Update protected user fields in auth.users table
		supabase.auth
			.updateUser({
				email,
				...updatedPassword,
			})
			.then(({ error }) => {
				if (error) {
					Alert.alert("Error updating user", error.message);
					return false;
				}

				return updateProfileInDatabase();
			})
			.then((success) => {
				if (!success) {
					return;
				}

				session!.user.user_metadata.full_name = name;
				session!.user.user_metadata.username = username;

				Alert.alert("Success", "Profile updated successfully!");
				router.push("/account");
			});
	};

	useEffect(() => {
		setPassword("");
	}, [passwordLocked]);
	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<SafeAreaView
				style={[
					setGlobalStyles.container,
					accountStyles.container,
					{backgroundColor: colors.background},
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

				<View style={accountStyles.input}>
					<Text
						style={[
							accountStyles.text,
							{color: colors.text},
						]}
					>
						Name
					</Text>
					<TextInput
						placeholder="Name"
						value={name}
						onChangeText={setName}
						style={[
							{color: colors.text},
						]}
						placeholderTextColor={
							colors.text
						}
					/>
				</View>
				<View style={accountStyles.input}>
					<Text
						style={[
							accountStyles.text,
							{color: colors.text},
						]}
					>
						Username
					</Text>
					<TextInput
						value={username}
						onChangeText={setUsername}
						style={[
							{color: colors.text},
						]}
						placeholderTextColor={
							colors.text
						}
						placeholder="Username"
					/>
				</View>
				{!isOAuth && (
					<View style={accountStyles.input}>
						<Text
							style={[
								accountStyles.text,
								{color: colors.text},
							]}
						>
							Email
						</Text>
						<TextInput
							placeholder="Email"
							value={email}
							onChangeText={setEmail}
							style={[
							{color: colors.text},
						]}
						placeholderTextColor={
							colors.text
						}
						/>
					</View>
				)}
				{!isOAuth && (
					<View style={accountStyles.input}>
						<Text
							style={[
								accountStyles.text,
								{color: colors.text},
							]}
						>
							Password
						</Text>
						<View style={accountStyles.row}>
							<TextInput
								placeholder="***********"
								value={password}
								onChangeText={setPassword}
								secureTextEntry={true}
								editable={passwordLocked ? false : true}
								style={[
									{color: colors.text},
								]}
								placeholderTextColor={
									colors.text
								}
							/>
							<Pressable
								onPress={() =>
									setPasswordLocked(!passwordLocked)
								}
							>
								<Image
									source={
										passwordLocked
											? theme === "light"
												? lockDark
												: lockWhite
											: theme === "light"
											? unlockDark
											: unlockWhite
									}
									style={styles.icon}
								/>
							</Pressable>
						</View>
					</View>
				)}
				<View style={accountStyles.input}>
					<View style={accountStyles.row}>
						<Text style={{color:colors.text}}>Enable Notifications</Text>
						<Switch
							trackColor={{false: "gray", true: colors.primary}}
							thumbColor={notificationsEnabled ? colors.secondary : 'white'}
							ios_backgroundColor={colors.black}
							onValueChange={checkPermissions}
							value={notificationsEnabled}
						/>
					</View>
				</View>
				<Pressable
					style={({ pressed }: { pressed: boolean }) => [
						accountStyles.button,
						{backgroundColor: colors.primary},
						{
							opacity: pressed ? 0.6 : 1,
						},
					]}
					onPress={handleSubmit}
				>
					<Text
						style={[
							accountStyles.text,
							{color: colors.text},
						]}
					>
						Save Changes
					</Text>
				</Pressable>
			</SafeAreaView>
		</TouchableWithoutFeedback>
	);
}

const styles = StyleSheet.create({
	icon: {
		width: 20,
		height: 20,
	},
});