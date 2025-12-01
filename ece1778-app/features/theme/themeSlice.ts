import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { saveTheme } from "@storage/themeStorage";
import { RootState } from "@store/store";
import { colorsType } from "@app/types/types";
import { colors } from "@app/constants/colors";
interface themeSlice {
  theme:colorsType
  loaded:boolean
}

const initialState:themeSlice = {
  theme:colors.light,
  loaded:false
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<colorsType>) => {
      state.theme = action.payload;
      saveTheme(state.theme);
    },
    loadTheme: (state, action: PayloadAction<colorsType>) => {
      state.theme = action.payload;
      state.loaded = true;
    },
  },
});

export const {setTheme, loadTheme} = themeSlice.actions;

export const selectTheme = (state: RootState) => {
  return state.theme.theme
}

export default themeSlice.reducer;
