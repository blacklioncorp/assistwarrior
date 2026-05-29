'use client';

import { login } from '@/app/login/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Smart Receptionist</h1>
          <p className="mt-2 text-gray-500">Sign in to your account</p>
        </div>
        <form action={login} className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <Button type="submit" className="w-full">Sign In with Email</Button>
        </form>
      </div>
    </div>
  );
}
