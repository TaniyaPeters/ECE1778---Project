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

export default function TopTabsLayoutLibrary() {
  const colors = useSelector((state:RootState)=>selectTheme(state));
  return (
    <MaterialTopTabs screenOptions={{
        tabBarItemStyle:{backgroundColor: colors.background},
        tabBarActiveTintColor:colors.secondary,
        tabBarIndicatorStyle:{borderColor: colors.secondary,borderBottomWidth: 1},
      }} >
      <MaterialTopTabs.Screen name="movies" options={{ title: "Movies" }} />
      <MaterialTopTabs.Screen name="books" options={{ title: "Books" }} />
    </MaterialTopTabs>
  );
}
