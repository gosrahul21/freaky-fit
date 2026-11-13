import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';
import type { PlannerPlan, PlannerSession, FetchOptions } from '../types';

interface PlansState {
  plans: PlannerPlan[];
  activePlan: PlannerPlan | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: number | null;
}

const initialState: PlansState = {
  plans: [],
  activePlan: null,
  status: 'idle',
  error: null,
  lastFetched: null,
};

const PLANS_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export const fetchPlans = createAsyncThunk<
  PlannerPlan[],
  FetchOptions | undefined,
  { state: { plans: PlansState; auth: { user: { id: string } | null } } }
>(
  'plans/fetchPlans',
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
        .from('planner')
        .select('*, planner_sessions(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return rejectWithValue(error.message);
      }

      return (data || []) as PlannerPlan[];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch plans';
      return rejectWithValue(message);
    }
  },
  {
    condition: (options, { getState }) => {
      if (options?.force) return true;
      const { status, lastFetched, plans } = getState().plans;
      if (status === 'loading') return false;
      if (plans.length > 0 && lastFetched && Date.now() - lastFetched < PLANS_CACHE_TTL) {
        return false;
      }
      return true;
    },
  }
);

export const setActivePlan = createAsyncThunk<
  string,
  string,
  { state: { plans: PlansState; auth: { user: { id: string } | null } } }
>(
  'plans/setActivePlan',
  async (planId, { getState, rejectWithValue }) => {
    try {
      let userId = getState().auth.user?.id;
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      }
      if (!userId) {
        return rejectWithValue('User must be logged in');
      }

      // Mark all user plans as paused, then target as active
      await supabase
        .from('planner')
        .update({ status: 'paused' })
        .eq('user_id', userId);

      const { error } = await supabase
        .from('planner')
        .update({ status: 'active' })
        .eq('id', planId);

      if (error) {
        return rejectWithValue(error.message);
      }

      return planId;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to set active plan';
      return rejectWithValue(message);
    }
  }
);

export const deletePlan = createAsyncThunk<
  string,
  string,
  { state: { plans: PlansState } }
>(
  'plans/deletePlan',
  async (planId, { rejectWithValue }) => {
    try {
      await supabase.from('planner_sessions').delete().eq('planner_id', planId);
      const { error } = await supabase.from('planner').delete().eq('id', planId);
      if (error) {
        return rejectWithValue(error.message);
      }
      return planId;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete plan';
      return rejectWithValue(message);
    }
  }
);

export const updatePlannerSession = createAsyncThunk<
  PlannerSession,
  { sessionId: string; updates: Partial<PlannerSession> },
  { state: { plans: PlansState } }
>(
  'plans/updatePlannerSession',
  async ({ sessionId, updates }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('planner_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return data as PlannerSession;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update planner session';
      return rejectWithValue(message);
    }
  }
);

export const plansSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    invalidatePlans: (state) => {
      state.lastFetched = null;
    },
    clearPlans: (state) => {
      state.plans = [];
      state.activePlan = null;
      state.status = 'idle';
      state.error = null;
      state.lastFetched = null;
    },
    upsertPlanLocally: (state, action: PayloadAction<PlannerPlan>) => {
      const plan = action.payload;
      const idx = state.plans.findIndex((p) => p.id === plan.id);
      if (idx >= 0) {
        state.plans[idx] = { ...state.plans[idx], ...plan };
      } else {
        state.plans.unshift(plan);
      }
      if (plan.status === 'active' || (!state.activePlan && state.plans.length === 1)) {
        state.activePlan = plan;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.plans = action.payload;
        state.lastFetched = Date.now();

        // Determine active plan
        const foundActive = action.payload.find((p) => p.status === 'active');
        state.activePlan = foundActive || (action.payload.length > 0 ? action.payload[0] : null);
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(setActivePlan.fulfilled, (state, action) => {
        const id = action.payload;
        state.plans.forEach((p) => {
          p.status = p.id === id ? 'active' : 'paused';
        });
        const target = state.plans.find((p) => p.id === id);
        if (target) {
          state.activePlan = target;
        }
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        const id = action.payload;
        state.plans = state.plans.filter((p) => p.id !== id);
        if (state.activePlan?.id === id) {
          state.activePlan = state.plans.length > 0 ? state.plans[0] : null;
        }
      })
      .addCase(updatePlannerSession.fulfilled, (state, action) => {
        const updated = action.payload;
        const updateInPlan = (plan: PlannerPlan) => {
          if (!plan.planner_sessions) return;
          const sIdx = plan.planner_sessions.findIndex((s) => s.id === updated.id);
          if (sIdx >= 0) {
            plan.planner_sessions[sIdx] = { ...plan.planner_sessions[sIdx], ...updated };
          }
        };

        state.plans.forEach(updateInPlan);
        if (state.activePlan) {
          updateInPlan(state.activePlan);
        }
      });
  },
});

export const { invalidatePlans, clearPlans, upsertPlanLocally } = plansSlice.actions;
export default plansSlice.reducer;

