import { Metadata } from 'next';
import AuthForm from '@/components/auth/AuthForm';

export const metadata: Metadata = {
  title: 'Sign Up - Smart Budgeting',
  description: 'Create a Smart Budgeting account',
};

export default function SignUpPage() {
  return <AuthForm type="signup" />;
} 