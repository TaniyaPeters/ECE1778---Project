import { useAuthContext } from "@app/contexts/AuthContext";
import { globalStyles } from "@app/styles/globalStyles";
import { router } from "expo-router";
import { Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabBooks() {
  const { isLoggedIn } = useAuthContext();
  const setGlobalStyles = globalStyles()

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={[setGlobalStyles.container, setGlobalStyles.center]} edges={['bottom', 'left', 'right']}>
        <Text style={setGlobalStyles.errorDescriptionText}>Please login to view the available books.</Text>
        <Pressable
          style={({ pressed }: { pressed: boolean }) => [
            setGlobalStyles.errorLoginButton,
            { opacity: pressed ? 0.6 : 1, },
          ]}
          onPress={() => router.push('/account')}
        >
          <Text style={setGlobalStyles.errorDescriptionText}>Login</Text>
        </Pressable>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={setGlobalStyles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView>
        <Text style={setGlobalStyles.titleText}>Books Tab</Text>
        <Text>No Books to Show right now, Please Come back later</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
