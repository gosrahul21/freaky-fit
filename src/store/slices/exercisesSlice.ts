import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';
import type { Exercise, FetchOptions } from '../types';

interface ExercisesState {
  items: Exercise[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: number | null;
}

const initialState: ExercisesState = {
  items: [],
  status: 'idle',
  error: null,
  lastFetched: null,
};

const EXERCISES_CACHE_TTL = 10 * 60 * 1000; // 10 minutes (static exercise library)

export const fetchExercises = createAsyncThunk<
  Exercise[],
  FetchOptions | undefined,
  { state: { exercises: ExercisesState } }
>(
  'exercises/fetchExercises',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from('exercises').select('*');
      if (error) {
        return rejectWithValue(error.message);
      }
      return (data || []) as Exercise[];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch exercises';
      return rejectWithValue(message);
    }
  },
  {
    condition: (options, { getState }) => {
      if (options?.force) return true;
      const { status, lastFetched, items } = getState().exercises;
      if (status === 'loading') return false;
      if (items.length > 0 && lastFetched && Date.now() - lastFetched < EXERCISES_CACHE_TTL) {
        return false;
      }
      return true;
    },
  }
);

export const exercisesSlice = createSlice({
  name: 'exercises',
  initialState,
  reducers: {
    invalidateExercises: (state) => {
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExercises.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchExercises.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchExercises.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { invalidateExercises } = exercisesSlice.actions;
export default exercisesSlice.reducer;

