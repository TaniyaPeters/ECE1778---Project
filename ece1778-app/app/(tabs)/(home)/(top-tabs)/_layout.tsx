import {
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
  createMaterialTopTabNavigator,
} from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "@app/store/store";
import { selectTheme } from "@app/features/theme/themeSlice";

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);


export default function TopTabsLayout() {
  const colors = useSelector((state:RootState)=>selectTheme(state));
  return (
    <MaterialTopTabs screenOptions={{
        tabBarItemStyle:{backgroundColor: colors.background},
        tabBarActiveTintColor:colors.secondary
      }} >
      <MaterialTopTabs.Screen name="index" options={{ title: "Media Recap" }} />
      <MaterialTopTabs.Screen name="movies" options={{ title: "Movies" }} />
      <MaterialTopTabs.Screen name="books" options={{ title: "Books" }} />
    </MaterialTopTabs>
  );
}
