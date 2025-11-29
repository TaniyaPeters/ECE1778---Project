import {
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
  createMaterialTopTabNavigator,
} from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function TopTabsLayout() {
  return (
    <MaterialTopTabs>
      <MaterialTopTabs.Screen name="index" options={{ title: "Media Recap" }} />
      <MaterialTopTabs.Screen name="movies" options={{ title: "Movies" }} />
      <MaterialTopTabs.Screen name="books" options={{ title: "Books" }} />
    </MaterialTopTabs>
  );
}
