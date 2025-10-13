import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native';
import { router } from 'expo-router';
export default function LibraryScreen() {
  return (
    <View style={styles.container}>
      <Text>Library Screen</Text>
      <Button title="Go To Home Page" onPress={() => router.push("/")}/>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
