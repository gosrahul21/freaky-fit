import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';
import type { WorkoutLog, FetchOptions } from '../types';

interface LogsState {
  logs: WorkoutLog[];
  streak: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: number | null;
}

const initialState: LogsState = {
  logs: [],
  streak: 0,
  status: 'idle',
  error: null,
  lastFetched: null,
};

const LOGS_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

function calculateStreak(logs: WorkoutLog[]): number {
  if (!logs || logs.length === 0) return 0;

  const formatYMD = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  };

  const completedDates = logs
    .filter((log) => log.completed_at)
    .map((log) => formatYMD(new Date(log.completed_at!)));

  const uniqueDates = Array.from(new Set(completedDates));

  let currentStreak = 0;
  const d = new Date();
  if (!uniqueDates.includes(formatYMD(d))) {
    d.setDate(d.getDate() - 1);
  }

  while (uniqueDates.includes(formatYMD(d))) {
    currentStreak++;
    d.setDate(d.getDate() - 1);
  }

  return currentStreak;
}

export const fetchWorkoutLogs = createAsyncThunk<
  WorkoutLog[],
  FetchOptions | undefined,
  { state: { logs: LogsState; auth: { user: { id: string } | null } } }
>(
  'logs/fetchWorkoutLogs',
  async (_, { getState, rejectWithValue }) => {
    try {
      let userId = getState().auth.user?.id;
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      }
      if (!userId) {
        return [];
      }

      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });

      if (error) {
        return rejectWithValue(error.message);
      }

      return (data || []) as WorkoutLog[];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch workout logs';
      return rejectWithValue(message);
    }
  },
  {
    condition: (options, { getState }) => {
      if (options?.force) return true;
      const { status, lastFetched, logs } = getState().logs;
      if (status === 'loading') return false;
      if (logs.length > 0 && lastFetched && Date.now() - lastFetched < LOGS_CACHE_TTL) {
        return false;
      }
      return true;
    },
  }
);

export const addWorkoutLog = createAsyncThunk<
  WorkoutLog,
  Partial<WorkoutLog>,
  { state: { logs: LogsState; auth: { user: { id: string } | null } } }
>(
  'logs/addWorkoutLog',
  async (logData, { getState, rejectWithValue }) => {
    try {
      let userId = getState().auth.user?.id;
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      }
      if (!userId) {
        return rejectWithValue('User must be logged in to save workout log');
      }

      const { data, error } = await supabase
        .from('workout_logs')
        .insert([{ ...logData, user_id: userId }])
        .select()
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return data as WorkoutLog;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save workout log';
      return rejectWithValue(message);
    }
  }
);

export const logsSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    invalidateLogs: (state) => {
      state.lastFetched = null;
    },
    clearLogs: (state) => {
      state.logs = [];
      state.streak = 0;
      state.status = 'idle';
      state.error = null;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkoutLogs.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchWorkoutLogs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.logs = action.payload;
        state.streak = calculateStreak(action.payload);
        state.lastFetched = Date.now();
      })
      .addCase(fetchWorkoutLogs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(addWorkoutLog.fulfilled, (state, action) => {
        state.logs.unshift(action.payload);
        state.streak = calculateStreak(state.logs);
      });
  },
});

export const { invalidateLogs, clearLogs } = logsSlice.actions;
export default logsSlice.reducer;
