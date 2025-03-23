'use client';

import SignupForm from '@/components/Auth/SignupForm';

export default function Signup() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Create Your Account
        </h1>
        <SignupForm />
      </div>
    </div>
  );
}