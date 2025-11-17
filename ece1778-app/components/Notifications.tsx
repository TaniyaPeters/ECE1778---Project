import {Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from '@app/lib/supabase.web';
import { Tables } from '@app/types/database.types';
import React, { useEffect, useState, useRef } from "react";

export async function createNotification(profile:Tables<"profiles">|null|undefined) {
	await createPushNotification()
	const token = await registerForPushNotificationsAsync()
  if (token && profile){
    await savePushToken(token, profile);
  }

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
    const { data, error } = await supabase
      .from ('tokens')
      .delete()
      .eq('user_id', profile.id)
  } catch (err) {
    console.error("Error!", err);
  }
}


async function createPushNotification(){
  Notifications.scheduleNotificationAsync({
		content: { title: "Monthly Recap", body: "Your Monthly Recap is ready!", data:{url:"(tabs)/(home)"} },
		trigger: {
			type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
			seconds: 5,
			repeats:true
		},
	});
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
    const { data, error } = await supabase
      .from ('tokens')
      .insert([{user_id: profile.id, token: token}])
  } catch (err) {
    console.error("Error!", err);
  }
}


export async function sendPushNotification(id:number, profile:Tables<"profiles">|undefined|null){
  if (!profile) {return}
  const friends = await getFriends(profile).then((friends)=>sendUpdate(id, friends))
}

export async function getFriends(profile:Tables<"profiles">){
  let friends:string[]= [];
 try {
    const { data:list} = await supabase
      .from ('friends')
      .select('friend_id')
      .eq('id', profile.id)
    if(list){
      friends = list.map(item => item.friend_id);
    }
  } catch (err) {
    console.error("Error!", err);
    return [];
  }
  return friends
}

export async function sendUpdate(id:number, friends:string[]){
  console.log(friends)
  const body = JSON.stringify({id})
  try {
    const a = await supabase
      .from ('notification')
      .insert([{user_id: friends, body:body}])
    console.log(a)
  } catch (err) {
    console.error("Error!", err);
  }
}
