// TODO: Import configureStore from "@reduxjs/toolkit"
// TODO: Import preferencesReducer from "../features/preferences/preferencesSlice"
import { configureStore } from "@reduxjs/toolkit";
import preferencesReducer from "@features/preferences/preferencesSlice"
import themeReducer from "@features/theme/themeSlice"

// TODO: Configure and export the Redux store using configureStore
export const store = configureStore({
  // - Include the preferencesReducer under the key "preferences" in the reducer object
  reducer:{
    'preferences': preferencesReducer,
    'theme':themeReducer
  }
});

// TODO: Export RootState type for use with useSelector
export type RootState = ReturnType<typeof store.getState>; // TODO: Infer the type


// TODO: Export AppDispatch type for use with useDispatch
export type AppDispatch = typeof store.dispatch; // TODO: Infer the type