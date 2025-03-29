'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import ExpenseDialog from '@/components/expense/ExpenseDialog';
import Snackbar from '@/components/ui/Snackbar';

type Expense = {
    id: number;
    name: string;
    price: string;
    date: string;
    category: string;
    paid_via: string;
    notes: string | null;
    user_id: number;
    namehash: string | null;
    is_deleted: string;
    created_at: string;
    updated_at: string;
};

export default function ExpensePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    console.log("user==>", user);
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [filter, setFilter] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
    
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
            fetchExpenses();
        };

        checkUser();
    }, [router]);

    const fetchExpenses = async () => {
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

            // Now fetch expenses for this user_id
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .eq('user_id', userData.id)
                .eq('is_deleted', 'N') // Only get non-deleted expenses
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            setExpenses(data || []);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = () => {
        setExpenseToEdit(null); // Ensure we're in add mode
        setIsDialogOpen(true);
    };

    const handleEditExpense = (expense: Expense) => {
        setExpenseToEdit(expense);
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setExpenseToEdit(null);
    };

    const handleExpenseSuccess = (message: string) => {
        fetchExpenses(); // Refresh the expense list
        setSnackbar({
            isVisible: true,
            message,
            type: 'success'
        });
    };

    const handleDeleteExpense = async (expense: Expense) => {
        if (!confirm('Are you sure you want to delete this expense?')) {
            return;
        }
        
        try {
            const { error } = await supabase
                .from('expenses')
                .update({ is_deleted: 'Y' })
                .eq('id', expense.id);
            
            if (error) throw error;
            
            fetchExpenses(); // Refresh the list
            
            setSnackbar({
                isVisible: true,
                message: 'Expense deleted successfully',
                type: 'success'
            });
        } catch (error) {
            console.error('Error deleting expense:', error);
            setSnackbar({
                isVisible: true,
                message: 'Failed to delete expense',
                type: 'error'
            });
        }
    };

    const closeSnackbar = () => {
        setSnackbar(prev => ({ ...prev, isVisible: false }));
    };

    // Calculate summary data
    const totalExpenses = expenses.length;
    const totalAmount = expenses.reduce((sum, expense) => sum + parseFloat(expense.price || '0'), 0);

    // Filter expenses based on search term
    const filteredExpenses = expenses.filter(expense =>
        expense.name.toLowerCase().includes(filter.toLowerCase())
    );

    const getCategoryEmoji = (category: string): string => {
        const emojiMap: Record<string, string> = {
            'Food': '🍔',
            'Shopping': '🛍️',
            'Transportation': '🚗',
            'Entertainment': '🎬',
            'Utilities': '💡',
            'Housing': '🏠',
            'Health': '💊',
            'Education': '📚',
            'Travel': '✈️',
            'Other': '📦'
        };
        
        return emojiMap[category] || '��';
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
            <h1 className="text-2xl font-bold mb-6">Summary</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">TOTAL EXPENSES</div>
                    <div className="text-3xl font-bold">{totalExpenses}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">TOTAL AMOUNT</div>
                    <div className="text-3xl font-bold">₹ {totalAmount.toLocaleString()}</div>
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

            {/* Expense Table */}
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Spent Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Paid Via</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Notes</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredExpenses.length > 0 ? (
                            filteredExpenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="text-xl mr-2">{getCategoryEmoji(expense.category)}</span>
                                            <span>{expense.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">₹ {parseFloat(expense.price).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{expense.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{expense.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{expense.paid_via}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{expense.notes}</td>
                                    <td className="px-6 py-4 whitespace-nowrap flex gap-3">
                                        <button 
                                            className="text-gray-400 hover:text-blue-500"
                                            onClick={() => handleEditExpense(expense)}
                                        >
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button 
                                            className="text-gray-400 hover:text-red-500"
                                            onClick={() => handleDeleteExpense(expense)}
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
                                <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                                    No expenses found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Expense Button (Fixed at bottom right) */}
            <button
                onClick={handleAddExpense}
                className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-colors"
            >
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            </button>

            {/* Expense Dialog */}
            <ExpenseDialog
                isOpen={isDialogOpen}
                onClose={handleDialogClose}
                onSubmitSuccess={handleExpenseSuccess}
                expenseToEdit={expenseToEdit}
            />

            {/* Snackbar for notifications */}
            <Snackbar
                isVisible={snackbar.isVisible}
                message={snackbar.message}
                type={snackbar.type}
                onClose={closeSnackbar}
            />
        </div>
    );
}
