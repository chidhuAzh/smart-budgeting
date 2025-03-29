'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import IncomeDialog from '@/components/income/IncomeDialog';
import Snackbar from '@/components/ui/Snackbar';

type Income = {
  id: number;
  name: string;
  price: string;
  date: string;
  category: string;
  notes: string | null;
  user_id: number;
  namehash: string | null;
  is_deleted: string;
  created_at: string;
  updated_at: string;
};

export default function IncomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  console.log("user....", user);
  const [loading, setLoading] = useState(true);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [filter, setFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    isVisible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info'
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/signin');
        return;
      }
      
      setUser(session.user);
      fetchIncomes();
    };
    
    checkUser();
  }, [router]);

  const fetchIncomes = async () => {
    setLoading(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // First get the user_id from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();
        
      if (userError) {
        throw userError;
      }
      
      // Now fetch incomes for this user_id
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', userData.id)
        .eq('is_deleted', 'N') // Only get non-deleted incomes
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setIncomes(data || []);
    } catch (error) {
      console.error('Error fetching incomes:', error);
      setIncomes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncome = () => {
    setIncomeToEdit(null); // Ensure we're in add mode
    setIsDialogOpen(true);
  };

  const handleEditIncome = (income: Income) => {
    setIncomeToEdit(income);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setIncomeToEdit(null);
  };

  const handleIncomeSuccess = (message: string) => {
    fetchIncomes(); // Refresh the income list
    setSnackbar({
      isVisible: true,
      message,
      type: 'success'
    });
  };

  const handleDeleteIncome = async (income: Income) => {
    if (!confirm('Are you sure you want to delete this income?')) {
      return;
    }
    
    try {
      // Soft delete by updating is_deleted flag to 'Y'
      const { error } = await supabase
        .from('income')
        .update({ is_deleted: 'Y' })
        .eq('id', income.id);
        
      if (error) throw error;
      
      fetchIncomes(); // Refresh the list
      
      setSnackbar({
        isVisible: true,
        message: 'Income deleted successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error deleting income:', error);
      setSnackbar({
        isVisible: true,
        message: 'Failed to delete income',
        type: 'error'
      });
    }
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, isVisible: false }));
  };

  // Calculate summary data
  const totalIncomes = incomes.length;
  const totalAmount = incomes.reduce((sum, income) => sum + parseFloat(income.price || '0'), 0);

  // Filter incomes based on search term
  const filteredIncomes = incomes.filter(income => 
    income.name.toLowerCase().includes(filter.toLowerCase())
  );

  // Get emoji for category
  const getCategoryEmoji = (category: string): string => {
    const emojiMap: Record<string, string> = {
      'Salary': '💰',
      'Freelance': '💻',
      'Investment': '📈',
      'Rental': '🏠',
      'Gift': '🎁',
      'Refund': '💸',
      'Other': '📦'
    };
    
    return emojiMap[category] || '💵';
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
    <div className="min-h-screen bg-gray-900 text-white px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Income Summary</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">TOTAL ENTRIES</div>
          <div className="text-3xl font-bold">{totalIncomes}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">TOTAL AMOUNT</div>
          <div className="text-3xl font-bold text-green-500">₹ {totalAmount.toLocaleString()}</div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap justify-end gap-4 mb-6 items-center">
        <div className="w-64">
          <input
            type="text"
            placeholder="Filter by name"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* Income Table */}
      <div className="overflow-x-auto bg-gray-800 rounded-lg">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr className="bg-gray-800">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center">
                Name
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Notes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredIncomes.length > 0 ? (
              filteredIncomes.map((income) => (
                <tr key={income.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">{getCategoryEmoji(income.category)}</span>
                      <span>{income.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-500">₹ {parseFloat(income.price).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{income.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{income.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{income.notes}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-3">
                    <button 
                      className="text-gray-400 hover:text-blue-500"
                      onClick={() => handleEditIncome(income)}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => handleDeleteIncome(income)}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                  No income records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Add Income Button (Fixed at bottom right) */}
      <button 
        onClick={handleAddIncome}
        className="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-colors"
      >
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      
      {/* Income Dialog */}
      <IncomeDialog 
        isOpen={isDialogOpen} 
        onClose={handleDialogClose} 
        onSubmitSuccess={handleIncomeSuccess}
        incomeToEdit={incomeToEdit}
      />
      
      {/* Snackbar */}
      <Snackbar 
        isVisible={snackbar.isVisible}
        message={snackbar.message}
        type={snackbar.type}
        onClose={closeSnackbar}
      />
    </div>
  );
}
