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
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-purple-200">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern/Effect */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        {/* Navigation */}
        <nav className="relative z-10 container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-purple-400">Smart</span>
            <span className="text-2xl font-bold text-white">Budget</span>
          </div>
          <div className="flex space-x-4">
            <span style={{ transform: 'translateY(6px)' }}>
              <Link href="/signin" className="text-white hover:text-purple-300 transition-colors">
                Sign In
              </Link>

            </span>
            <Link href="/signup" className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors">
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative container mx-auto px-6 pt-20 pb-24 flex flex-col lg:flex-row items-center">
          {/* Left Side - Text Content */}
          <div className="lg:w-1/2 lg:pr-16 text-center lg:text-left mb-12 lg:mb-0">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Take Control of Your <span className="text-purple-400">Financial Future</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0">
              Smart Budgeting helps you track expenses, visualize trends, and achieve your financial goals with powerful, easy-to-use tools.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start">
              <Link href="/signup"
                className="bg-gradient-to-r from-purple-600 to-purple-500 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
                Start For Free
              </Link>
              <Link href="#demo"
                className="bg-gray-800 text-white border border-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Demo
              </Link>
            </div>
          </div>

          {/* Right Side - Image or Dashboard Preview */}
          <div className="lg:w-1/2 relative">
            <div className="bg-gradient-to-r from-purple-800/30 to-blue-800/30 rounded-2xl p-1 shadow-2xl">
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="relative w-full h-[500px]">
                  {/* You can replace this with an actual Image component if you have a dashboard screenshot */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
                    {/* Simulated Dashboard Elements */}
                    <div className="p-6">
                      <div className="mb-6 flex justify-between items-center">
                        <div className="bg-gray-700 h-8 w-32 rounded-md"></div>
                        <div className="bg-purple-700 h-8 w-24 rounded-md"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-700 h-24 rounded-lg p-4">
                          <div className="bg-gray-600 h-4 w-16 mb-2 rounded"></div>
                          <div className="bg-purple-500 h-6 w-24 rounded"></div>
                        </div>
                        <div className="bg-gray-700 h-24 rounded-lg p-4">
                          <div className="bg-gray-600 h-4 w-16 mb-2 rounded"></div>
                          <div className="bg-green-500 h-6 w-20 rounded"></div>
                        </div>
                        <div className="bg-gray-700 h-24 rounded-lg p-4">
                          <div className="bg-gray-600 h-4 w-16 mb-2 rounded"></div>
                          <div className="bg-red-500 h-6 w-28 rounded"></div>
                        </div>
                      </div>
                      <div className="bg-gray-700 h-64 rounded-lg p-4">
                        <div className="bg-gray-600 h-4 w-32 mb-4 rounded"></div>
                        <div className="flex items-end h-40 space-x-2">
                          <div className="bg-purple-500 w-8 h-20 rounded-t-md"></div>
                          <div className="bg-purple-600 w-8 h-32 rounded-t-md"></div>
                          <div className="bg-purple-700 w-8 h-16 rounded-t-md"></div>
                          <div className="bg-purple-800 w-8 h-24 rounded-t-md"></div>
                          <div className="bg-purple-900 w-8 h-12 rounded-t-md"></div>
                          <div className="bg-purple-600 w-8 h-36 rounded-t-md"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges/elements for visual interest */}
            {/* <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg">
              Save 40% Monthly
            </div> */}
            <div className="absolute bottom-12 -left-8 bg-purple-700 text-white px-6 py-3 rounded-xl shadow-lg transform rotate-6">
              Goal Tracking
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to master your finances in one intuitive platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Expense Tracking</h3>
              <p className="text-gray-400 mb-4">
                Easily track all your expenses with automatic categorization and real-time updates.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Automatic categorization
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Filter by date & category
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Recurring expense detection
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Advanced Analytics</h3>
              <p className="text-gray-400 mb-4">
                Get insights into your spending patterns with beautiful visualizations and reports.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Monthly spending breakdown
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Trend analysis
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Customizable dashboards
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Financial Goals</h3>
              <p className="text-gray-400 mb-4">
                Set and track financial goals with progress visualization and smart recommendations.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Savings target tracking
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Debt reduction planning
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Achievement celebrations
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-6">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-3xl p-2">
            <div className="bg-gray-900 rounded-2xl px-8 py-12 md:px-16 md:py-16 flex flex-col md:flex-row items-center justify-between">
              <div className="mb-8 md:mb-0 md:max-w-xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your finances?</h2>
                <p className="text-lg text-gray-300 mb-0">
                  Join thousands of users who have taken control of their financial future with Smart Budgeting.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup"
                  className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg transition-colors">
                  Get Started
                </Link>
                <Link href="/signin"
                  className="bg-transparent text-white border border-gray-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-800 transition-colors">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between mb-12">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center mb-6">
                <span className="text-2xl font-bold text-purple-400">Smart</span>
                <span className="text-2xl font-bold text-white">Budget</span>
              </div>
              <p className="text-gray-400 max-w-xs">
                Your personal finance companion for a brighter financial future.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-semibold mb-4">Product</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Features</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Pricing</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Testimonials</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">FAQ</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">About</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Careers</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Contact</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Privacy</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Terms</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Security</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Smart Budgeting. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
