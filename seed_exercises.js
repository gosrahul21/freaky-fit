const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'freakyfit' }
});

async function run() {
  const exercises = [
    { name: 'Barbell Bench Press', description: 'Chest compound movement', muscle_group: 'Chest', category: 'Barbell' },
    { name: 'Barbell Squat', description: 'Legs compound movement', muscle_group: 'Legs', category: 'Barbell' },
    { name: 'Pull-up', description: 'Back bodyweight movement', muscle_group: 'Back', category: 'Bodyweight' }
  ];

  const { data, error } = await supabase.from('exercises').insert(exercises).select();
  if (error) console.error("Error:", error);
  else console.log("Seeded:", data.length, "exercises.");
}
run();
