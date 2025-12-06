import { configureStore } from "@reduxjs/toolkit";
import preferencesReducer from "@features/preferences/preferencesSlice"
import themeReducer from "@features/theme/themeSlice"

// Configure and export the Redux store using configureStore
export const store = configureStore({
  reducer:{
    'preferences': preferencesReducer,
    'theme':themeReducer
  }
});

// Export RootState type for use with useSelector
export type RootState = ReturnType<typeof store.getState>;

// Export AppDispatch type for use with useDispatch
export type AppDispatch = typeof store.dispatch;