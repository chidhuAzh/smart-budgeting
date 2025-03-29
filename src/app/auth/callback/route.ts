import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  if (code) {
    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) throw error;
      
      if (data && data.user) {
        // Check if user already exists in the users table
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', data.user.email)
          .single();
          
        if (!existingUser) {
          // Create user profile if it doesn't exist yet
          await supabase
            .from('users')
            .insert([{ email: data.user.email }]);
        }
      }
      
      // Redirect to the dashboard page
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      console.error('Error processing auth callback:', error);
      // Redirect to the sign-in page in case of error
      return NextResponse.redirect(new URL('/signin', request.url));
    }
  }

  // Redirect to the sign-in page if no code is present
  return NextResponse.redirect(new URL('/signin', request.url));
} 