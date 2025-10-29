import { Platform, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

const defaultSerif = Platform.OS === "ios" ? "Times New Roman" : "serif";
const defaultSans = Platform.OS === "ios" ? "Helvetica" : "sans-serif";

export const globalStyles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
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
		width: "100%",
		height: 400,
		aspectRatio: 1,
		alignSelf: "center",
		paddingBottom: 10,
		paddingTop: 10,
		borderRadius: 16,
		shadowColor: "#000",
		shadowOpacity: 0.55,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 4 },
	},
	profileImage: {
		width: 100,
		height: 100,
		borderRadius: 50,
		alignSelf: "center",
	},
});
