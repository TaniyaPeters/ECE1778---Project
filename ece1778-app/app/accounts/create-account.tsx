import { useState } from "react";
import {
	Text,
	TextInput,
	View,
	Pressable,
	Alert,
	StyleSheet,
	TouchableWithoutFeedback,
	Keyboard,
} from "react-native";
import { globalStyles } from "../../styles/globalStyles";
import { useAuthContext } from "../../contexts/AuthContext";
import { colors } from "../../constants/colors";
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
				pathname: "/accounts",
				params: { email: email, password: password },
			});
		});
	};

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<SafeAreaView style={[globalStyles.container, styles.container]}>
				<View style={styles.input}>
					<Text style={styles.text}>Name</Text>
					<TextInput
						placeholder="Name"
						value={name}
						onChangeText={setName}
					/>
				</View>
				<View style={styles.input}>
					<Text style={styles.text}>Username</Text>
					<TextInput
						placeholder="Username"
						value={username}
						onChangeText={setUsername}
					/>
				</View>
				<View style={styles.input}>
					<Text style={styles.text}>Email</Text>
					<TextInput
						placeholder="Email"
						value={email}
						onChangeText={setEmail}
					/>
				</View>
				<View style={styles.input}>
					<Text style={styles.text}>Password</Text>
					<TextInput
						placeholder="***********"
						value={password}
						onChangeText={setPassword}
						secureTextEntry={true}
					/>
				</View>
				<Pressable
					style={({ pressed }: { pressed: boolean }) => [
						styles.button,
						{
							opacity: pressed ? 0.6 : 1,
						},
					]}
					onPress={() => handleSubmit()}
				>
					<Text style={styles.text}>Create Account</Text>
				</Pressable>
			</SafeAreaView>
		</TouchableWithoutFeedback>
	);
}

const styles = StyleSheet.create({
	button: {
		paddingVertical: 8,
		width: 120,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 10,
		backgroundColor: colors.light.primary,
	},
	container: {
		flex: 1,
		backgroundColor: colors.light.background,
		alignItems: "center",
	},
	icon: {
		width: 20,
		height: 20,
	},
	input: {
		marginTop: 16,
		paddingHorizontal: 32,
		width: "90%",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	text: {
		fontFamily: "Barlow_500Medium",
		fontSize: 12,
	},
});
