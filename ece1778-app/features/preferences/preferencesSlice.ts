import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { savePreferences } from "../../storage/preferencesStorage";
import { RootState } from "@app/store/store";

// TODO: Define the preferencesState interface
// - Include 'preferences' as Activity[] and 'loaded' as boolean
interface preferencesState {
  preferences:boolean,
  loaded:boolean
}

// TODO: Define the initialState
// - Set 'preferences' to an empty array []
// - Set 'loaded' to false
// Hint: Type it as preferencesState for safety
const initialState:preferencesState = {
  preferences:false,
  loaded:false
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setPreferences: (state, action: PayloadAction<boolean>) => {
      state.preferences = action.payload;
      savePreferences(state.preferences);
    },
    loadPreferences: (state, action: PayloadAction<boolean>) => {
      state.preferences = action.payload;
      state.loaded = true;
    },
  },
});

export const {setPreferences, loadPreferences} = preferencesSlice.actions;

export const selectPreferences = (state: RootState) => {
  // Your code here
  return state.preferences.preferences
}

export default preferencesSlice.reducer;
