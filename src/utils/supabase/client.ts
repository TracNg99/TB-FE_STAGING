import { createClient } from '@supabase/supabase-js';

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient(token?: string) {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      token
        ? {
            auth: {
              autoRefreshToken: true,
              persistSession: true,
            },
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          }
        : {},
    );
  }
  return supabaseInstance;
}

export default getSupabaseClient();
