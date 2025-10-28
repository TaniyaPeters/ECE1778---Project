import { globalStyles } from "@app/styles/globalStyles";
import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function TabBooks() {
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.titleText}>Books Tab</Text>
      <Button title="Go to Movie Details" onPress={() => router.push("../movieDetails/1")}/>
    </View>
  );
}