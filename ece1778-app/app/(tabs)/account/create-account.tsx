import { useState } from "react";
import {
	Text,
	TextInput,
	View,
	Pressable,
	Alert,
	TouchableWithoutFeedback,
	Keyboard,
} from "react-native";
import { globalStyles } from "@styles/globalStyles";
import { accountStyles } from "@app/styles/accountStyles";
import { useAuthContext } from "../../../contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "@contexts/ThemeContext";

export default function EditAccountScreen() {
	const { signUpWithEmail } = useAuthContext();
	const { theme } = useTheme();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [name, setName] = useState("");

	// Input validation
	const handleSubmit = () => {
		if (
			username.trim() === "" ||
			email.trim() === "" ||
			password.trim() === ""
		) {
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

		if (password.length < 8) {
			Alert.alert(
				"Error",
				"Password must be at least 8 characters long."
			);
			return;
		}

		signUpWithEmail(email, password, name, username).then(({ error }) => {
			if (error) {
				Alert.alert("Error", error.message);
				return;
			}

			Alert.alert(
				"Success",
				"Check your email to verify your account, then sign in."
			);
			router.push({
				pathname: "/account",
				params: { email: email, password: password },
			});
		});
	};

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
						style={
							theme === "light"
								? accountStyles.textLight
								: accountStyles.textDark
						}
						placeholderTextColor={
							theme === "light"
								? accountStyles.textLight.color
								: accountStyles.textDark.color
						}
						placeholder="Name"
						value={name}
						onChangeText={setName}
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
						style={
							theme === "light"
								? accountStyles.textLight
								: accountStyles.textDark
						}
						placeholderTextColor={
							theme === "light"
								? accountStyles.textLight.color
								: accountStyles.textDark.color
						}
						placeholder="Username"
						value={username}
						onChangeText={setUsername}
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
						Email
					</Text>
					<TextInput
						style={
							theme === "light"
								? accountStyles.textLight
								: accountStyles.textDark
						}
						placeholderTextColor={
							theme === "light"
								? accountStyles.textLight.color
								: accountStyles.textDark.color
						}
						placeholder="Email"
						value={email}
						onChangeText={setEmail}
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
						Password
					</Text>
					<TextInput
						style={
							theme === "light"
								? accountStyles.textLight
								: accountStyles.textDark
						}
						placeholderTextColor={
							theme === "light"
								? accountStyles.textLight.color
								: accountStyles.textDark.color
						}
						placeholder="***********"
						value={password}
						onChangeText={setPassword}
						secureTextEntry={true}
					/>
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
					onPress={() => handleSubmit()}
				>
					<Text
						style={[
							accountStyles.text,
							theme === "light"
								? accountStyles.textLight
								: accountStyles.textDark,
						]}
					>
						Create Account
					</Text>
				</Pressable>
			</SafeAreaView>
		</TouchableWithoutFeedback>
	);
}
