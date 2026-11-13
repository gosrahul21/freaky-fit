import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';
import type { Collection, WorkoutExercise, FetchOptions } from '../types';

interface CollectionDetailData {
  collection: Collection;
  exercises: WorkoutExercise[];
}

interface CollectionsState {
  items: Collection[];
  details: Record<string, CollectionDetailData>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: number | null;
}

const initialState: CollectionsState = {
  items: [],
  details: {},
  status: 'idle',
  error: null,
  lastFetched: null,
};

const COLLECTIONS_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export const fetchCollections = createAsyncThunk<
  Collection[],
  FetchOptions | undefined,
  { state: { collections: CollectionsState; auth: { user: { id: string } | null } } }
>(
  'collections/fetchCollections',
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
        .from('collections')
        .select('*, collection_exercises(id)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return rejectWithValue(error.message);
      }

      return (data || []) as Collection[];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch collections';
      return rejectWithValue(message);
    }
  },
  {
    condition: (options, { getState }) => {
      if (options?.force) return true;
      const { status, lastFetched, items } = getState().collections;
      if (status === 'loading') return false;
      if (items.length > 0 && lastFetched && Date.now() - lastFetched < COLLECTIONS_CACHE_TTL) {
        return false;
      }
      return true;
    },
  }
);

export const fetchCollectionById = createAsyncThunk<
  CollectionDetailData,
  { id: string; force?: boolean },
  { state: { collections: CollectionsState } }
>(
  'collections/fetchCollectionById',
  async ({ id }, { rejectWithValue }) => {
    try {
      const { data: cData, error: cErr } = await supabase
        .from('collections')
        .select('*')
        .eq('id', id)
        .single();

      if (cErr) {
        return rejectWithValue(cErr.message);
      }

      const { data: eData, error: eErr } = await supabase
        .from('collection_exercises')
        .select('*, workout_exercises(*, exercises(*))')
        .eq('collection_id', id)
        .order('added_at', { ascending: false });

      if (eErr) {
        return rejectWithValue(eErr.message);
      }

      const flatExercises: WorkoutExercise[] = (eData || [])
        .map((ce: { workout_exercises: WorkoutExercise }) => ce.workout_exercises)
        .filter(Boolean);

      return {
        collection: cData as Collection,
        exercises: flatExercises,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch collection details';
      return rejectWithValue(message);
    }
  },
  {
    condition: ({ id, force }, { getState }) => {
      if (force) return true;
      const cached = getState().collections.details[id];
      if (cached) return false;
      return true;
    },
  }
);

export const createCollection = createAsyncThunk<
  Collection,
  { title: string },
  { state: { collections: CollectionsState; auth: { user: { id: string } | null } } }
>(
  'collections/createCollection',
  async ({ title }, { getState, rejectWithValue }) => {
    try {
      let userId = getState().auth.user?.id;
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      }
      if (!userId) {
        return rejectWithValue('User must be logged in to create collection');
      }

      const { data, error } = await supabase
        .from('collections')
        .insert([{ title: title.trim(), user_id: userId }])
        .select('*, collection_exercises(id)')
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return data as Collection;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create collection';
      return rejectWithValue(message);
    }
  }
);

export const deleteCollection = createAsyncThunk<
  string,
  string,
  { state: { collections: CollectionsState } }
>(
  'collections/deleteCollection',
  async (collectionId, { rejectWithValue }) => {
    try {
      await supabase.from('collection_exercises').delete().eq('collection_id', collectionId);
      const { error } = await supabase.from('collections').delete().eq('id', collectionId);

      if (error) {
        return rejectWithValue(error.message);
      }

      return collectionId;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete collection';
      return rejectWithValue(message);
    }
  }
);

export const addExercisesToCollection = createAsyncThunk<
  { collectionId: string; newExercisesCount: number },
  { collectionId: string; workoutExerciseIds: string[] },
  { state: { collections: CollectionsState } }
>(
  'collections/addExercisesToCollection',
  async ({ collectionId, workoutExerciseIds }, { rejectWithValue }) => {
    try {
      const inserts = workoutExerciseIds.map((workout_exercise_id) => ({
        collection_id: collectionId,
        workout_exercise_id,
      }));

      const { error } = await supabase.from('collection_exercises').insert(inserts);
      if (error) {
        return rejectWithValue(error.message);
      }

      return { collectionId, newExercisesCount: workoutExerciseIds.length };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add exercises to collection';
      return rejectWithValue(message);
    }
  }
);

export const collectionsSlice = createSlice({
  name: 'collections',
  initialState,
  reducers: {
    invalidateCollections: (state) => {
      state.lastFetched = null;
    },
    clearCollections: (state) => {
      state.items = [];
      state.details = {};
      state.status = 'idle';
      state.error = null;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollections.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchCollectionById.fulfilled, (state, action) => {
        state.details[action.payload.collection.id] = action.payload;
      })
      .addCase(createCollection.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(deleteCollection.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter((c) => c.id !== id);
        delete state.details[id];
      })
      .addCase(addExercisesToCollection.fulfilled, (state, action) => {
        // Invalidate detail cache for this collection so it re-fetches updated exercises if opened
        delete state.details[action.payload.collectionId];
      });
  },
});

export const { invalidateCollections, clearCollections } = collectionsSlice.actions;
export default collectionsSlice.reducer;
