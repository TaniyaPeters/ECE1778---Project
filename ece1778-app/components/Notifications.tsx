import {Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Database } from '@app/types/database.types';
import { supabase } from '@app/lib/supabase.web';
import { NotificationJson } from '@app/types/types';
let token: string;

export async function registerForPushNotificationsAsync() {
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

// process.serve(
// async (req: any) => { 
// 	const access = 	process.env.EXPO_ACCESS_TOKEN ?? "" 
// 	const payload: Database['public']['Tables']['webpayload']['Row'] = await req.json()  
// 	const { data } = await supabase    
// 		.from('tokens')    
// 		.select('token')    
// 		.eq('id', payload.record_id.user_id)    
// 		.single()  
  
// 	const res = await fetch('https://exp.host/--/api/v2/push/send', {    
// 		method: 'POST',    
// 		headers: {      
// 			'Content-Type': 'application/json',      
// 			Authorization: `Bearer ${access}`,    
// 		},
// 		body: JSON.stringify({      
// 			to: data?.token,      
// 			sound: 'default',      
// 			body: payload.record_id.body,    
// 		}),  
// 	}).then((res) => res.json())  
// 	return new Response(JSON.stringify(res), {    
// 	headers: { 'Content-Type': 'application/json' },  
// })})