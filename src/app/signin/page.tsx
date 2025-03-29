import { Metadata } from 'next';
import AuthForm from '@/components/auth/AuthForm';

export const metadata: Metadata = {
  title: 'Sign In - Smart Budgeting',
  description: 'Sign in to your Smart Budgeting account',
};

export default function SignInPage() {
  return <AuthForm type="signin" />;
} 