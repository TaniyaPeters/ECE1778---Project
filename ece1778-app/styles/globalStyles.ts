import { Platform, StyleSheet } from "react-native";
import { colors } from "../constants/colors";
import { dimentions } from "@app/constants/dimentions";

const defaultSerif = Platform.OS === "ios" ? "Times New Roman" : "serif";
const defaultSans = Platform.OS === "ios" ? "Helvetica" : "sans-serif";

export const globalStyles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		paddingBottom: 0,
		marginBottom: Platform.OS === "ios" ? 50 : 85,
		backgroundColor: colors.light.background,
	},
	titleText: {
		fontSize: 40,
		fontWeight: "bold",
		color: colors.light.secondary,
		textAlign: "center",
		fontFamily: defaultSerif,
	},
	paragraph: {
		fontSize: 20,
		color: colors.light.black,
		marginVertical: 8,
		fontFamily: defaultSans,
	},
	paragraphBold: {
		fontSize: 20,
		color: colors.light.black,
		marginVertical: 8,
		fontWeight: "bold",
		fontFamily: defaultSans,
	},
	detailsImage: {
		width: dimentions.windowWidth * 0.6,
		height: dimentions.windowWidth * 0.6 * 1.5, // 2:3 poster aspect ratio
		borderRadius: 12,
	},
	profileImage: {
		width: 100,
		height: 100,
		borderRadius: 50,
		alignSelf: "center",
	},
	center: {
		justifyContent: "center",
		alignItems: "center",
	},
	errorText: {
		fontSize: 18,
		color: colors.light.danger,
		textAlign: "center",
	},
	errorDescriptionText: {
		fontSize: 18,
		color: colors.light.secondary,
		textAlign: "center",
	},
	errorLoginButton: {
		paddingVertical: 8,
		width: 120,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 16,
		backgroundColor: colors.light.primary,
	},
});
