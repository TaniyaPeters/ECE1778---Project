import { Stack } from "expo-router";
import { colors } from "@constants/colors";

export default function AccountLayout() {
	return (
		<Stack
			screenOptions={{
				headerStyle: { backgroundColor: colors.light.primary },
				headerTitleAlign: "center",
				headerTitleStyle: { color: colors.light.secondary },
				headerBackTitle: "Back",
			}}
		>
			<Stack.Screen
				name="index"
				options={{ title: "Account", headerShown: false }}
			/>
			<Stack.Screen
				name="edit-account"
				options={{ title: "Edit Account" }}
			/>
			<Stack.Screen
				name="edit-friends"
				options={{ title: "Edit Friends" }}
			/>
			<Stack.Screen
				name="create-account"
				options={{ title: "Create Account" }}
			/>
			<Stack.Screen name="[id]" options={{ title: "Friend's Profile" }} />
			<Stack.Screen
				name="collection/[id]"
				options={{ title: "Name of Collection" }}
			/>
		</Stack>
	);
}
