import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const revalidate = 3600 // Revalidar cada hora (3600 segundos)

export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data: plans, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true })

    if (error) {
      console.error('Error fetching pricing plans:', error)
      return NextResponse.json({ error: 'Failed to fetch pricing plans' }, { status: 500 })
    }

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Unexpected error fetching pricing plans:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
