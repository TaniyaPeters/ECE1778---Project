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
} from "react-native";
import { globalStyles } from "@styles/globalStyles";
import { useAuthContext } from "@contexts/AuthContext";
import { colors } from "@constants/colors";
import { supabase } from "@lib/supabase.web";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { accountStyles } from "@app/styles/accountStyles";

export default function EditAccountScreen() {
	const { session, profile } = useAuthContext();
	const [email, setEmail] = useState(profile?.email || "");
	const [password, setPassword] = useState("");
	const [passwordLocked, setPasswordLocked] = useState(true);
	const [username, setUsername] = useState(profile?.username || "");
	const [name, setName] = useState(profile?.full_name || "");
	const lock = require("@assets/lock.png");
	const unlock = require("@assets/unlock.png");
	const isOAuth = !session ? false : "iss" in session!.user.user_metadata;

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
					accountStyles.bgLight,
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
					<Text style={[accountStyles.text, accountStyles.textLight]}>
						Name
					</Text>
					<TextInput
						placeholder="Name"
						value={name}
						onChangeText={setName}
					/>
				</View>
				<View style={accountStyles.input}>
					<Text style={[accountStyles.text, accountStyles.textLight]}>
						Username
					</Text>
					<TextInput
						placeholder="Username"
						value={username}
						onChangeText={setUsername}
					/>
				</View>
				{!isOAuth && (
					<View style={accountStyles.input}>
						<Text
							style={[
								accountStyles.text,
								accountStyles.textLight,
							]}
						>
							Email
						</Text>
						<TextInput
							placeholder="Email"
							value={email}
							onChangeText={setEmail}
						/>
					</View>
				)}
				{!isOAuth && (
					<View style={accountStyles.input}>
						<Text
							style={[
								accountStyles.text,
								accountStyles.textLight,
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
							/>
							<Pressable
								onPress={() =>
									setPasswordLocked(!passwordLocked)
								}
							>
								<Image
									source={passwordLocked ? lock : unlock}
									style={styles.icon}
								/>
							</Pressable>
						</View>
					</View>
				)}
				<Pressable
					style={({ pressed }: { pressed: boolean }) => [
						accountStyles.button,
						accountStyles.primaryLight,
						{
							opacity: pressed ? 0.6 : 1,
						},
					]}
					onPress={handleSubmit}
				>
					<Text style={[accountStyles.text, accountStyles.textLight]}>
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
