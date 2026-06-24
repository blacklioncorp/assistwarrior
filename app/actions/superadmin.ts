'use server'

import { createClient } from '@/lib/utils/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkIsSuperadmin } from '@/lib/utils/superadmin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const planSchema = z.enum(['pro', 'basic', 'trial'])

/**
 * Returns global platform stats: doctors count, appointments count, patients count, and plan distribution.
 */
export async function getGlobalStats() {
  const isAdmin = await checkIsSuperadmin()
  if (!isAdmin) throw new Error('No autorizado')

  const adminClient = createAdminClient()

  const [
    { count: totalProfessionals },
    { count: totalAppointments },
    { count: totalPatients },
    { data: planData }
  ] = await Promise.all([
    adminClient.from('professionals').select('*', { count: 'exact', head: true }),
    adminClient.from('appointments').select('*', { count: 'exact', head: true }),
    adminClient.from('patients').select('*', { count: 'exact', head: true }),
    adminClient.from('professionals').select('plan')
  ])

  const plans = { basic: 0, pro: 0, trial: 0 }
  planData?.forEach((p) => {
    if (p.plan in plans) {
      plans[p.plan as keyof typeof plans]++
    }
  })

  return {
    totalProfessionals: totalProfessionals || 0,
    totalAppointments: totalAppointments || 0,
    totalPatients: totalPatients || 0,
    plans
  }
}

/**
 * Lists professionals with search queries and plan/status filters.
 */
export async function getProfessionals(search?: string, plan?: string, status?: string) {
  const isAdmin = await checkIsSuperadmin()
  if (!isAdmin) throw new Error('No autorizado')

  const adminClient = createAdminClient()

  let query = adminClient
    .from('professionals')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (plan && plan !== 'all') {
    query = query.eq('plan', plan)
  }
  if (status && status !== 'all') {
    const isActive = status === 'active'
    query = query.eq('is_active', isActive)
  }

  const { data: professionals, error } = await query

  if (error) {
    console.error('Error fetching professionals:', error)
    return []
  }

  let filtered = professionals || []
  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter((p) => 
      (p.full_name || '').toLowerCase().includes(s) || 
      (p.email || '').toLowerCase().includes(s) ||
      (p.specialty || '').toLowerCase().includes(s) ||
      (p.clinic_name || '').toLowerCase().includes(s)
    )
  }

  // Resolve dynamic counts for each doctor
  const result = await Promise.all(
    filtered.map(async (prof) => {
      const [
        { count: patientCount },
        { count: appointmentCount }
      ] = await Promise.all([
        adminClient.from('patients').select('*', { count: 'exact', head: true }).eq('professional_id', prof.id),
        adminClient.from('appointments').select('*', { count: 'exact', head: true }).eq('professional_id', prof.id)
      ])

      return {
        ...prof,
        patientCount: patientCount || 0,
        appointmentCount: appointmentCount || 0
      }
    })
  )

  return result
}

/**
 * Updates a professional's plan.
 */
export async function updateProfessionalPlan(professionalId: string, plan: 'pro' | 'basic' | 'trial') {
  const isAdmin = await checkIsSuperadmin()
  if (!isAdmin) return { error: 'No autorizado' }

  // Runtime validation — TypeScript types are stripped at runtime in Server Actions
  const parsed = planSchema.safeParse(plan)
  if (!parsed.success) return { error: 'Plan inválido' }

  const adminClient = createAdminClient()
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await adminClient
    .from('professionals')
    .update({ plan: parsed.data, plan_status: 'active' })
    .eq('id', professionalId)

  if (error) return { error: error.message }

  // Audit log
  await adminClient.from('admin_audit_logs').insert({
    admin_id: user.id,
    action: `Plan cambiado a ${plan}`,
    target_professional_id: professionalId,
    details: { plan }
  })

  revalidatePath('/dashboard/superadmin')
  return { success: true }
}

/**
 * Suspends or reactivates a professional's account.
 */
export async function toggleProfessionalStatus(professionalId: string) {
  const isAdmin = await checkIsSuperadmin()
  if (!isAdmin) return { error: 'No autorizado' }

  const adminClient = createAdminClient()
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: current } = await adminClient
    .from('professionals')
    .select('is_active')
    .eq('id', professionalId)
    .single()

  if (!current) return { error: 'Profesional no encontrado' }

  const newStatus = !current.is_active

  const { error } = await adminClient
    .from('professionals')
    .update({ is_active: newStatus })
    .eq('id', professionalId)

  if (error) return { error: error.message }

  // Audit log
  await adminClient.from('admin_audit_logs').insert({
    admin_id: user.id,
    action: newStatus ? 'Cuenta reactivada' : 'Cuenta suspendida',
    target_professional_id: professionalId,
    details: { is_active: newStatus }
  })

  revalidatePath('/dashboard/superadmin')
  return { success: true }
}

/**
 * Whitelists a new superadmin email and updates the professional's is_superadmin flag.
 */
export async function addSuperadminEmail(email: string) {
  const isAdmin = await checkIsSuperadmin()
  if (!isAdmin) return { error: 'No autorizado' }

  const adminClient = createAdminClient()
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const emailLower = email.toLowerCase().trim()

  const { error: whitelistError } = await adminClient
    .from('superadmin_emails')
    .insert({ email: emailLower, added_by: user.id })

  if (whitelistError && whitelistError.code !== '23505') {
    return { error: whitelistError.message }
  }

  // Find professional profile and update flag
  const { data: professional } = await adminClient
    .from('professionals')
    .select('id')
    .eq('email', emailLower)
    .maybeSingle()

  if (professional) {
    await adminClient
      .from('professionals')
      .update({ is_superadmin: true })
      .eq('id', professional.id)
  }

  // Audit log
  await adminClient.from('admin_audit_logs').insert({
    admin_id: user.id,
    action: 'Administrador agregado',
    details: { email: emailLower }
  })

  revalidatePath('/dashboard/superadmin')
  return { success: true }
}

/**
 * Removes a superadmin email from the whitelist and disables their professional is_superadmin flag.
 */
export async function removeSuperadminEmail(email: string) {
  const isAdmin = await checkIsSuperadmin()
  if (!isAdmin) return { error: 'No autorizado' }

  const adminClient = createAdminClient()
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const emailLower = email.toLowerCase().trim()

  // Prevent self-deletion
  const { data: currentUser } = await adminClient
    .from('professionals')
    .select('email')
    .eq('id', user.id)
    .single()

  if (currentUser?.email?.toLowerCase() === emailLower) {
    return { error: 'No puedes eliminarte a ti mismo de la lista de administradores.' }
  }

  const { error } = await adminClient
    .from('superadmin_emails')
    .delete()
    .eq('email', emailLower)

  if (error) return { error: error.message }

  // Update professional profile flag
  const { data: professional } = await adminClient
    .from('professionals')
    .select('id')
    .eq('email', emailLower)
    .maybeSingle()

  if (professional) {
    await adminClient
      .from('professionals')
      .update({ is_superadmin: false })
      .eq('id', professional.id)
  }

  // Audit log
  await adminClient.from('admin_audit_logs').insert({
    admin_id: user.id,
    action: 'Administrador removido',
    details: { email: emailLower }
  })

  revalidatePath('/dashboard/superadmin')
  return { success: true }
}

/**
 * Dynamic initializer: syncs environment SUPERADMIN_EMAILS config to database table if empty.
 */
export async function initializeSuperadminEmails() {
  try {
    const adminClient = createAdminClient()

    const { count, error } = await adminClient
      .from('superadmin_emails')
      .select('*', { count: 'exact', head: true })

    if (error) return { error: error.message }

    if (count === 0) {
      const envEmails = (process.env.SUPERADMIN_EMAILS || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)

      if (envEmails.length > 0) {
        const inserts = envEmails.map((email) => ({ email }))
        await adminClient.from('superadmin_emails').insert(inserts)
        
        for (const email of envEmails) {
          const { data: prof } = await adminClient
            .from('professionals')
            .select('id')
            .eq('email', email)
            .maybeSingle()

          if (prof) {
            await adminClient
              .from('professionals')
              .update({ is_superadmin: true })
              .eq('id', prof.id)
          }
        }
      }
    }
    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Initialization error:', message)
    return { error: message }
  }
}

/**
 * Returns all whitelisted superadmin emails.
 */
export async function getSuperadminEmails() {
  const isAdmin = await checkIsSuperadmin()
  if (!isAdmin) throw new Error('No autorizado')

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('superadmin_emails')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin emails:', error)
    return []
  }

  return data
}

/**
 * Returns latest audit logs for the administration dashboard.
 */
export async function getAuditLogs() {

  const isAdmin = await checkIsSuperadmin()
  if (!isAdmin) throw new Error('No autorizado')

  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('admin_audit_logs')
    .select('*, professionals!admin_audit_logs_admin_id_fkey(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching audit logs:', error)
    return []
  }

  return data
}
