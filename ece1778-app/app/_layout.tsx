import AuthProvider from "@app/providers/auth-provider";
import { Barlow_500Medium } from "@expo-google-fonts/barlow";
import { Quicksand_400Regular, useFonts } from "@expo-google-fonts/quicksand";
import { MaterialIcons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { NativeTabs, Icon, Label, VectorIcon } from "expo-router/unstable-native-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

export default function RootLayout() {
	useFonts({ Quicksand_400Regular, Barlow_500Medium });
	useNotificationObserver();


	return (
		<AuthProvider>
			<NativeTabs>
				<NativeTabs.Trigger name="(tabs)/(home)">
					<Label>Home</Label>
					{Platform.select({
						ios: <Icon sf="house.fill" />,
						android: (
							<Icon
								src={
									<VectorIcon
										family={MaterialIcons}
										name="home"
									/>
								}
							/>
						),
					})}
				</NativeTabs.Trigger>
				<NativeTabs.Trigger name="(tabs)/(search)">
					<Label>Search</Label>
					{Platform.select({
						ios: <Icon sf="magnifyingglass" />,
						android: (
							<Icon
								src={
									<VectorIcon
										family={MaterialIcons}
										name="search"
									/>
								}
							/>
						),
					})}
				</NativeTabs.Trigger>
				<NativeTabs.Trigger name="(tabs)/(library)">
					<Label>Library</Label>
					{Platform.select({
						ios: <Icon sf="folder.fill" />,
						android: (
							<Icon
								src={
									<VectorIcon
										family={MaterialIcons}
										name="book"
									/>
								}
							/>
						),
					})}
				</NativeTabs.Trigger>
				<NativeTabs.Trigger name="(tabs)/account">
					<Label>Account</Label>
					{Platform.select({
						ios: <Icon sf="person.bust.fill" />,
						android: (
							<Icon
								src={
									<VectorIcon
										family={MaterialIcons}
										name="person"
									/>
								}
							/>
						),
					})}
				</NativeTabs.Trigger>
			</NativeTabs>
		</AuthProvider>
	);
}

function useNotificationObserver() {
  useEffect(() => {
    function redirect(notification: Notifications.Notification) {
       if(notification.request.content.data?.url){
        router.push('/(tabs)/(home)/(top-tabs)')
      }
    }

    const response = Notifications.getLastNotificationResponse();
    if (response?.notification) {
      redirect(response.notification);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      redirect(response.notification);
    });

    return () => {
      subscription.remove();
    };
  }, []);
}

