import MonthlyRecap from "@app/components/MonthlyRecap";
import { useAuthContext } from "@app/contexts/AuthContext";
import { globalStyles } from "@app/styles/globalStyles";
import { router } from "expo-router";
import {Pressable, ScrollView, Text } from "react-native";
import * as Notifications from "expo-notifications"
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabAll() {
  const { isLoggedIn } = useAuthContext();

  useEffect(() => {registerForNotifications();}, []);
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log(
          "User tapped notification:",
          response.notification.request.content
        );
      }
    );
    return () => subscription.remove();
  }, []);
  
  async function registerForNotifications(){ await Notifications.requestPermissionsAsync();}

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={[globalStyles.container, globalStyles.center]} edges={['bottom', 'left', 'right']}>
        <Text style={globalStyles.errorText}>Error: User not authenticated</Text>
        <Text style={globalStyles.errorDescriptionText}>Please login to view your media recap.</Text>
        <Pressable
          style={({ pressed }: { pressed: boolean }) => [
            globalStyles.errorLoginButton,
            { opacity: pressed ? 0.6 : 1, },
          ]}
          onPress={() => router.push('/account')}
        >
          <Text style={globalStyles.errorDescriptionText}>Login</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView>
        <Text style={globalStyles.titleText}>Media Recap</Text>
        <MonthlyRecap user="User" type="Movie" action="Watched"></MonthlyRecap>
        <MonthlyRecap user="User" type="Book" action="Read"></MonthlyRecap>
      </ScrollView>
    </SafeAreaView>
  );
}