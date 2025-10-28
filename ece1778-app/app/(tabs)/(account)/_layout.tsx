import { Stack } from "expo-router";
import {SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function HomeLayout() {
  return (    
    <SafeAreaProvider>
      <Stack>        
        <Stack.Screen name="index" options={{ title:"Account"}}/>
      </Stack>
      <SafeAreaView style={{height:90}} />
    </SafeAreaProvider>
  )
}