import { createClient } from '@/lib/utils/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Checks if the currently authenticated user is a superadmin.
 * Verifies against:
 * 1. The SUPERADMIN_EMAILS environment variable (comma-separated list).
 * 2. The `superadmin_emails` table in the database.
 * 3. The `is_superadmin` flag in the `professionals` table.
 */
export async function checkIsSuperadmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) return false

    const userEmail = user.email.toLowerCase().trim()

    // 1. Check the environment variable list
    const envEmails = (process.env.SUPERADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
    
    if (envEmails.includes(userEmail)) {
      return true
    }

    // 2. Check the dynamic database whitelist
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('superadmin_emails')
      .select('id')
      .eq('email', userEmail)
      .maybeSingle()

    if (data && !error) {
      return true
    }

    // 3. Check the professionals is_superadmin flag directly
    const { data: prof } = await adminClient
      .from('professionals')
      .select('is_superadmin')
      .eq('id', user.id)
      .maybeSingle()

    if (prof?.is_superadmin) {
      return true
    }

    return false
  } catch (error) {
    console.error('Error verifying superadmin status:', error)
    return false
  }
}
