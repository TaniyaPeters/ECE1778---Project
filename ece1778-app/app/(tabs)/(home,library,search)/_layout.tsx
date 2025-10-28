import { Stack } from "expo-router";
import React from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function DynamicLayout({segment}:any) {
  
  if(segment =='(tabs)/(home)'){
    return(  
    <SafeAreaProvider>
      <Stack>        
        <Stack.Screen name="(top-tabs)" options={{ title:'Home'}}/>
        <Stack.Screen name="movieDetails/[id]" options={{title:"Movie Details"}}/>
      </Stack>
      <SafeAreaView style={{height:90}} />
    </SafeAreaProvider>
    )
  }
  const seg = ((segment.toString()).split('(')[2])
  const titleSeg = seg[0].toUpperCase() + seg.substr(1,seg.length-2)
  
  return (    
    <SafeAreaProvider>
      <Stack>        
        <Stack.Screen name="index" options={{ title:titleSeg}}/>
        <Stack.Screen name="movieDetails/[id]" options={{title:"Movie Details"}}/>
      </Stack>
      <SafeAreaView style={{height:90}} />
    </SafeAreaProvider>
  )
}
