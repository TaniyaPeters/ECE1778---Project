import { createContext, useContext } from "react";
import { AuthData } from "../types/types";

export const AuthContext = createContext<AuthData | undefined>({
	session: undefined,
	profile: undefined,
	isLoading: true,
	isLoggedIn: false,
	signInWithEmail: async () => {
		return {};
	},
	signOut: async () => {
		return {};
	},
	signUpWithEmail: async () => {
		return {};
	},
	fetchProfile: async () => {
		return;
	},
});

export const useAuthContext = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}
	return context;
};
