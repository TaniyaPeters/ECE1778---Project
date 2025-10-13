import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="library" options={{ title: "Libray" }} />
      <Stack.Screen name="search" options={{ title: "search" }} />
    </Stack>
  );
}