import {
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
  createMaterialTopTabNavigator,
} from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { globalStyles } from "@app/styles/globalStyles";

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <MaterialTopTabs>
        <MaterialTopTabs.Screen name="movies" options={{ title: "Movies Tab" }} />
        <MaterialTopTabs.Screen name="books" options={{ title: "Books Tab" }} />
      </MaterialTopTabs>
    </SafeAreaProvider>
  );
}
