import { globalStyles } from "@app/styles/globalStyles";
import { router } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

export default function TabOneScreen() {
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.titleText}>Movies Tab</Text>
      <Button title="Go to Movie Details" onPress={() => router.push("../movieDetails/1")}/>
    </View>
  );
}