import { Platform, StyleSheet } from "react-native";
import { dimentions } from "@app/constants/dimentions";
import { useSelector } from "react-redux";
import { RootState } from "@app/store/store";
import { selectTheme } from "@app/features/theme/themeSlice";

const defaultSerif = Platform.OS === "ios" ? "Times New Roman" : "serif";
const defaultSans = Platform.OS === "ios" ? "Helvetica" : "sans-serif";

export function globalStyles() {
	const colors = useSelector((state: RootState) => selectTheme(state));
	const style = StyleSheet.create({
		container: {
			flex: 1,
			padding: 16,
			paddingBottom: 0,
			marginBottom: Platform.OS === "ios" ? 50 : 85,
			backgroundColor: colors.background,
		},
		titleText: {
			fontSize: 40,
			fontWeight: "bold",
			color: colors.secondary,
			textAlign: "center",
			fontFamily: "Quicksand_400Regular",
		},
		paragraph: {
			fontSize: 20,
			color: colors.black,
			marginVertical: 8,
			fontFamily: "Barlow_500Medium",
		},
		paragraphBold: {
			fontSize: 20,
			color: colors.black,
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
			color: colors.danger,
			textAlign: "center",
		},
		errorDescriptionText: {
			fontSize: 18,
			color: colors.secondary,
			textAlign: "center",
		},
		errorLoginButton: {
			paddingVertical: 8,
			width: 120,
			borderRadius: 10,
			alignItems: "center",
			justifyContent: "center",
			marginTop: 16,
			backgroundColor: colors.primary,
		},
		loadingText: {
			marginTop: 16,
			fontSize: 16,
			color: colors.secondary,
		},
	});
	return style;
}
