import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';
import type { Workout, FetchOptions } from '../types';

interface WorkoutsState {
  items: Workout[];
  details: Record<string, Workout>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: number | null;
}

const initialState: WorkoutsState = {
  items: [],
  details: {},
  status: 'idle',
  error: null,
  lastFetched: null,
};

const WORKOUTS_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export const fetchWorkouts = createAsyncThunk<
  Workout[],
  FetchOptions | undefined,
  { state: { workouts: WorkoutsState; auth: { user: { id: string } | null } } }
>(
  'workouts/fetchWorkouts',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      let userId = state.auth.user?.id;
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      }
      if (!userId) {
        return [];
      }

      const { data, error } = await supabase
        .from('workouts')
        .select('*, workout_exercises(id)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return rejectWithValue(error.message);
      }

      return (data || []) as Workout[];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch workouts';
      return rejectWithValue(message);
    }
  },
  {
    condition: (options, { getState }) => {
      if (options?.force) return true;
      const { status, lastFetched, items } = getState().workouts;
      if (status === 'loading') return false;
      if (items.length > 0 && lastFetched && Date.now() - lastFetched < WORKOUTS_CACHE_TTL) {
        return false;
      }
      return true;
    },
  }
);

export const fetchWorkoutById = createAsyncThunk<
  Workout,
  { id: string; force?: boolean },
  { state: { workouts: WorkoutsState } }
>(
  'workouts/fetchWorkoutById',
  async ({ id }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*, workout_exercises(*, exercises(*))')
        .eq('id', id)
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      if (data?.workout_exercises && Array.isArray(data.workout_exercises)) {
        data.workout_exercises.sort(
          (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
        );
      }

      return data as Workout;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch workout details';
      return rejectWithValue(message);
    }
  },
  {
    condition: ({ id, force }, { getState }) => {
      if (force) return true;
      const cached = getState().workouts.details[id];
      if (cached) return false;
      return true;
    },
  }
);

export const deleteWorkout = createAsyncThunk<
  string,
  string,
  { state: { workouts: WorkoutsState } }
>(
  'workouts/deleteWorkout',
  async (workoutId, { rejectWithValue }) => {
    try {
      await supabase.from('workout_exercises').delete().eq('workout_id', workoutId);
      const { error } = await supabase.from('workouts').delete().eq('id', workoutId);
      if (error) {
        return rejectWithValue(error.message);
      }
      return workoutId;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete workout';
      return rejectWithValue(message);
    }
  }
);

export const workoutsSlice = createSlice({
  name: 'workouts',
  initialState,
  reducers: {
    upsertWorkout: (state, action: PayloadAction<Workout>) => {
      const workout = action.payload;
      state.details[workout.id] = workout;
      const index = state.items.findIndex((w) => w.id === workout.id);
      if (index >= 0) {
        state.items[index] = { ...state.items[index], ...workout };
      } else {
        state.items.unshift(workout);
      }
    },
    invalidateWorkouts: (state) => {
      state.lastFetched = null;
    },
    clearWorkouts: (state) => {
      state.items = [];
      state.details = {};
      state.status = 'idle';
      state.error = null;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkouts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchWorkouts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchWorkouts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchWorkoutById.fulfilled, (state, action) => {
        state.details[action.payload.id] = action.payload;
      })
      .addCase(deleteWorkout.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter((w) => w.id !== id);
        delete state.details[id];
      });
  },
});

export const { upsertWorkout, invalidateWorkouts, clearWorkouts } = workoutsSlice.actions;
export default workoutsSlice.reducer;

