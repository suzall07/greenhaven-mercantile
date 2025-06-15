
import { supabase } from './client';

// Ultra-permissive email validation - accepts any dummy email
export function validateEmail(email: string): boolean {
  // Accept any email with @ symbol - perfect for dummy emails
  return email.includes('@') && email.length > 3;
}

export async function signInWithEmail(email: string, password: string) {
  try {
    // Accept any email format for testing
    const cleanEmail = email.trim();
    
    console.log('Attempting sign in with email:', cleanEmail);
    
    const result = await supabase.auth.signInWithPassword({ 
      email: cleanEmail, 
      password: password.trim()
    });
    
    if (result.error) {
      console.error('Sign in error details:', result.error);
      
      // Handle specific error types
      if (result.error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      } else if (result.error.message.includes('Email not confirmed')) {
        throw new Error('Please check your email and click the confirmation link before signing in.');
      } else if (result.error.message.includes('Too many requests')) {
        throw new Error('Too many login attempts. Please wait a few minutes before trying again.');
      } else {
        throw new Error(`Sign in failed: ${result.error.message}`);
      }
    }

    console.log('Sign in successful:', result.data.user?.email);
    return result;
  } catch (error: any) {
    console.error('Network error during sign in:', error);
    
    // Handle network errors
    if (error.name === 'AuthRetryableFetchError' || error.message === 'Load failed') {
      throw new Error('Network connection failed. Please check your internet connection and try again.');
    }
    
    throw error;
  }
}

export async function signUpWithEmail(email: string, password: string) {
  try {
    // Accept any email format for account creation
    const cleanEmail = email.trim();
    
    console.log('Attempting sign up with email:', cleanEmail);
    
    const result = await supabase.auth.signUp({ 
      email: cleanEmail, 
      password: password.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    
    if (result.error) {
      console.error('Sign up error details:', result.error);
      
      // Handle specific error types including rate limiting
      if (result.error.message.includes('User already registered')) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      } else if (result.error.message.includes('Password should be')) {
        throw new Error('Password must be at least 6 characters long.');
      } else if (result.error.message.includes('signup is disabled')) {
        throw new Error('Account registration is temporarily disabled. Please contact support.');
      } else if (result.error.message.includes('email rate limit exceeded') || result.error.code === 'over_email_send_rate_limit') {
        throw new Error('Too many signup attempts with this email. Please try with a different email address or wait 10-15 minutes before trying again.');
      } else if (result.error.message.includes('rate limit')) {
        throw new Error('Too many requests. Please wait a few minutes before trying again.');
      } else {
        throw new Error(`Sign up failed: ${result.error.message}`);
      }
    }

    console.log('Sign up result:', result.data);
    return result;
  } catch (error: any) {
    console.error('Network error during sign up:', error);
    
    // Handle network errors
    if (error.name === 'AuthRetryableFetchError' || error.message === 'Load failed') {
      throw new Error('Network connection failed. Please check your internet connection and try again.');
    }
    
    throw error;
  }
}

export async function signOut() {
  return supabase.auth.signOut();
}
