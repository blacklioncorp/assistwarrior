import { createClient } from '@/lib/utils/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { ProfessionalProvider } from '@/contexts/ProfessionalContext'

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

  // Fetch professional profile with business type
  const { data: professional } = await supabase
    .from('professionals')
    .select('full_name, email, specialty, clinic_name, plan, plan_status, is_superadmin, avatar_url, business_type_id, business_type:business_types(name)')
    .eq('id', user.id)
    .single()

  // Fetch unread messages count
  const { count: unreadMessages } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('professional_id', user.id)
    .gt('unread_count', 0)

  // Onboarding check: if business_type_id is null, load onboarding layout instead
  if (professional && !professional.business_type_id) {
    const { data: btypes } = await supabase
      .from('business_types')
      .select('id, name, label, config')
    
    const { OnboardingView } = await import('@/components/dashboard/OnboardingView')
    return (
      <OnboardingView businessTypes={btypes || []} />
    )
  }

  const businessTypeName = (professional?.business_type as { name?: string } | null)?.name ?? ''

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
    <ProfessionalProvider
      value={{
        businessTypeName,
        fullName: prof.full_name ?? null,
        email: prof.email ?? user.email ?? '',
      }}
    >
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <Sidebar professional={prof} businessTypeName={businessTypeName} />

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
    </ProfessionalProvider>
  )
}
