import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import workoutsReducer from './slices/workoutsSlice';
import collectionsReducer from './slices/collectionsSlice';
import plansReducer from './slices/plansSlice';
import logsReducer from './slices/logsSlice';
import exercisesReducer from './slices/exercisesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workouts: workoutsReducer,
    collections: collectionsReducer,
    plans: plansReducer,
    logs: logsReducer,
    exercises: exercisesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // For non-serializable values if any (e.g., supabase auth instances)
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

