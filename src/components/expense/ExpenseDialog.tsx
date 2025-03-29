'use client';

import { useRef, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { supabase } from '@/lib/supabase';

// Define the Expense type
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

// Define categories and payment methods
const CATEGORIES = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Utilities', 'Housing', 'Health', 'Education', 'Travel', 'Other'];
const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer', 'Other'];

// Validation schema
const ExpenseSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  price: Yup.string().required('Required'),
  spent_date: Yup.date().required('Required'),
  category: Yup.string().required('Required'),
  paid_via: Yup.string().required('Required'),
  notes: Yup.string(),
});

interface ExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (message: string) => void;
  expenseToEdit?: Expense | null;
}

interface ExpenseFormValues {
  name: string;
  price: string;
  spent_date: Date;
  category: string;
  paid_via: string;
  notes: string;
}

export default function ExpenseDialog({ 
  isOpen, 
  onClose, 
  onSubmitSuccess, 
  expenseToEdit 
}: ExpenseDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const isEditMode = !!expenseToEdit;
  
  // Format date string from DB to Date object
  const parseDate = (dateString: string): Date => {
    try {
      // Try parsing ISO date format
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) return date;
      
      // Try parsing yyyy-MM-dd format
      const parts = dateString.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
      }
      
      return new Date();
    } catch {
      return new Date();
    }
  };
  
  // Initial values for the form
  const getInitialValues = (): ExpenseFormValues => {
    if (expenseToEdit) {
      return {
        name: expenseToEdit.name || '',
        price: expenseToEdit.price || '',
        spent_date: parseDate(expenseToEdit.date),
        category: expenseToEdit.category || 'Food',
        paid_via: expenseToEdit.paid_via || 'UPI',
        notes: expenseToEdit.notes || '',
      };
    }
    
    return {
      name: '',
      price: '',
      spent_date: new Date(),
      category: 'Food',
      paid_via: 'UPI',
      notes: '',
    };
  };
  
  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Close on escape key
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;

  const handleSubmit = async (
    values: ExpenseFormValues, 
    { setSubmitting, resetForm }: FormikHelpers<ExpenseFormValues>
  ) => {
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Get user_id from the users table
      const { data: userData, error: userDataError } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();
        
      if (userDataError) {
        throw userDataError;
      }
      
      if (!userData) {
        throw new Error('User profile not found');
      }
      
      // Format the date as required by your schema (YYYY-MM-DD)
      const formattedDate = values.spent_date.toISOString().split('T')[0]; // Gets YYYY-MM-DD
      
      // Create a namehash (optional)
      const namehash = values.name.toLowerCase().replace(/\s+/g, '-');
      
      if (isEditMode && expenseToEdit) {
        // Update existing expense
        const { error } = await supabase
          .from('expenses')
          .update({
            name: values.name,
            price: values.price.toString(),
            date: formattedDate,
            category: values.category,
            paid_via: values.paid_via,
            notes: values.notes || null,
            namehash: namehash,
            updated_at: new Date().toISOString(),
          })
          .eq('id', expenseToEdit.id);
        
        if (error) {
          console.log('Supabase error details:', error);
          throw error;
        }
        
        onSubmitSuccess('Expense updated successfully');
      } else {
        // Insert new expense
        const { error } = await supabase
          .from('expenses')
          .insert([
            {
              user_id: userData.id,
              name: values.name,
              price: values.price.toString(),
              date: formattedDate,
              category: values.category,
              paid_via: values.paid_via,
              notes: values.notes || null,
              namehash: namehash,
              is_deleted: 'N', // Set to 'N' for active expenses
            }
          ]);
        
        if (error) {
          console.log('Supabase error details:', error);
          throw error;
        }
        
        onSubmitSuccess('Expense added successfully');
      }
      
      // Reset form and close dialog
      resetForm();
      onClose();
      
    } catch (error: unknown) {
      const err = error as Error | { message?: string; details?: string; hint?: string };
      console.error('Error saving expense:', err);
      
      // More detailed error logging - safe type checking
      if (typeof err === 'object' && err !== null) {
        if ('message' in err) console.error('Error message:', err.message);
        if ('details' in err) console.error('Error details:', err.details);
        if ('hint' in err) console.error('Error hint:', err.hint);
      }
      
      // Safe string extraction for alert
      const errorMessage = typeof err === 'object' && err !== null && 'message' in err 
        ? err.message 
        : 'Unknown error';
        
      alert('Failed to save expense: ' + errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div 
        ref={dialogRef}
        className="bg-gray-900 rounded-lg shadow-xl w-full max-w-md p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isEditMode ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <Formik
          initialValues={getInitialValues()}
          validationSchema={ExpenseSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                  Name
                </label>
                <Field
                  id="name"
                  name="name"
                  type="text"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Swiggy - Biriyani"
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              
              {/* Price and Date in a grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-white mb-1">
                    Price <span className="text-gray-400">(₹)</span>
                  </label>
                  <Field
                    id="price"
                    name="price"
                    type="number"
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="199"
                  />
                  <ErrorMessage name="price" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                
                {/* Spent Date */}
                <div>
                  <label htmlFor="spent_date" className="block text-sm font-medium text-white mb-1">
                    Spent Date
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={values.spent_date}
                      onChange={(date) => setFieldValue('spent_date', date)}
                      dateFormat="dd-MM-yyyy"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <ErrorMessage name="spent_date" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>
              
              {/* Category and Payment Method in a grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-white mb-1">
                    Category
                  </label>
                  <div className="relative">
                    <Field
                      as="select"
                      id="category"
                      name="category"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      {CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </Field>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <ErrorMessage name="category" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                
                {/* Paid Via */}
                <div>
                  <label htmlFor="paid_via" className="block text-sm font-medium text-white mb-1">
                    Paid Via
                  </label>
                  <div className="relative">
                    <Field
                      as="select"
                      id="paid_via"
                      name="paid_via"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      {PAYMENT_METHODS.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </Field>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <ErrorMessage name="paid_via" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>
              
              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-white mb-1">
                  Notes <span className="text-gray-400">(optional)</span>
                </label>
                <Field
                  as="textarea"
                  id="notes"
                  name="notes"
                  rows={4}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full p-3 bg-white hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition duration-200 ease-in-out"
              >
                {isSubmitting ? 'Submitting...' : isEditMode ? 'Update' : 'Submit'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
