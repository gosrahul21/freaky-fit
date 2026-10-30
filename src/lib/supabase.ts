import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://aajktulltpawqtqewhgy.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_IY7vxLCjrFVKQiiAq_iooQ_WO17dK68';

const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const rawKey = (process.env.EXPO_PUBLIC_SUPABASE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY)?.trim();

const supabaseUrl = rawUrl || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = rawKey || DEFAULT_SUPABASE_KEY;

if (!rawUrl || !rawKey) {
  console.warn('[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL or KEY. Using default configuration.');
}

const isServer = typeof window === 'undefined';

function initSupabase() {
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: isServer ? undefined : AsyncStorage,
        autoRefreshToken: !isServer,
        persistSession: !isServer,
        detectSessionInUrl: false,
      },
      db: {
        schema: 'freakyfit', // VERY IMPORTANT: Point to our multi-tenant schema
      },
    });
  } catch (err) {
    console.warn('[Supabase] Error initializing client, falling back to default:', err);
    return createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY, {
      auth: { storage: isServer ? undefined : AsyncStorage },
      db: { schema: 'freakyfit' },
    });
  }
}

export const supabase = initSupabase();
