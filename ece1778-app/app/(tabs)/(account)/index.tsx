import { View, Text, Button } from "react-native";
import { globalStyles } from "@styles/globalStyles";
export default function Home() {
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.titleText}>Account Screen</Text>
    </View>
  );
}