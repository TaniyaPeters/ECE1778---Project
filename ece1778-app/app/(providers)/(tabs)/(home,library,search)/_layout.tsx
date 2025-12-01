import { selectTheme } from "@app/features/theme/themeSlice";
import { RootState } from "@app/store/store";
import { Stack } from "expo-router";
import { useSelector } from "react-redux";

export default function DynamicLayout({segment}:any) {
  const colors = useSelector((state:RootState)=>selectTheme(state));

  if(segment == '(tabs)/(home)'){
    return(
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTitleAlign: "center",
          headerTitleStyle: { color: colors.secondary },
          headerBackTitle: "Back",
        }}
      >        
        <Stack.Screen name="(top-tabs)" options={{ title:'Home'}}/>
        <Stack.Screen name="movieDetails/[id]" options={{
          title:"Movie Details",
          headerStyle: { backgroundColor: colors.primary },
          }}/>
      </Stack>
    )
  }
  
  if(segment == '(tabs)/(search)'){
    return (    
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTitleAlign: "center",
          headerTitleStyle: { color: colors.secondary },
          headerBackTitle: "Back",
        }}
      >        
        <Stack.Screen name="index" options={{ title:"Search"}}/>
        <Stack.Screen name="movieDetails/[id]" options={{
          title:"Movie Details",
          headerStyle: { backgroundColor: colors.primary },
        }}/>
      </Stack>
    )
  }
  
  if(segment == '(tabs)/(library)'){
    return (    
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTitleAlign: "center",
          headerTitleStyle: { color: colors.secondary },
          headerBackTitle: "Back",
        }}
      >        
        <Stack.Screen name="(top-tabs)" options={{ title:'Library'}}/>
        <Stack.Screen name="collection/[id]" options={{
          title:"",
          headerStyle: { backgroundColor: colors.primary },
        }}/>
      </Stack>
    )
  }
  
  return null;
}