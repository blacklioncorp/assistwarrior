import { createClient } from '@/lib/utils/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { MobileNav } from '@/components/dashboard/MobileNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch professional profile
  const { data: professional } = await supabase
    .from('professionals')
    .select('full_name, email, specialty, clinic_name, plan, plan_status, is_superadmin, avatar_url')
    .eq('id', user.id)
    .single()

  // Fetch unread messages count
  const { count: unreadMessages } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('professional_id', user.id)
    .gt('unread_count', 0)

  const prof = professional ?? {
    full_name: null,
    email: user.email ?? '',
    specialty: null,
    clinic_name: null,
    plan: 'basic',
    plan_status: 'active',
    is_superadmin: false,
    avatar_url: null,
  }


  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <Sidebar professional={prof} />

      {/* Main content area — offset by sidebar on desktop */}
      <div className="lg:pl-64">
        <Header
          professional={prof}
          unreadCount={unreadMessages ?? 0}
        />
        <main className="p-4 pb-24 lg:p-8 lg:pb-8 animate-fade-in">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  )
}
