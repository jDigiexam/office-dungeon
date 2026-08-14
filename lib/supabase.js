import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// We only initialize the client if the keys exist to prevent crashing on load
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export async function saveEscapeTime(teamName, timeInSeconds) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('leaderboard')
    .insert([{ team_name: teamName, escape_time: timeInSeconds }]);
  
  if (error) console.error('Error saving escape time:', error);
  return data;
}