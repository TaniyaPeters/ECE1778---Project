import MonthlyRecap from "@app/components/MonthlyRecap";
import { globalStyles } from "@app/styles/globalStyles";
import { router } from "expo-router";
import { Button, ScrollView, Text } from "react-native";

export default function TabBooks() {
  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.titleText}>Books Tab</Text>
      <Button title="Go to Movie Details" onPress={() => router.push("../movieDetails/1")}/>
      <MonthlyRecap user="User" type="Book" action="Read"></MonthlyRecap> 
    </ScrollView>
  );
}