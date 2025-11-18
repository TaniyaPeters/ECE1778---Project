import MonthlyRecap from "@app/components/MonthlyRecap";
import { colors } from "@app/constants/colors";
import { useAuthContext } from "@app/contexts/AuthContext";
import { supabase } from "@app/lib/supabase.web";
import { globalStyles } from "@app/styles/globalStyles";
import { Tables } from "@app/types/database.types";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
type Movie = Tables<"movies">;
type Review = Tables<"reviews">;

export default function TabBooks() {
  const { isLoggedIn } = useAuthContext();

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={[globalStyles.container, globalStyles.center]} edges={['bottom', 'left', 'right']}>
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
        <Text>No Books to Show right now, Please Come back later</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
