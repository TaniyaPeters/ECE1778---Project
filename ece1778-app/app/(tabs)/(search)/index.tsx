import { View, Text, Button } from "react-native";
import { router } from "expo-router";
import { globalStyles } from "@styles/globalStyles";
export default function Home() {
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.titleText}>Search Screen</Text>
      <Button title="Go to Movie Details" onPress={() => router.push("./movieDetails/1")}/>
    </View>
  );
}