import { AuthError, Session } from "@supabase/supabase-js";
import { Tables } from "./database.types";

//Data type for reviews including the user who wrote it and their review text itself
export type Review = {
	id: number;
	user_id: string;
	username: string;
	rating: number | null;
	review: string | null;
};

export type AuthData = {
	session?: Session | null;
	profile?: Tables<"profiles"> | null;
	isLoading: boolean;
	isLoggedIn: boolean;
	signInWithEmail: (
		email: string,
		password: string
	) => Promise<{ error?: AuthError | null }>;
	signOut: () => Promise<{ error?: AuthError | null }>;
	signUpWithEmail: (
		email: string,
		password: string,
		name: Tables<"profiles">["full_name"],
		username: Tables<"profiles">["username"]
	) => Promise<{ error?: AuthError | null }>;
	fetchProfile: () => Promise<void>;
};

export type ThemeContextType = {
	theme: "light" | "dark";
	toggleTheme: () => void;
};
