import { useEffect, useState } from "react";
import { Text, TextInput, View, Image, Pressable, Alert } from "react-native";
import { globalStyles } from "../../styles/globalStyles";
import { useAuthContext } from "../../hooks/use-auth-context";
import { colors } from "../../constants/colors";
import { supabase } from "../../lib/supabase.web";

export default function EditAccountScreen() {
	const { session, profile } = useAuthContext();
	const [email, setEmail] = useState(profile?.email || "");
	const [password, setPassword] = useState("");
	const [passwordLocked, setPasswordLocked] = useState(true);
	const [username, setUsername] = useState(profile?.username || "");
	const [name, setName] = useState(profile?.full_name || "");
	const lock = require("../../assets/lock.png");
	const unlock = require("../../assets/unlock.png");

	// Update profile in public.profiles table
	async function updateProfileInDatabase() {
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
	}

	// Input validation
	const handleSubmit = () => {
		if (
			name.trim() === "" ||
			username.trim() === "" ||
			email.trim() === ""
		) {
			Alert.alert("Error", "Cannot leave fields empty.");
			return;
		}

		if (/^[A-Za-z\ ]+$/.test(name) === false) {
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

		if (password === "" && !passwordLocked) {
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

				Alert.alert("Success", "Profile updated successfully!");
			});
	};

	useEffect(() => {
		setPassword("");
	}, [passwordLocked]);

	return (
		<View style={(globalStyles.container, styles.container)}>
			<Image
				source={{
					uri:
						profile?.avatar_url ??
						"https://bcvznyabnzjhwrgsfxaj.supabase.co/storage/v1/object/sign/avatars/fern.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83OGZhYTBkNC1jZGI0LTQzNzEtOWU1OC1mNTg1NDI4YTNlZTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdmF0YXJzL2Zlcm4uanBnIiwiaWF0IjoxNzU5NDk5MDcyLCJleHAiOjE3NjAxMDM4NzJ9.evUuAv0wn2urMfy6q4ZDJUs1kZ0pj_TkLSOEv44kUnM",
				}}
				style={globalStyles.profileImage}
			/>

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
				<View style={styles.row}>
					<TextInput
						placeholder="***********"
						value={password}
						onChangeText={setPassword}
						secureTextEntry={true}
						editable={passwordLocked ? false : true}
					/>
					<Pressable
						onPress={() => setPasswordLocked(!passwordLocked)}
					>
						<Image
							source={passwordLocked ? lock : unlock}
							style={styles.icon}
						/>
					</Pressable>
				</View>
			</View>
			<Pressable
				style={({ pressed }: { pressed: boolean }) => [
					styles.button,
					{
						opacity: pressed ? 0.6 : 1,
					},
				]}
				onPress={handleSubmit}
			>
				<Text style={styles.text}>Save Changes</Text>
			</Pressable>
		</View>
	);
}

const styles = {
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
		paddingTop: 150,
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
		fontFamily: "Barlow_400Regular",
		fontSize: 12,
	},
};
