import {Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from '@app/lib/supabase.web';
import { Tables } from '@app/types/database.types';

export async function createNotification(profile:Tables<"profiles">|null|undefined) {
	const token = await registerForPushNotificationsAsync()
  if (token && profile){
    await savePushToken(token, profile);
  }
  Notifications.scheduleNotificationAsync({
    content: { title: "Monthly Recap", body: "Your Monthly Recap is ready!", data:{url:"(tabs)/(home)"} },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 15,
      repeats:true
    },
  });
}

export async function deleteNotification(profile:Tables<"profiles">|null|undefined) {
  Notifications.unregisterForNotificationsAsync()
  Notifications.cancelAllScheduledNotificationsAsync()
  if (profile){
    await deletePushToken(profile);
  }
}

async function deletePushToken(profile:Tables<"profiles">){
  try {
    await supabase
      .from ('tokens')
      .delete()
      .eq('user_id', profile.id)
  } catch (err) {
    console.error("Error!", err);
  }
}



async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('myNotificationChannel', {
      name: 'A channel is needed for the permissions prompt to appear',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(token);
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }
  return token;
}

async function savePushToken(token:string, profile:Tables<"profiles">){
  
  try {
    await supabase
      .from ('tokens')
      .insert([{user_id: profile.id, token: token}])
  } catch (err) {
    console.error("Error!", err);
  }
}


export async function sendPushNotification(title:string, id:number, profile:Tables<"profiles">|undefined|null){
  if (!profile) {return}
  await getFriends(profile).then((friends)=>sendUpdate(title, id, friends, profile))
}

export async function getFriends(profile:Tables<"profiles">){
  let friends:string[]= [];
 try {
    const { data:list} = await supabase
      .from ('friends')
      .select('id')
      .eq('friend_id', profile.id)
    if(list){
      friends = list.map(item => item.id);
    }
  } catch (err) {
    console.error("Error!", err);
    return [];
  }
  return friends
}

export async function sendUpdate(title:string, id:number, friends:string[], profile:Tables<"profiles">){
  console.log(friends)
  const body = profile.username + " just left a FIVE star review on '"+title+"'.";
  try {
    const a = await supabase
      .from ('notification')
      .insert([{user_id: friends, body:body, title:"Five Star Review ⭐⭐⭐⭐⭐", data:id}])
  } catch (err) {
    console.error("Error!", err);
  }
}
