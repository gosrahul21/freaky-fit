import { Share, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { hapticImpactLight } from './haptics';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export async function shareWorkout(workout: { title?: string; source_url?: string; source_type?: string; workout_exercises?: any[] }) {
  hapticImpactLight();
  const title = workout.title || 'Workout';
  let message = `🏋️ ${title.toUpperCase()}\n`;
  if (workout.source_url) {
    message += `Link: ${workout.source_url}\n\n`;
  } else {
    message += `Saved on FreakyFit\n\n`;
  }

  const exercises = workout.workout_exercises || [];
  if (exercises.length > 0) {
    message += `Exercises (${exercises.length}):\n`;
    exercises.forEach((we: any, idx: number) => {
      const name = we.exercises?.name || we.name || 'Exercise';
      const sets = we.sets || 3;
      const reps = we.reps || 10;
      message += `  ${idx + 1}. ${name} (${sets} sets × ${reps} reps)\n`;
    });
    message += '\n';
  }
  message += 'Crush your workouts with FreakyFit 💪🔥';

  try {
    await Share.share(
      Platform.select({
        ios: {
          message,
          url: workout.source_url || undefined,
        },
        default: {
          title,
          message: workout.source_url ? `${message}\n${workout.source_url}` : message,
        },
      })
    );
  } catch (err) {
    console.log('Share error:', err);
  }
}

export async function shareWorkoutPlan(plan: { id?: string; title?: string; [key: string]: any }, sessions?: any[]) {
  hapticImpactLight();
  const title = plan.title || 'Workout Plan';
  let actualSessions = sessions;

  if ((!actualSessions || actualSessions.length === 0) && plan.id) {
    const { data } = await supabase
      .from('planner_sessions')
      .select(`
        *,
        planner_session_exercises (
          id,
          order_index,
          sets,
          reps,
          exercises ( id, name )
        )
      `)
      .eq('planner_id', plan.id);
    actualSessions = data || [];
  }

  let message = `🏋️ ${title.toUpperCase()} - Weekly Training Split\n`;
  message += `Built with FreakyFit\n\n`;

  let totalExercises = 0;
  if (actualSessions && actualSessions.length > 0) {
    DAYS_OF_WEEK.forEach((day, idx) => {
      const session = actualSessions!.find((item: any) => item.day_of_week?.toLowerCase() === day);
      const exercises = session?.planner_session_exercises || [];
      if (exercises.length > 0) {
        totalExercises += exercises.length;
        message += `📅 ${DAY_NAMES[idx]}: ${session.title || 'Workout'}\n`;
        exercises.forEach((pse: any, eIdx: number) => {
          const exName = pse.exercises?.name || pse.name || 'Exercise';
          const sets = pse.sets || 3;
          const reps = pse.reps || '10';
          message += `  ${eIdx + 1}. ${exName} (${sets} sets × ${reps} reps)\n`;
        });
        message += '\n';
      }
    });
  }

  if (totalExercises === 0) {
    message += `Check out my workout split on FreakyFit!\n\n`;
  }

  message += 'Crush your workouts with FreakyFit 💪🔥';

  try {
    await Share.share({
      title,
      message,
    });
  } catch (err) {
    console.log('Share error:', err);
  }
}
