import { MaterialIcons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { NativeTabs, Icon, Label, VectorIcon } from "expo-router/unstable-native-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(tabs)/(home)">
        <Label>Home</Label>
        {Platform.select({
          ios: <Icon sf="house.fill" />,
          android: <Icon src={<VectorIcon family={MaterialIcons} name="home" />} />,
        })}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(tabs)/(search)">
        <Label>Search</Label>
        {Platform.select({
          ios: <Icon sf="magnifyingglass" />,
          android: <Icon src={<VectorIcon family={MaterialIcons} name="search" />} />,
        })}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(tabs)/(library)">
        <Label>Library</Label>
        {Platform.select({
          ios: <Icon sf="folder.fill" />,
          android: <Icon src={<VectorIcon family={MaterialIcons} name="book" />} />,
        })}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(tabs)/(account)">
        <Label>Account</Label>
        {Platform.select({
          ios: <Icon sf="person.bust.fill" />,
          android: <Icon src={<VectorIcon family={MaterialIcons} name="person" />} />,
        })}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
