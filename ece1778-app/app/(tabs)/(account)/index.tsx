import { View, Text, Button, Switch, Alert } from "react-native";
import { globalStyles } from "@styles/globalStyles";
import { useState } from "react";
import * as Notifications from "expo-notifications"


export default function Account() {
  const [isEnabled, setIsEnabled] = useState(false);
  async function registerForNotifications(){
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert("Enable Permissions in App Settings!");
      }
      else{
        setIsEnabled(previousState => !previousState);
        
      }
  }

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.titleText}>Account Screen</Text>
      <View>
        <Text>Enable Notifications</Text>
        <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={registerForNotifications}
            value={isEnabled}
          />
      </View>
    </View>
  );
}

Notifications.scheduleNotificationAsync({
  content: { title: "Monthly Recap", body: "Your Monthly Recap is ready!", data:{url:"(tabs)/(home)"} },
  trigger: {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds: 20,
    repeats:true
  },
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});