import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorsType } from "@app/types/types";
import { colors } from "@app/constants/colors";
const STORAGE_KEY = "@ThemeType";

export async function loadTheme(): Promise<colorsType> {
  try{
    const loaded = await AsyncStorage.getItem(STORAGE_KEY);
    return loaded ? JSON.parse(loaded):colors.light;
  }
  catch(error){
    return colors.light;
  }
}

export async function saveTheme(theme: colorsType): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(theme))
  } catch {
  }
}
