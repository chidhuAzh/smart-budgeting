'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import SubscriptionDialog from '@/components/subscription/SubscriptionDialog';
import Snackbar from '@/components/ui/Snackbar';

type Subscription = {
  id: number;
  name: string;
  notes: string | null;
  url: string;
  price: string;
  paid: string;
  notify: boolean;
  date: string;
  user_id: number;
  active: boolean;
  cancelled_at: string | null;
  namehash: string | null;
  is_deleted: string;
  created_at: string;
  updated_at: string;
};

export default function SubscriptionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  console.log("user)))", user);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filter, setFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subscriptionToEdit, setSubscriptionToEdit] = useState<Subscription | null>(null);

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
      fetchSubscriptions();
    };

    checkUser();
  }, [router]);

  const fetchSubscriptions = async () => {
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

      // Now fetch subscriptions for this user_id
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userData.id)
        .eq('is_deleted', 'N') // Only get non-deleted subscriptions
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscription = () => {
    setSubscriptionToEdit(null); // Ensure we're in add mode
    setIsDialogOpen(true);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setSubscriptionToEdit(subscription);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSubscriptionToEdit(null);
  };

  const handleSubscriptionSuccess = (message: string) => {
    fetchSubscriptions(); // Refresh the subscription list
    setSnackbar({
      isVisible: true,
      message,
      type: 'success'
    });
  };

  const handleToggleActive = async (subscription: Subscription) => {
    try {
      const newStatus = !subscription.active;
      const { error } = await supabase
        .from('subscriptions')
        .update({
          active: newStatus,
          cancelled_at: newStatus ? null : new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);

      if (error) throw error;

      fetchSubscriptions(); // Refresh the list

      setSnackbar({
        isVisible: true,
        message: newStatus ? 'Subscription activated' : 'Subscription cancelled',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating subscription status:', error);
      setSnackbar({
        isVisible: true,
        message: 'Failed to update subscription status',
        type: 'error'
      });
    }
  };

  const handleDeleteSubscription = async (subscription: Subscription) => {
    if (!confirm('Are you sure you want to delete this subscription?')) {
      return;
    }

    try {
      // Soft delete by updating is_deleted flag to 'Y'
      const { error } = await supabase
        .from('subscriptions')
        .update({ is_deleted: 'Y' })
        .eq('id', subscription.id);

      if (error) throw error;

      fetchSubscriptions(); // Refresh the list

      setSnackbar({
        isVisible: true,
        message: 'Subscription deleted successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error deleting subscription:', error);
      setSnackbar({
        isVisible: true,
        message: 'Failed to delete subscription',
        type: 'error'
      });
    }
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, isVisible: false }));
  };

  // Calculate summary data
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter(sub => sub.active).length;
  const monthlyTotal = subscriptions.reduce((sum, sub) => {
    if (!sub.active) return sum;

    const price = parseFloat(sub.price || '0');

    // Adjust for different payment frequencies
    let monthlyPrice = price;
    if (sub.paid === 'Yearly') monthlyPrice = price / 12;
    if (sub.paid === 'Quarterly') monthlyPrice = price / 3;
    if (sub.paid === 'Weekly') monthlyPrice = price * 4.33; // average weeks in a month
    if (sub.paid === 'Daily') monthlyPrice = price * 30.42; // average days in a month
    if (sub.paid === 'One-time') monthlyPrice = 0; // don't count one-time payments in monthly total

    return sum + monthlyPrice;
  }, 0);

  // Filter subscriptions based on search term
  const filteredSubscriptions = subscriptions.filter(subscription =>
    subscription.name.toLowerCase().includes(filter.toLowerCase())
  );

  // Get emoji for payment frequency
  const getPaymentEmoji = (paid: string): string => {
    const emojiMap: Record<string, string> = {
      'Monthly': '📅',
      'Yearly': '📆',
      'Quarterly': '🗓️',
      'Weekly': '📊',
      'Daily': '⏰',
      'One-time': '💸'
    };

    return emojiMap[paid] || '💳';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-6 relative">
      <h1 className="text-2xl font-bold mb-6">Subscription Management</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">TOTAL SUBSCRIPTIONS</div>
          <div className="text-3xl font-bold">{totalSubscriptions}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">ACTIVE SUBSCRIPTIONS</div>
          <div className="text-3xl font-bold text-purple-500">{activeSubscriptions}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">MONTHLY TOTAL</div>
          <div className="text-3xl font-bold text-purple-500">₹ {monthlyTotal.toFixed(2)}</div>
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
            className="w-full bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Subscription Table - Fix responsive issues */}
      <div className="overflow-x-auto rounded-lg">
        <div className="min-w-full bg-gray-800 rounded-lg">
          <table className="min-w-full divide-y divide-gray-700 table-fixed md:table-auto">
            <thead>
              <tr className="bg-gray-800">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[18%] md:w-auto">
                  <div className="flex items-center">
                    Name
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[10%] md:w-auto">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">Start Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden xl:table-cell">Website</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[15%] md:w-auto">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">Notes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[15%] md:w-auto">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredSubscriptions.length > 0 ? (
                filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className={`hover:bg-gray-700 ${!subscription.active ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">{getPaymentEmoji(subscription.paid)}</span>
                        <span className="truncate">{subscription.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-purple-400">₹ {parseFloat(subscription.price).toLocaleString()}</td>
                    <td className="px-4 py-4 hidden md:table-cell">{subscription.paid}</td>
                    <td className="px-4 py-4 hidden lg:table-cell">{subscription.date}</td>
                    <td className="px-4 py-4 hidden xl:table-cell">
                      <a
                        href={subscription.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 truncate block max-w-[180px]"
                      >
                        {subscription.url}
                      </a>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subscription.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {subscription.active ? (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Active
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="truncate max-w-[150px]">
                        {subscription.notes || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditSubscription(subscription)}
                          className="text-gray-400 hover:text-white"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleToggleActive(subscription)}
                          className="text-gray-400 hover:text-white"
                          title={subscription.active ? "Deactivate subscription" : "Activate subscription"}
                        >
                          {subscription.active ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteSubscription(subscription)}
                          className="text-gray-400 hover:text-white"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-4 text-center text-gray-400">No subscriptions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Button for Add Subscription */}
      <button
        onClick={handleAddSubscription}
        className="fixed bottom-8 right-8 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
        aria-label="Add subscription"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Add the SubscriptionDialog component */}
      {isDialogOpen && (
        <SubscriptionDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          onSubmitSuccess={handleSubscriptionSuccess}
          subscriptionToEdit={subscriptionToEdit}
        />
      )}

      {/* Add the Snackbar component */}
      <Snackbar
        isVisible={snackbar.isVisible}
        message={snackbar.message}
        type={snackbar.type}
        onClose={closeSnackbar}
      />
    </div>
  );
}
