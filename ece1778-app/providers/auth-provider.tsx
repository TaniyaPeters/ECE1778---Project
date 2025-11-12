// code adapted from https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth
import { Tables } from "../types/database.types";
import { AuthContext } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase.web";
import type { Session } from "@supabase/supabase-js";
import { PropsWithChildren, useEffect, useState } from "react";
import { createURL } from "expo-linking";

export default function AuthProvider({ children }: PropsWithChildren) {
	const [session, setSession] = useState<Session | undefined | null>();
	const [profile, setProfile] = useState<Tables<"profiles"> | null>();
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const redirectToAccount = createURL("/account");

	// Fetch the session once, and subscribe to auth state changes
	useEffect(() => {
		const fetchSession = async () => {
			setIsLoading(true);

			const {
				data: { session },
				error,
			} = await supabase.auth.getSession();

			if (error) {
				console.error("Error fetching session:", error);
			}

			setSession(session);
			setIsLoading(false);
		};

		fetchSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log("Auth state changed:", { event: event, session });
			setSession(session);
		});

		// Cleanup subscription on unmount
		return () => {
			subscription.unsubscribe();
		};
	}, []);

	// Fetch the profile when the session changes
	const fetchProfile = async () => {
		setIsLoading(true);

		if (session) {
			const { data } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", session.user.id)
				.single();

			setProfile(data);
		} else {
			setProfile(null);
		}

		setIsLoading(false);
	};

	useEffect(() => {
		fetchProfile();
	}, [session]);

	const signInWithEmail = async (email: string, password: string) => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			return { error };
		}

		return {};
	};

	const signOut = async () => {
		const { error } = await supabase.auth.signOut();

		if (error) {
			return { error };
		}
		return {};
	};

	const signUpWithEmail = async (
		email: string,
		password: string,
		name: Tables<"profiles">["full_name"],
		username: Tables<"profiles">["username"]
	) => {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: redirectToAccount,
				data: {
					full_name: name ?? "",
					username: username,
					avatar_url:
						"https://bcvznyabnzjhwrgsfxaj.supabase.co/storage/v1/object/sign/avatars/fern.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83OGZhYTBkNC1jZGI0LTQzNzEtOWU1OC1mNTg1NDI4YTNlZTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdmF0YXJzL2Zlcm4uanBnIiwiaWF0IjoxNzYyOTc5NDIzLCJleHAiOjE3OTQ1MTU0MjN9.Ax6ONyGoqi7EZJUceWpyuHhxD0RoYwajNTfjWp4Pvus",
				},
			},
		});

		if (error) {
			return { error };
		}

		return {};
	};

	return (
		<AuthContext.Provider
			value={{
				session,
				isLoading,
				profile,
				signInWithEmail,
				signOut,
				signUpWithEmail,
				fetchProfile,
				isLoggedIn: session != undefined,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
