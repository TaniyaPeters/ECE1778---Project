// code adapted from https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.types";

const storageProvider = {
	getItem: (key: string) => {
		return AsyncStorage.getItem(key);
	},
	setItem: (key: string, value: string) => {
		return AsyncStorage.setItem(key, value);
	},
	removeItem: (key: string) => {
		return AsyncStorage.removeItem(key);
	},
};

export const supabase = createClient<Database>(
	process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
	process.env.EXPO_PUBLIC_SUPABASE_API_KEY ?? "",
	{
		auth: {
			storage: storageProvider,
			storageKey: "@ECE1778_supabase_auth",
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: false,
		},
	}
);
