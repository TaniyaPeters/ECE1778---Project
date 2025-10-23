import { Stack } from "expo-router";

export default function AccountLayout() {
	return (
		<Stack screenOptions={{ initialRouteName: "index" }}>
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
		</Stack>
	);
}
