export interface Profile {
  id: string;
  display_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  gender?: string | null;
  age?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  primary_goal?: string | null;
  training_frequency?: string | null;
  target_muscles?: string[] | null;
  referral_source?: string | null;
  push_token?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string | null;
  primary_muscle?: string | null;
  muscle_group?: string | null;
  secondary_muscles?: string[] | null;
  equipment?: string[] | null;
  steps?: any;
  is_verified?: boolean;
  category?: string | null;
  created_at?: string;
  [key: string]: any;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  order_index: number;
  sets?: number | null;
  reps?: string | null;
  timestamp_start?: string | null;
  timestamp_end?: string | null;
  notes?: string | null;
  exercises?: Exercise | null;
  [key: string]: any;
}

export interface Workout {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  is_ai_generated?: boolean;
  source_type?: 'youtube' | 'instagram' | 'tiktok' | 'url' | 'manual' | string;
  source_url?: string | null;
  source_platform?: string | null;
  thumbnail_url?: string | null;
  status?: 'processing' | 'ready' | 'saved' | string;
  created_at?: string;
  updated_at?: string;
  target_muscle?: string | null;
  category?: string | null;
  workout_exercises?: { id: string }[] | WorkoutExercise[] | any[];
  [key: string]: any;
}

export interface CollectionExercise {
  id: string;
  collection_id: string;
  workout_exercise_id: string;
  added_at?: string;
  workout_exercises?: WorkoutExercise | null | any;
  [key: string]: any;
}

export interface Collection {
  id: string;
  user_id: string;
  title: string;
  icon?: string | null;
  color?: string | null;
  created_at?: string;
  collection_exercises?: { id: string }[] | CollectionExercise[] | any[];
  [key: string]: any;
}

export interface PlannerSession {
  id: string;
  planner_id: string;
  title?: string | null;
  week_number: number;
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | string;
  status: 'planned' | 'completed' | 'skipped' | string;
  completed_log_id?: string | null;
  exercises_count?: number | null;
  notes?: string | null;
  [key: string]: any;
}

export interface PlannerPlan {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  duration?: string | null;
  duration_weeks?: number;
  start_date?: string | null;
  status: 'active' | 'paused' | 'completed' | string;
  created_at?: string;
  planner_sessions?: PlannerSession[] | any[];
  [key: string]: any;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  workout_id?: string | null;
  started_at: string;
  completed_at?: string | null;
  duration_seconds?: number | null;
  notes?: string | null;
  [key: string]: any;
}

export interface FetchOptions {
  force?: boolean;
}
