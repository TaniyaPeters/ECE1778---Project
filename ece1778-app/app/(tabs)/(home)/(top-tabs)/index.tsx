import MonthlyRecap from "@app/components/MonthlyRecap";
import { globalStyles } from "@app/styles/globalStyles";
import { router } from "expo-router";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

export default function TabMovies() {
  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.titleText}>All Media</Text>
      <Button title="Go to Movie Details" onPress={() => router.push("../movieDetails/51")}/>
      <MonthlyRecap user="User" type="Movie" action="Watched"></MonthlyRecap>
      <MonthlyRecap user="User" type="Book" action="Read"></MonthlyRecap>
    </ScrollView>
  );
}