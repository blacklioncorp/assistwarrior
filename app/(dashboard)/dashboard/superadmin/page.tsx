import { checkIsSuperadmin } from '@/lib/utils/superadmin'
import { createClient } from '@/lib/utils/server'
import { redirect } from 'next/navigation'
import { 
  getGlobalStats, 
  getProfessionals, 
  getAuditLogs, 
  initializeSuperadminEmails,
  getSuperadminEmails,
  getPricingPlans
} from '@/app/actions/superadmin'
import { SuperadminClient } from './SuperadminClient'

export const metadata = { title: 'Superadmin Dashboard' }
export const dynamic = 'force-dynamic'

export default async function SuperadminPage() {
  // 1. Authorize superadmin
  const isSuper = await checkIsSuperadmin()
  if (!isSuper) {
    // Access denied: redirect to home dashboard
    redirect('/dashboard')
  }

  // 2. Initialize dynamic email list if empty (running on first load)
  await initializeSuperadminEmails()

  // 3. Fetch current logged in user details
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // Auto-mark is_superadmin = true in DB if not already set
    const adminClient = (await import('@/lib/supabase/admin')).createAdminClient()
    await adminClient
      .from('professionals')
      .update({ is_superadmin: true })
      .eq('id', user.id)
      .eq('is_superadmin', false)
  }

  // 4. Fetch admin dashboard data
  const stats = await getGlobalStats()
  const professionals = await getProfessionals()
  const auditLogs = await getAuditLogs()
  const adminEmails = await getSuperadminEmails()
  const pricingPlans = await getPricingPlans()

  return (
    <SuperadminClient 
      initialStats={stats} 
      initialProfessionals={professionals as any} 
      initialAuditLogs={auditLogs as any}
      initialAdminEmails={adminEmails as any}
      initialPricingPlans={pricingPlans as any}
      currentUserEmail={user?.email || ''}
    />
  )
}
