import AuthProvider from "@app/providers/auth-provider";
import { Barlow_500Medium } from "@expo-google-fonts/barlow";
import { Quicksand_400Regular, useFonts } from "@expo-google-fonts/quicksand";
import { useEffect } from 'react';
import { loadPreference } from "@app/storage/preferencesStorage";
import { store } from "@app/store/store";
import { setPreferences } from "@app/features/preferences/preferencesSlice";
import * as Notifications from "expo-notifications"
import { router, Stack } from "expo-router";
import { loadTheme } from "@app/storage/themeStorage";
import { setTheme } from "@app/features/theme/themeSlice";
import { Provider } from "react-redux";

	
export default function RootLayout() {
    useFonts({ Quicksand_400Regular, Barlow_500Medium });
    useNotificationObserver();

    useEffect(() => {
          loadPreference().then((preference) => {
            store.dispatch(setPreferences(preference));
          });
    
          loadTheme().then((theme) => {
            store.dispatch(setTheme(theme));
            console.log('thie')
            console.log(theme)
          });
    
    }, []);        
	return (
    <Provider store={store}>
      <AuthProvider>
        <Stack screenOptions={{headerShown:false}}></Stack>
      </AuthProvider>
    </Provider>
	);
}

function useNotificationObserver() {
  useEffect(() => {
    function redirect(notification: Notifications.Notification) {
		if(notification.request.content.data?.url){
			if(notification.request.content.data.url =='(tabs)/(home)'){
				router.push('/(providers)/(tabs)/(home)/(top-tabs)')
			}
			else{
				router.push(`/(providers)/(tabs)/(search)/movieDetails/${notification.request.content.data?.url}`)
			}
		}
    }

    const response = Notifications.getLastNotificationResponse();
    if (response?.notification) {
      redirect(response.notification);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      redirect(response.notification);
    });

    return () => {
      subscription.remove();
    };
  }, []);
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
	shouldPlaySound: true,
	shouldSetBadge: false,
	shouldShowBanner: true,
	shouldShowList: true,
  }),
});