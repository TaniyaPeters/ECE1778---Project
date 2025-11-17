import { Stack } from "expo-router";
import { colors } from "@constants/colors";
import { useTheme } from "@contexts/ThemeContext";
import { Provider } from "react-redux";
import { store } from "@app/store/store";

export default function AccountLayout() {
	const { theme } = useTheme();

	return (
		<Provider store={store}>
			<Stack
				screenOptions={{
					headerStyle: {
						backgroundColor:
							theme === "light"
								? colors.light.background
								: colors.dark.background,
					},
					headerTitleAlign: "center",
					headerTitleStyle: {
						color:
							theme === "light"
								? colors.light.secondary
								: colors.dark.secondary,
						fontFamily: "Quicksand_400Regular",
					},
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
				<Stack.Screen name="edit-friends" options={{ title: "" }} />
				<Stack.Screen
					name="create-account"
					options={{ title: "Create Account" }}
				/>
				<Stack.Screen name="[id]" options={{ title: "Friend's Profile" }} />
			</Stack>
		</Provider>
	);

}
