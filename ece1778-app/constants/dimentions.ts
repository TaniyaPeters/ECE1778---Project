import { Dimensions } from "react-native";

export const dimentions = {
    windowWidth: Dimensions.get("window").width, 
    windowHeight: Dimensions.get("window").height 
};

// This is the static way of getting the dimesions
// the dynamic way is useWindowDimensions()