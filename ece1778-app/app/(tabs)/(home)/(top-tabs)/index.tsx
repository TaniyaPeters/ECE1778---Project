import MonthlyRecap from "@app/components/MonthlyRecap";
import { globalStyles } from "@app/styles/globalStyles";
import { router } from "expo-router";
import {Button, ScrollView, Text } from "react-native";
import * as Notifications from "expo-notifications"
import { useEffect } from "react";

export default function TabAll() {

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

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.titleText}>All Media</Text>
      <MonthlyRecap user="User" type="Movie" action="Watched"></MonthlyRecap>
      <MonthlyRecap user="User" type="Book" action="Read"></MonthlyRecap>
    </ScrollView>
  );
}