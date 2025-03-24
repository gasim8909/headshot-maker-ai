'use client';

import SignupForm from '@/components/Auth/SignupForm';

export default function Signup() {
  return (
    <div className="ai-container-sm py-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 ai-text-gradient">
          Create Your Account
        </h1>
        <SignupForm />
      </div>
    </div>
  );
}
