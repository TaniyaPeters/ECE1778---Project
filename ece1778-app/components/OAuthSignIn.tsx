import { Alert, Pressable, Text, Image, View, StyleSheet } from "react-native";
import { supabase } from "@lib/supabase.web";
import {
	maybeCompleteAuthSession,
	openAuthSessionAsync,
} from "expo-web-browser";
import { createURL } from "expo-linking";
import { colors } from "@app/constants/colors";

maybeCompleteAuthSession();

type OAuthProvider = "github" | "discord";

export default function OAuthSignInButton({
	provider,
}: {
	provider: OAuthProvider;
}) {
	const redirectTo = createURL("/account");
	const logos = {
		github: require("@app/assets/github-logo.png"),
		discord: require("@app/assets/discord-logo.png"),
	};

	const extractParamsFromUrl = (url: string) => {
		const parsedUrl = new URL(url);
		const hash = parsedUrl.hash.substring(1); // Remove the leading '#'
		const params = new URLSearchParams(hash);

		return {
			access_token: params.get("access_token"),
			expires_in: parseInt(params.get("expires_in") || "0"),
			refresh_token: params.get("refresh_token"),
			token_type: params.get("token_type"),
			provider_token: params.get("provider_token"),
		};
	};

	const signInWithOAuth = async () => {
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo,
			},
		});

		if (error) {
			Alert.alert("Error", error.message);
			return;
		}

		if (!data.url) {
			Alert.alert("Error", "OAuth not setup for this provider.");
			return;
		}

		const result = await openAuthSessionAsync(data.url, redirectTo, {
			showInRecents: true,
		}).catch((err) => {
			Alert.alert("Error", "Authentication failed to start.");
		});

		if (result && result.type === "success") {
			console.log({ result });

			const { access_token, refresh_token } = extractParamsFromUrl(
				result.url
			);

			if (!access_token || !refresh_token) {
				Alert.alert("Error", "Error retrieving authentication tokens.");
				return;
			}

			const { data, error } = await supabase.auth.setSession({
				access_token,
				refresh_token,
			});

			if (error) {
				Alert.alert("Error", error.message);
				return;
			}
		} else {
			Alert.alert("Error", "Authentication was not successful.");
			return;
		}
	};

	return (
		<Pressable
			onPress={signInWithOAuth}
			style={[
				styles.button,
				{
					backgroundColor:
						provider === "github"
							? colors.light.primary
							: colors.light.discord,
				},
			]}
		>
			<View style={styles.row}>
				<Image
					source={logos[provider]}
					style={styles[`${provider}Logo`]}
				/>
				<Text style={styles.text}>
					Sign in with{" "}
					{provider.charAt(0).toUpperCase() + provider.slice(1)}
				</Text>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		paddingVertical: 8,
		width: 200,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 10,
	},
	githubLogo: {
		width: 24,
		height: 24,
	},
	discordLogo: {
		width: 24,
		height: 18,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 10,
		height: 24,
	},
	text: {
		fontFamily: "Barlow_500Medium",
		fontSize: 12,
	},
});
