import { StyleSheet } from "react-native";
import { colors } from "@constants/colors";

export const accountStyles = StyleSheet.create({
	bgLight: {
		backgroundColor: colors.light.background,
	},
	bgDark: {
		backgroundColor: colors.dark.background,
	},
	textLight: {
		color: colors.light.black,
	},
	// textDark: {
	// 	color: colors.dark.white,
	// },
	primaryLight: {
		backgroundColor: colors.light.primary,
	},
	// primaryDark: {
	// 	backgroundColor: colors.dark.primary,
	// },
	secondaryLight: {
		backgroundColor: colors.light.secondary,
	},
	secondaryDark: {
		backgroundColor: colors.dark.secondary,
	},
	button: {
		paddingVertical: 8,
		width: 120,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 10,
	},
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 150,
	},
	header: {
		fontSize: 32,
		fontFamily: "Quicksand_400Regular",
		marginBottom: 20,
		textAlign: "center",
	},
	input: {
		marginTop: 16,
		paddingHorizontal: 32,
		width: "90%",
	},
	profileUsername: {
		fontSize: 18,
		fontFamily: "Quicksand_400Regular",
		marginTop: 16,
		marginBottom: 16,
		textAlign: "center",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	text: {
		fontFamily: "Barlow_500Medium",
		fontSize: 12,
	},
});
