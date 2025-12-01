import { Stack } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@app/store/store";
import { selectTheme } from "@app/features/theme/themeSlice";

export default function AccountLayout() {
  	const colors = useSelector((state:RootState)=>selectTheme(state));
	return (
			<Stack
				screenOptions={{
					headerStyle: {
						backgroundColor: colors.background,
					},
					headerTitleAlign: "center",
					headerTitleStyle: {
						color:colors.secondary,
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
	);

}
