import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import type { Profile, FetchOptions } from '../types';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: number | null;
}

const initialState: AuthState = {
  user: null,
  session: null,
  profile: null,
  status: 'idle',
  error: null,
  lastFetched: null,
};

const PROFILE_CACHE_TTL = 3 * 60 * 1000; // 3 minutes

export const fetchUserProfile = createAsyncThunk<
  { user: User | null; profile: Profile | null },
  FetchOptions | undefined,
  { state: { auth: AuthState } }
>(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        return { user: null, profile: null };
      }

      const user = userData.user;
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        return rejectWithValue(profileError.message);
      }

      return { user, profile: profile || null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch user profile';
      return rejectWithValue(message);
    }
  },
  {
    condition: (options, { getState }) => {
      if (options?.force) return true;
      const { status, lastFetched, profile } = getState().auth;
      if (status === 'loading') return false;
      if (profile && lastFetched && Date.now() - lastFetched < PROFILE_CACHE_TTL) {
        return false;
      }
      return true;
    },
  }
);

export const updateUserProfile = createAsyncThunk<
  Profile,
  Partial<Profile>,
  { state: { auth: AuthState } }
>(
  'auth/updateUserProfile',
  async (updates, { getState, rejectWithValue }) => {
    try {
      const userId = getState().auth.user?.id;
      if (!userId) {
        return rejectWithValue('User is not authenticated');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      return rejectWithValue(message);
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthSession: (
      state,
      action: PayloadAction<{ user: User | null; session: Session | null }>
    ) => {
      state.user = action.payload.user;
      state.session = action.payload.session;
    },
    clearAuth: (state) => {
      state.user = null;
      state.session = null;
      state.profile = null;
      state.status = 'idle';
      state.error = null;
      state.lastFetched = null;
    },
    setLocalProfile: (state, action: PayloadAction<Partial<Profile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.lastFetched = Date.now();
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      });
  },
});

export const { setAuthSession, clearAuth, setLocalProfile } = authSlice.actions;
export default authSlice.reducer;

