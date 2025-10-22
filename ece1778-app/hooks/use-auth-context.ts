// code adapted from https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth
import { Session } from "@supabase/supabase-js";
import { createContext, useContext } from "react";
import { Tables } from "../database.types";

export type AuthData = {
	session?: Session | null;
	profile?: Tables<"profiles"> | null;
	isLoading: boolean;
	isLoggedIn: boolean;
};

export const AuthContext = createContext<AuthData | undefined>({
	session: undefined,
	profile: undefined,
	isLoading: true,
	isLoggedIn: false,
});

export const useAuthContext = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}
	return context;
};
