import { Alert, Pressable, Text } from "react-native";
import { supabase } from "@lib/supabase.web";
import { router } from "expo-router";
import {
	maybeCompleteAuthSession,
	openAuthSessionAsync,
} from "expo-web-browser";
import { createURL } from "expo-linking";

maybeCompleteAuthSession();

export default function GitHubSignInButton() {
	const redirectTo = createURL("/account");

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

	const signInWithGitHub = async () => {
		// Implement GitHub OAuth sign-in logic here
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "github",
			options: {
				redirectTo,
			},
		});

		if (error) {
			Alert.alert("Error", error.message);
			return;
		}

		const githubOAuthUrl = data.url;

		if (!githubOAuthUrl) {
			Alert.alert("Error", "OAuth not setup.");
			return;
		}

		const result = await openAuthSessionAsync(githubOAuthUrl, redirectTo, {
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
		<Pressable onPress={signInWithGitHub}>
			<Text>Sign in with GitHub</Text>
		</Pressable>
	);
}
