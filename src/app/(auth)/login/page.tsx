import React from 'react';
import LoginForm from '@/components/login/login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Login",
};

const LoginPage = () => {
  return (
    <LoginForm />
  );
};

export default LoginPage;
