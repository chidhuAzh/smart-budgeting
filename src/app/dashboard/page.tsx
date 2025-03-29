'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ExpenseBarChart from '@/components/dashboard/ExpenseBarChart';
import SubscriptionDonutChart from '@/components/dashboard/SubscriptionDonutChart';
import { User } from '@supabase/supabase-js';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  console.log("user>>>",user);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('Month to Date');
  
  // Mock data - you'll replace this with real data from your database
  const summaryData = {
    totalIncome: 55000,
    availableBalance: 52201,
    totalSpent: 2799,
    totalInvestment: 0,
    totalSubscriptions: 799
  };

  const expenseData = [
    { category: 'food', amount: 2000, color: '#3B82F6' }
  ];

  const subscriptionData = [
    { name: 'Amazon Prime', amount: 799, color: '#3B82F6' }
  ];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/signin');
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };
    
    checkUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Overview</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-700 px-3 py-1 rounded-md">
              <svg className="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Mar 01, 2025 - Mar 29, 2025</span>
            </div>
            
            <select 
              className="bg-gray-700 text-white px-3 py-1 rounded-md"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option>Month to Date</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
              <option>Custom Range</option>
            </select>
            
            <button 
              onClick={handleSignOut}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded-md transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Summary Section */}
        <div className="mb-8">
          <h2 className="text-xl font-medium mb-4">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Total Income */}
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">TOTAL INCOME</span>
                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <p className="text-2xl font-bold">₹ {summaryData.totalIncome.toLocaleString()}</p>
            </div>
            
            {/* Available Balance */}
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">AVAILABLE BALANCE</span>
                <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-2xl font-bold">₹ {summaryData.availableBalance.toLocaleString()}</p>
            </div>
            
            {/* Total Spent */}
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">TOTAL SPENT</span>
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-2xl font-bold">₹ {summaryData.totalSpent.toLocaleString()}</p>
            </div>
            
            {/* Total Investment */}
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">TOTAL INVESTMENT</span>
                <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-2xl font-bold">₹ {summaryData.totalInvestment.toLocaleString()}</p>
            </div>
            
            {/* Total Subscriptions */}
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">TOTAL SUBSCRIPTIONS</span>
                <svg className="h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="text-2xl font-bold">₹ {summaryData.totalSubscriptions.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        {/* Reports Section */}
        <div className="mb-8">
          <h2 className="text-xl font-medium mb-4">Reports</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expenses */}
            <div className="bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-1">Expenses</h3>
              <p className="text-sm text-gray-400 mb-6">Amount spent for the selected date range.</p>
              
              <ExpenseBarChart data={expenseData} />
            </div>
            
            {/* Subscriptions */}
            <div className="bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-1">Subscriptions</h3>
              <p className="text-sm text-gray-400 mb-6">Estimated total amount spent for selected date range.</p>
              
              <SubscriptionDonutChart data={subscriptionData} total={799} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 