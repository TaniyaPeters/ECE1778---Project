import { Stack } from "expo-router";
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';


export default function RootLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon drawable="ic_media_play"/>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search">
        <Label>Search</Label>
        <Icon drawable="ic_menu_search"/>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="library">
        <Icon drawable="btn_star" />
        <Label>Library</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="account">
        <Label>Account</Label>
        <Icon drawable="ic_menu_preferences"/>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}