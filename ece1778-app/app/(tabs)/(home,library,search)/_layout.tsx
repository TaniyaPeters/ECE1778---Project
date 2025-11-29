import { colors } from "@app/constants/colors";
import { Stack } from "expo-router";

export default function DynamicLayout({segment}:any) {
  if(segment == '(tabs)/(home)'){
    return(
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.light.background },
          headerTitleAlign: "center",
          headerTitleStyle: { color: colors.light.secondary },
          headerBackTitle: "Back",
        }}
      >        
        <Stack.Screen name="(top-tabs)" options={{ title:'Home'}}/>
        <Stack.Screen name="movieDetails/[id]" options={{
          title:"Movie Details",
          headerStyle: { backgroundColor: colors.light.primary },
          }}/>
      </Stack>
    )
  }
  
  if(segment == '(tabs)/(search)'){
    return (    
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.light.background },
          headerTitleAlign: "center",
          headerTitleStyle: { color: colors.light.secondary },
          headerBackTitle: "Back",
        }}
      >        
        <Stack.Screen name="index" options={{ title:"Search"}}/>
        <Stack.Screen name="movieDetails/[id]" options={{
          title:"Movie Details",
          headerStyle: { backgroundColor: colors.light.primary },
        }}/>
      </Stack>
    )
  }
  
  if(segment == '(tabs)/(library)'){
    return (    
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.light.background },
          headerTitleAlign: "center",
          headerTitleStyle: { color: colors.light.secondary },
          headerBackTitle: "Back",
        }}
      >        
        <Stack.Screen name="(top-tabs)" options={{ title:'Library'}}/>
        <Stack.Screen name="collection/[id]" options={{
          title:"",
          headerStyle: { backgroundColor: colors.light.primary },
        }}/>
      </Stack>
    )
  }
  
  return null;
}