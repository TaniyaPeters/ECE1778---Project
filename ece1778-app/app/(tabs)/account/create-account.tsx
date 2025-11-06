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

export default function EditAccountScreen() {
	const { signUpWithEmail } = useAuthContext();
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
				style={[globalStyles.container, accountStyles.container]}
			>
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
				<View style={accountStyles.input}>
					<Text style={[accountStyles.text, accountStyles.textLight]}>
						Email
					</Text>
					<TextInput
						placeholder="Email"
						value={email}
						onChangeText={setEmail}
					/>
				</View>
				<View style={accountStyles.input}>
					<Text style={[accountStyles.text, accountStyles.textLight]}>
						Password
					</Text>
					<TextInput
						placeholder="***********"
						value={password}
						onChangeText={setPassword}
						secureTextEntry={true}
					/>
				</View>
				<Pressable
					style={({ pressed }: { pressed: boolean }) => [
						accountStyles.button,
						accountStyles.primaryLight,
						{
							opacity: pressed ? 0.6 : 1,
						},
					]}
					onPress={() => handleSubmit()}
				>
					<Text style={[accountStyles.text, accountStyles.textLight]}>
						Create Account
					</Text>
				</Pressable>
			</SafeAreaView>
		</TouchableWithoutFeedback>
	);
}
