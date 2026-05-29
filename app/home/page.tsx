import { createClient } from '@/lib/utils/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const signOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.email}</h1>
        <form action={signOut}>
          <button type="submit" className="mt-4 rounded-md bg-red-500 px-4 py-2 text-white">
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
