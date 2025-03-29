'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        router.push('/dashboard');
      } else {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-5xl font-bold mb-6 text-indigo-700">Smart Budgeting</h1>
      <p className="text-xl max-w-2xl mb-10 text-gray-600">
        Take control of your finances with our intuitive budgeting tools.
        Track expenses, set goals, and achieve financial freedom.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/signin"
          className="bg-indigo-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="bg-white text-indigo-600 border border-indigo-600 px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Sign Up
        </Link>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-indigo-600 text-3xl mb-4">📊</div>
          <h2 className="text-xl font-semibold mb-2">Track Expenses</h2>
          <p className="text-gray-600">
            Easily track where your money goes with intuitive categorization.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-indigo-600 text-3xl mb-4">🎯</div>
          <h2 className="text-xl font-semibold mb-2">Set Goals</h2>
          <p className="text-gray-600">
            Define financial goals and track your progress over time.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-indigo-600 text-3xl mb-4">📈</div>
          <h2 className="text-xl font-semibold mb-2">Visualize Growth</h2>
          <p className="text-gray-600">
            See your financial progress with beautiful charts and reports.
          </p>
        </div>
      </div>
    </div>
  );
}
