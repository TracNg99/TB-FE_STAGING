import { getSupabaseClient } from './client';

export default async function isAuthenticated(token: string) {
  // Using supabase-js getUser function to validate the token without exposing supbase project secret key
  const supabase = getSupabaseClient(token);

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return false;
    }

    return { data: user!.id };
  } catch (err) {
    console.error('Unexpected error during authentication:', err);
    return false;
  }
}
