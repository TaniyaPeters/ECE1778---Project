import AuthProvider from "@app/providers/auth-provider";
import { MaterialIcons } from "@expo/vector-icons";
import { NativeTabs, Icon, Label, VectorIcon } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";

export default function RootLayout() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}