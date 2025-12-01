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
import { useAuthContext } from "@contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@app/store/store";
import { selectTheme } from "@app/features/theme/themeSlice";

export default function EditAccountScreen() {
	const { signUpWithEmail } = useAuthContext();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [name, setName] = useState("");
  	const setGlobalStyles = globalStyles()
	const colors = useSelector((state:RootState)=>selectTheme(state));

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
					setGlobalStyles.container,
					accountStyles.container,
					{backgroundColor: colors.background},
				]}
			>
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
						style={
							{color: colors.text}
						}
						placeholderTextColor={
							colors.text
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
							{color: colors.text}
						]}
					>
						Username
					</Text>
					<TextInput
						style={
							{color: colors.text}
						}
						placeholderTextColor={
							colors.text
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
							{color: colors.text}
						]}
					>
						Email
					</Text>
					<TextInput
						style={
							{color: colors.text}
						}
						placeholderTextColor={
							colors.text
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
							{color: colors.text}
						]}
					>
						Password
					</Text>
					<TextInput
						style={
							{color: colors.text}
						}
						placeholderTextColor={
							colors.text
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
						{backgroundColor: colors.primary},
						{
							opacity: pressed ? 0.6 : 1,
						},
					]}
					onPress={() => handleSubmit()}
				>
					<Text
						style={[
							accountStyles.text,
							{color: colors.text}
						]}
					>
						Create Account
					</Text>
				</Pressable>
			</SafeAreaView>
		</TouchableWithoutFeedback>
	);
}
