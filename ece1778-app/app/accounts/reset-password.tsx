import { View, Text, Alert, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { makeRedirectUri } from "expo-auth-session";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase.web";
import { globalStyles } from "../../styles/globalStyles";
import { Pressable } from "react-native";
import { colors } from "../../constants/colors";
import { useLocalSearchParams } from "expo-router";
import { useAuthContext } from "../../hooks/use-auth-context";

export default function ResetPasswordScreen() {
	const { session } = useAuthContext();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { isRedirect } = useLocalSearchParams();
	const redirectTo = makeRedirectUri({
		scheme: "myapp",
		path: "accounts/reset-password",
		queryParams: { isRedirect: "true" },
	});

	async function resetPassword() {
		if (email.trim() === "") {
			Alert.alert("Error", "Please enter your email address first.");
			return;
		}

		const { data, error } = await supabase.auth.resetPasswordForEmail(
			email,
			{ redirectTo }
		);

		if (error) {
			Alert.alert("Error", error.message);
		} else {
			Alert.alert(
				"Success",
				"Password reset email sent. Please check your inbox."
			);
		}
	}

	async function updatePassword() {
		if (password.trim() === "") {
			Alert.alert("Error", "Password cannot be empty.");
			return;
		}

		if (password.length < 8) {
			Alert.alert(
				"Error",
				"Password must be at least 8 characters long."
			);
			return;
		}

		const { data, error } = await supabase.auth.updateUser({
			password,
		});

		if (error) {
			Alert.alert("Error", error.message);
		} else {
			Alert.alert("Success", "Password updated successfully.");
		}
	}

	useEffect(() => {
		supabase.auth.onAuthStateChange(async (event, session) => {
			if (event == "PASSWORD_RECOVERY") {
				console.log("Password recovery session:", session);
			}
		});
	}, []);

	return (
		<SafeAreaView style={[globalStyles.container, styles.container]}>
			<Pressable>
				<TextInput
					style={styles.input}
					placeholder="Email"
					value={email}
					onChangeText={setEmail}
				/>
			</Pressable>
			{isRedirect ? (
				<Pressable>
					<TextInput
						style={styles.input}
						placeholder="Password"
						value={password}
						onChangeText={setPassword}
						secureTextEntry={true}
					/>
				</Pressable>
			) : null}
			<Pressable
				style={({ pressed }: { pressed: boolean }) => [
					styles.button,
					{
						opacity: pressed ? 0.6 : 1,
					},
				]}
				onPress={() => {
					if (isRedirect) {
						updatePassword();
					} else {
						resetPassword();
					}
				}}
			>
				<Text style={styles.text}>Reset</Text>
			</Pressable>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.light.background,
		marginBottom: 150,
	},
	input: {
		width: 300,
		borderWidth: 1,
		borderColor: colors.light.secondary,
		borderRadius: 10,
		padding: 10,
		marginVertical: 10,
	},
	text: {
		fontFamily: "Barlow_500Medium",
		fontSize: 12,
	},
	button: {
		paddingVertical: 8,
		width: 120,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 16,
		backgroundColor: colors.light.primary,
	},
});
