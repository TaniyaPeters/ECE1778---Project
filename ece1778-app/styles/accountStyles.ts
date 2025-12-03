import { StyleSheet } from "react-native";

export const accountStyles = StyleSheet.create({
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
	icon: {
		width: 24,
		height: 24,
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
