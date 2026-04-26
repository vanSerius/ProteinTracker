import { createClient } from '@supabase/supabase-js';

// Publishable key — safe to expose in client bundles (Supabase's anon-role key, by design).
// Rotate via Supabase dashboard → API → publishable keys, then redeploy.
const URL = 'https://idmufnxwlwpteepjvhli.supabase.co';
const KEY = 'sb_publishable_4bh05m2c7puWVOfuAGaHcA_o5sbWNf9';

export const supabase = createClient(URL, KEY, {
  auth: { persistSession: false },
});
