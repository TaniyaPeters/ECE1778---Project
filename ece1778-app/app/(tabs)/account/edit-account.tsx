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
	Platform,
} from "react-native";
import { globalStyles } from "@styles/globalStyles";
import { useAuthContext } from "@contexts/AuthContext";
import { supabase } from "@lib/supabase.web";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { accountStyles } from "@app/styles/accountStyles";
import { useTheme } from "@contexts/ThemeContext";
import * as Notifications from 'expo-notifications';
import { colors } from "@app/constants/colors";
import createNotification from "@app/components/Notifications";

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
	const [notificationsEnabled, setNotificationsEnabled] = useState(false);

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
		if(!notificationsEnabled){
			Notifications.unregisterForNotificationsAsync()
			Notifications.cancelAllScheduledNotificationsAsync()
		}
		else {
			createNotification(profile)
		}

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
					globalStyles.container,
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
							"https://bcvznyabnzjhwrgsfxaj.supabase.co/storage/v1/object/sign/avatars/fern.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83OGZhYTBkNC1jZGI0LTQzNzEtOWU1OC1mNTg1NDI4YTNlZTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdmF0YXJzL2Zlcm4uanBnIiwiaWF0IjoxNzU5NDk5MDcyLCJleHAiOjE3NjAxMDM4NzJ9.evUuAv0wn2urMfy6q4ZDJUs1kZ0pj_TkLSOEv44kUnM",
					}}
					style={globalStyles.profileImage}
				/>

				<View style={accountStyles.input}>
					<Text
						style={[
							accountStyles.text,
							theme === "light"
								? accountStyles.textLight
								: accountStyles.textDark,
						]}
					>
						Name
					</Text>
					<TextInput
						placeholder="Name"
						value={name}
						onChangeText={setName}
						style={[
							theme === "light"
								? accountStyles.textLight
								: accountStyles.textDark,
						]}
						placeholderTextColor={
							theme === "light"
								? accountStyles.textLight.color
								: accountStyles.textDark.color
						}
					/>
				</View>
				<View style={accountStyles.input}>
					<Text
						style={[
							accountStyles.text,
							theme === "light"
								? accountStyles.textLight
								: accountStyles.textDark,
						]}
					>
						Username
					</Text>
					<TextInput
						value={username}
						onChangeText={setUsername}
						style={[
							theme === "light"
								? accountStyles.textLight
								: accountStyles.textDark,
						]}
						placeholderTextColor={
							theme === "light"
								? accountStyles.textLight.color
								: accountStyles.textDark.color
						}
						placeholder="Username"
					/>
				</View>
				{!isOAuth && (
					<View style={accountStyles.input}>
						<Text
							style={[
								accountStyles.text,
								theme === "light"
									? accountStyles.textLight
									: accountStyles.textDark,
							]}
						>
							Email
						</Text>
						<TextInput
							placeholder="Email"
							value={email}
							onChangeText={setEmail}
							style={[
								theme === "light"
									? accountStyles.textLight
									: accountStyles.textDark,
							]}
							placeholderTextColor={
								theme === "light"
									? accountStyles.textLight.color
									: accountStyles.textDark.color
							}
						/>
					</View>
				)}
				{!isOAuth && (
					<View style={accountStyles.input}>
						<Text
							style={[
								accountStyles.text,
								theme === "light"
									? accountStyles.textLight
									: accountStyles.textDark,
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
									theme === "light"
										? accountStyles.textLight
										: accountStyles.textDark,
								]}
								placeholderTextColor={
									theme === "light"
										? accountStyles.textLight.color
										: accountStyles.textDark.color
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
						<Text>Enable Notifications</Text>
						<Switch
							trackColor={{false: "gray", true: colors.light.primary}}
							thumbColor={notificationsEnabled ? colors.light.secondary : 'white'}
							ios_backgroundColor={colors.light.black}
							onValueChange={checkPermissions}
							value={notificationsEnabled}
						/>
					</View>
				</View>
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
					onPress={handleSubmit}
				>
					<Text
						style={[
							accountStyles.text,
							theme === "light"
								? accountStyles.textLight
								: accountStyles.textDark,
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