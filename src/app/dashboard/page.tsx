'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

// Define types for our data
type DashboardData = {
  totalIncome: number;
  totalSpent: number;
  totalInvestment: number;
  totalSubscriptions: number;
  dateRange: string;
  expensesByCategory: ExpenseCategoryData[];
  availableBalance: number;
  incomeByCategory: IncomeCategoryData[];
  subscriptions: SubscriptionData[];
  investments: InvestmentData[];
};

type ExpenseCategoryData = {
  category: string;
  amount: number;
  color: string;
};

type IncomeCategoryData = {
  category: string;
  amount: number;
  color: string;
};

// Add types for subscription and investment data
type SubscriptionData = {
  name: string;
  price: number;
  frequency: string;
  monthlyAmount: number;
  color: string;
};

type InvestmentData = {
  name: string;
  category: string;
  value: number; // price * units
  units: number;
  price: number;
  color: string;
};

// Add these utility components before your main component function
// or move them inside if you prefer

type ChartTooltipProps = {
  active?: boolean;
  payload?: any[];
  totalValue: number;
  colorClassName: string;
};

// Generic tooltip component that can be used for both expense and income
const ChartTooltip = ({ active, payload, totalValue, colorClassName }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-2 border border-gray-700 rounded shadow-lg text-xs">
        <p className="font-medium text-white">{payload[0].payload.category}</p>
        <p className={`${colorClassName}`}>₹ {payload[0].value.toLocaleString()}</p>
        <p className="text-gray-400 text-xs">
          {((payload[0].value / totalValue) * 100).toFixed(1)}% of total
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  console.log("user$$$", user);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalIncome: 0,
    totalSpent: 0,
    totalInvestment: 0,
    totalSubscriptions: 0,
    availableBalance: 0,
    dateRange: 'Month to Date',
    expensesByCategory: [],
    incomeByCategory: [],
    subscriptions: [],
    investments: []
  });
  
  // Colors for charts - a nice color palette for data visualization
  const COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#6366F1', // Indigo
    '#14B8A6', // Teal
  ];
  
  // Date range display and selector
  const [dateRangeDisplay, setDateRangeDisplay] = useState('');
  const [dateRangeType, setDateRangeType] = useState('Month to Date');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // Function to fetch user ID
  const fetchUserId = useCallback(async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();
        
      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('Error fetching user ID:', error);
      return null;
    }
  }, []);
  
  // Initialize Supabase auth and data
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/signin');
          return;
        }
        
        setUser(session.user);
        const id = await fetchUserId(session.user.email!);
        setUserId(id);
        
        if (id) {
          fetchDashboardData(id);
          setupRealtimeSubscriptions(id);
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
    
    // Cleanup function for subscriptions
    return () => {
      supabase.removeAllChannels();
    };
  }, [fetchUserId, router]);
  
  // Set up realtime subscriptions for updates
  const setupRealtimeSubscriptions = (userId: number) => {
    // Subscribe to expenses table changes
    supabase
      .channel('expenses-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'expenses',
          filter: `user_id=eq.${userId}` 
        }, 
        () => {
          console.log('Expense changed, updating dashboard...');
          fetchDashboardData(userId);
        }
      )
      .subscribe();
      
    // Subscribe to income table changes  
    supabase
      .channel('income-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'income',
          filter: `user_id=eq.${userId}` 
        }, 
        () => {
          console.log('Income changed, updating dashboard...');
          fetchDashboardData(userId);
        }
      )
      .subscribe();
  };
  
  // Calculate date range
  const calculateDateRange = () => {
    const today = new Date();
    let startDate: Date;
    let endDate = today;
    
    try {
      switch (dateRangeType) {
        case 'Today':
          startDate = today;
          break;
        case 'Yesterday':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 1);
          endDate = startDate;
          break;
        case 'This Week':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - today.getDay());
          break;
        case 'Last Week':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - today.getDay() - 7);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          break;
        case 'Last Month':
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          endDate = new Date(today.getFullYear(), today.getMonth(), 0);
          break;
        case 'Month to Date':
        default:
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
      }
      
      // Format dates as YYYY-MM-DD
      const formattedStart = format(startDate, 'yyyy-MM-dd');
      const formattedEnd = format(endDate, 'yyyy-MM-dd');
      
      console.log(`Date range calculated: ${formattedStart} to ${formattedEnd}`);
      
      return {
        start: formattedStart,
        end: formattedEnd,
        displayText: `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`
      };
    } catch (error) {
      console.error("Error calculating date range:", error);
      // Fallback
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        start: format(firstDay, 'yyyy-MM-dd'),
        end: format(today, 'yyyy-MM-dd'),
        displayText: `${format(firstDay, 'MMM dd, yyyy')} - ${format(today, 'MMM dd, yyyy')}`
      };
    }
  };
  
  // Fetch dashboard data with enhanced expense categorization
  const fetchDashboardData = async (userId: number) => {
    try {
      setLoading(true);
      
      const dateRange = calculateDateRange();
      setDateRangeDisplay(dateRange.displayText);
      
      console.log("Fetching data for date range:", dateRange);
      
      // Fetch total income
      const { data: incomeData, error: incomeError } = await supabase
        .from('income')
        .select('price, category, name')
        .eq('user_id', userId)
        .eq('is_deleted', 'N')
        .gte('date', dateRange.start)
        .lte('date', dateRange.end);
        
      if (incomeError) {
        console.error("Error fetching income data:", incomeError);
        throw incomeError;
      }
      
      const totalIncome = (incomeData || []).reduce((sum, item) => {
        const amount = parseFloat(item.price || '0');
        return isNaN(amount) ? sum : sum + amount;
      }, 0);
      
      // Group income by category
      const incomeByCategory: Record<string, number> = {};
      (incomeData || []).forEach(income => {
        if (!income) return;
        
        const category = income.category || 'Uncategorized';
        const amount = parseFloat(income.price || '0');
        
        if (!isNaN(amount)) {
          incomeByCategory[category] = (incomeByCategory[category] || 0) + amount;
        }
      });
      
      // Convert to array for charting and assign colors
      const incomeCategoriesArray = Object.entries(incomeByCategory).map(([category, amount], index) => ({
        category,
        amount,
        color: COLORS[index % COLORS.length]
      }));
      
      // Sort by amount (highest first)
      incomeCategoriesArray.sort((a, b) => b.amount - a.amount);
      
      // Fetch expenses with category information
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .select('price, category')
        .eq('user_id', userId)
        .eq('is_deleted', 'N')
        .gte('date', dateRange.start)
        .lte('date', dateRange.end);
        
      if (expenseError) {
        console.error("Error fetching expense data:", expenseError);
        throw expenseError;
      }
      
      const totalSpent = (expenseData || []).reduce((sum, item) => {
        const amount = parseFloat(item.price || '0');
        return isNaN(amount) ? sum : sum + amount;
      }, 0);
      
      // Group expenses by category
      const expensesByCategory: Record<string, number> = {};
      (expenseData || []).forEach(expense => {
        if (!expense) return;
        
        const category = expense.category || 'Uncategorized';
        const amount = parseFloat(expense.price || '0');
        
        if (!isNaN(amount)) {
          expensesByCategory[category] = (expensesByCategory[category] || 0) + amount;
        }
      });
      
      // Convert to array for charting and assign colors
      const expenseCategoriesArray = Object.entries(expensesByCategory).map(([category, amount], index) => ({
        category,
        amount,
        color: COLORS[index % COLORS.length]
      }));
      
      // Sort by amount (highest first)
      expenseCategoriesArray.sort((a, b) => b.amount - a.amount);
      
      // Enhanced subscription data fetching
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', 'N')
        .eq('active', true);
        
      if (subscriptionError) {
        console.error("Error fetching subscription data:", subscriptionError);
        throw subscriptionError;
      }
      
      console.log(`Retrieved ${subscriptionData?.length || 0} subscription records`);
      
      // Transform subscription data for visualization
      const SUBSCRIPTION_COLORS = [
        '#8B5CF6', // Purple
        '#7C3AED', // Purple-600
        '#6D28D9', // Purple-700
        '#5B21B6', // Purple-800
        '#4C1D95', // Purple-900
        '#A78BFA', // Purple-400
        '#C4B5FD', // Purple-300
        '#D1D5DB', // Gray-300
      ];
      
      // Calculate monthly amounts and prepare for visualization
      let totalSubscriptions = 0;
      const processedSubscriptions = (subscriptionData || []).map((sub, index) => {
        if (!sub || !sub.price) {
          return {
            name: sub?.name || 'Unknown',
            price: 0,
            frequency: sub?.paid || 'Monthly',
            monthlyAmount: 0,
            color: SUBSCRIPTION_COLORS[index % SUBSCRIPTION_COLORS.length]
          };
        }
        
        let monthlyAmount = parseFloat(sub.price);
        if (isNaN(monthlyAmount)) monthlyAmount = 0;
        
        const frequency = sub.paid;
        if (frequency === 'Yearly') monthlyAmount /= 12;
        else if (frequency === 'Quarterly') monthlyAmount /= 3;
        else if (frequency === 'Weekly') monthlyAmount *= 4.33;
        else if (frequency === 'Daily') monthlyAmount *= 30.42;
        else if (frequency === 'One-time') monthlyAmount = 0;
        
        totalSubscriptions += monthlyAmount;
        
        return {
          name: sub.name,
          price: parseFloat(sub.price),
          frequency: sub.paid,
          monthlyAmount,
          color: SUBSCRIPTION_COLORS[index % SUBSCRIPTION_COLORS.length]
        };
      });
      
      // Sort subscriptions by monthly amount (highest first)
      processedSubscriptions.sort((a, b) => b.monthlyAmount - a.monthlyAmount);
      
      // Enhanced investment data fetching
      const { data: investmentData, error: investmentError } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', 'N');
        
      if (investmentError) {
        console.error("Error fetching investment data:", investmentError);
        throw investmentError;
      }
      
      console.log(`Retrieved ${investmentData?.length || 0} investment records`);
      
      // Transform investment data for visualization
      const INVESTMENT_COLORS = [
        '#3B82F6', // Blue
        '#2563EB', // Blue-600
        '#1D4ED8', // Blue-700
        '#1E40AF', // Blue-800
        '#1E3A8A', // Blue-900
        '#60A5FA', // Blue-400
        '#93C5FD', // Blue-300
        '#D1D5DB', // Gray-300
      ];
      
      // Calculate investment values and prepare for visualization
      let totalInvestment = 0;
      const processedInvestments = (investmentData || []).map((inv, index) => {
        if (!inv) {
          return {
            name: 'Unknown',
            category: 'Unknown',
            price: 0,
            units: 0,
            value: 0,
            color: INVESTMENT_COLORS[index % INVESTMENT_COLORS.length]
          };
        }
        
        const price = parseFloat(inv.price || '0');
        const units = parseFloat(inv.units || '0');
        const value = isNaN(price) || isNaN(units) ? 0 : price * units;
        
        totalInvestment += value;
        
        return {
          name: inv.name || 'Unnamed Investment',
          category: inv.category || 'Uncategorized',
          price,
          units,
          value,
          color: INVESTMENT_COLORS[index % INVESTMENT_COLORS.length]
        };
      });
      
      // Sort investments by value (highest first)
      processedInvestments.sort((a, b) => b.value - a.value);
      
      // Calculate available balance
      const availableBalance = totalIncome - totalSpent;
      
      // Update dashboard data
      setDashboardData({
        totalIncome,
        totalSpent,
        totalInvestment,
        totalSubscriptions,
        availableBalance,
        expensesByCategory: expenseCategoriesArray,
        incomeByCategory: incomeCategoriesArray,
        subscriptions: processedSubscriptions,
        investments: processedInvestments,
        dateRange: dateRangeType
      });
      
      console.log("Dashboard data updated successfully");
      setError(null);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      let errorMessage = 'An unexpected error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        try {
          const errorObj = JSON.stringify(error, null, 2);
          errorMessage = JSON.parse(errorObj).message || JSON.stringify(error);
        } catch {
          errorMessage = JSON.stringify(error);
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle date range change
  const handleDateRangeChange = (range: string) => {
    setDateRangeType(range);
    setIsDatePickerOpen(false);
    if (userId) {
      fetchDashboardData(userId);
    }
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white px-3 py-4">
      {/* Header with date selector - reduced padding */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5">
        <h1 className="text-xl font-bold">Overview</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-3 md:mt-0">
          <div className="relative">
            <button 
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg text-sm"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            >
              <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{dateRangeDisplay}</span>
            </button>
            
            {isDatePickerOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-gray-800 rounded-md shadow-lg z-10">
                <div className="py-1">
                  {['Today', 'Yesterday', 'This Week', 'Last Week', 'Month to Date', 'Last Month'].map((range) => (
                    <button
                      key={range}
                      className={`block w-full text-left px-3 py-1.5 text-xs ${dateRangeType === range ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                      onClick={() => handleDateRangeChange(range)}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
      
      {/* Error message display - smaller padding */}
      {error && (
        <div className="bg-red-900 text-white p-3 rounded-lg mb-4 text-sm">
          <h3 className="font-bold flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Error Loading Dashboard Data
          </h3>
          <p className="mt-1 text-xs">{error}</p>
          <button 
            className="mt-1 bg-red-800 hover:bg-red-700 px-3 py-1 rounded text-xs"
            onClick={() => userId && fetchDashboardData(userId)}
          >
            Retry
          </button>
        </div>
      )}
      
      {/* Summary Cards - smaller cards with reduced padding */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {/* Total Income */}
        <div className="bg-gray-800 rounded-lg p-3 shadow-lg">
          <div className="flex items-center mb-1">
            <h3 className="text-gray-400 text-xs uppercase">TOTAL INCOME</h3>
            <svg className="w-4 h-4 ml-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-xl font-bold">₹ {dashboardData.totalIncome.toLocaleString()}</div>
        </div>
        
        {/* Available Balance */}
        <div className="bg-gray-800 rounded-lg p-3 shadow-lg">
          <div className="flex items-center mb-1">
            <h3 className="text-gray-400 text-xs uppercase">AVAILABLE BALANCE</h3>
            <svg className="w-4 h-4 ml-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-xl font-bold">₹ {dashboardData.availableBalance.toLocaleString()}</div>
        </div>
        
        {/* Total Spent */}
        <div className="bg-gray-800 rounded-lg p-3 shadow-lg">
          <div className="flex items-center mb-1">
            <h3 className="text-gray-400 text-xs uppercase">TOTAL SPENT</h3>
            <svg className="w-4 h-4 ml-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-xl font-bold">₹ {dashboardData.totalSpent.toLocaleString()}</div>
        </div>
        
        {/* Total Investment */}
        <div className="bg-gray-800 rounded-lg p-3 shadow-lg">
          <div className="flex items-center mb-1">
            <h3 className="text-gray-400 text-xs uppercase">TOTAL INVESTMENT</h3>
            <svg className="w-4 h-4 ml-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="text-xl font-bold">₹ {dashboardData.totalInvestment.toLocaleString()}</div>
        </div>
        
        {/* Total Subscriptions */}
        <div className="bg-gray-800 rounded-lg p-3 shadow-lg">
          <div className="flex items-center mb-1">
            <h3 className="text-gray-400 text-xs uppercase">TOTAL SUBSCRIPTIONS</h3>
            <svg className="w-4 h-4 ml-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="text-xl font-bold">₹ {dashboardData.totalSubscriptions.toLocaleString()}</div>
        </div>
      </div>
      
      {/* Expense Visualization Section - reduced size */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3">Expense Breakdown</h2>
        
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
          {dashboardData.expensesByCategory.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Expense Chart - Bar Chart - reduced height */}
              <div className="col-span-2">
                <h3 className="text-base font-medium mb-2">Expenses by Category</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dashboardData.expensesByCategory}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        type="number" 
                        tickFormatter={(value) => `₹${value.toLocaleString()}`} 
                        stroke="#9CA3AF"
                        fontSize={11}
                      />
                      <YAxis 
                        dataKey="category" 
                        type="category" 
                        tick={{ fill: '#D1D5DB', fontSize: 11 }}
                        width={70}
                        stroke="#9CA3AF"
                      />
                      <Tooltip 
                        content={(props) => (
                          <ChartTooltip 
                            {...props} 
                            totalValue={dashboardData.totalSpent} 
                            colorClassName="text-red-400"
                          />
                        )} 
                      />
                      <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                        {dashboardData.expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Expense Distribution - Pie Chart - reduced height */}
              <div>
                <h3 className="text-base font-medium mb-2">Expense Distribution</h3>
                <div className="h-48 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.expensesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="amount"
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                          const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                          
                          return percent > 0.05 ? (
                            <text
                              x={x}
                              y={y}
                              fill="#fff"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize={10}
                            >
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          ) : null;
                        }}
                      >
                        {dashboardData.expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`₹ ${value.toLocaleString()}`, 'Amount']}
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '4px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Legend - more compact */}
                <div className="mt-2">
                  <h4 className="text-xs font-medium text-gray-400 mb-1">Legend</h4>
                  <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto text-xs">
                    {dashboardData.expensesByCategory.map((category, index) => (
                      <div key={index} className="flex items-center">
                        <div 
                          className="w-2 h-2 rounded-full mr-1"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-gray-300 truncate">{category.category}</span>
                        <span className="ml-auto font-medium">
                          ₹ {category.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <svg className="w-12 h-12 text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-400 text-sm">No expense data for the selected period</p>
              <p className="text-gray-500 mt-1 text-xs">Try selecting a different date range or add some expenses</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Income Visualization Section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3">Income Analysis</h2>
        
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
          {dashboardData.incomeByCategory.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Income Chart - Bar Chart */}
              <div className="col-span-2">
                <h3 className="text-base font-medium mb-2">Income by Category</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dashboardData.incomeByCategory}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        type="number" 
                        tickFormatter={(value) => `₹${value.toLocaleString()}`} 
                        stroke="#9CA3AF"
                        fontSize={11}
                      />
                      <YAxis 
                        dataKey="category" 
                        type="category" 
                        tick={{ fill: '#D1D5DB', fontSize: 11 }}
                        width={70}
                        stroke="#9CA3AF"
                      />
                      <Tooltip 
                        content={(props) => (
                          <ChartTooltip 
                            {...props} 
                            totalValue={dashboardData.totalIncome} 
                            colorClassName="text-blue-400"
                          />
                        )} 
                      />
                      <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                        {dashboardData.incomeByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Income Distribution - Pie Chart */}
              <div>
                <h3 className="text-base font-medium mb-2">Income Distribution</h3>
                <div className="h-48 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.incomeByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="amount"
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                          const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                          
                          return percent > 0.05 ? (
                            <text
                              x={x}
                              y={y}
                              fill="#fff"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize={10}
                            >
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          ) : null;
                        }}
                      >
                        {dashboardData.incomeByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`₹ ${value.toLocaleString()}`, 'Amount']}
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '4px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Legend */}
                <div className="mt-2">
                  <h4 className="text-xs font-medium text-gray-400 mb-1">Legend</h4>
                  <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto text-xs">
                    {dashboardData.incomeByCategory.map((category, index) => (
                      <div key={index} className="flex items-center">
                        <div 
                          className="w-2 h-2 rounded-full mr-1"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-gray-300 truncate">{category.category}</span>
                        <span className="ml-auto font-medium">
                          ₹ {category.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <svg className="w-12 h-12 text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <p className="text-gray-400 text-sm">No income data for the selected period</p>
              <p className="text-gray-500 mt-1 text-xs">Try selecting a different date range or add some income records</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 