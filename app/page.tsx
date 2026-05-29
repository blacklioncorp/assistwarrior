import { createClient } from '@/lib/utils/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/home')
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-gray-900">Welcome to Smart Receptionist</h1>
        <p className="mt-4 text-lg text-gray-600">Your intelligent assistant for managing appointments and calls.</p>
        <Link href="/login" className="mt-8 inline-block rounded-md bg-primary px-6 py-3 text-lg font-medium text-primary-foreground shadow-md transition-colors hover:bg-primary/90">
          Get Started
        </Link>
      </div>
    </div>
  );
}
