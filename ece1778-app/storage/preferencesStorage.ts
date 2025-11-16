import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@NotificationEnable";

export async function loadPreference(): Promise<boolean> {
  try{
    const loaded = await AsyncStorage.getItem(STORAGE_KEY);
    return loaded ? JSON.parse(loaded):false;
  }
  catch(error){
    return false;
  }
}

export async function savePreferences(preferences: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch {
  }
}
