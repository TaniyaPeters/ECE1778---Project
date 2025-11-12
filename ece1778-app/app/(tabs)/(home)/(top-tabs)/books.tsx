import MonthlyRecap from "@app/components/MonthlyRecap";
import { useAuthContext } from "@app/contexts/AuthContext";
import { globalStyles } from "@app/styles/globalStyles";
import { router } from "expo-router";
import { Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabBooks() {
  const { isLoggedIn } = useAuthContext();

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={[globalStyles.container, globalStyles.center]} edges={['bottom', 'left', 'right']}>
        <Text style={globalStyles.errorText}>Error: User not authenticated</Text>
        <Text style={globalStyles.errorDescriptionText}>Please login to view the available books.</Text>
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
        <Text style={globalStyles.titleText}>Books Tab</Text>
        <MonthlyRecap user="User" type="Book" action="Read"></MonthlyRecap> 
      </ScrollView>
    </SafeAreaView>
  );
}