// import { getSupabaseClient } from './client';
import { jwtDecode } from 'jwt-decode';

export default function isAuthenticated(token: string) {
  if (!token || token === '') {
    return false;
  }
  // Using supabase-js getUser function to validate the token without exposing supbase project secret key
  const decodedToken = jwtDecode(token);

  try {
    if (!decodedToken) {
      return false;
    }

    const expTime = Number(decodedToken!.exp) * 1000;
    const isExpired = Date.now() > expTime;
    if (isExpired) {
      return false;
    }

    return { data: decodedToken!.exp };
  } catch (err) {
    console.error('Unexpected error during authentication:', err);
    return false;
  }
}
