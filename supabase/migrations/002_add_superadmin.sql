-- ============================================================
-- Smart Receptionist — Migración 002: Superadmin y Configuración
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- Campos para la tabla professionals
ALTER TABLE public.professionals 
ADD COLUMN IF NOT EXISTS is_superadmin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS tone_prompt TEXT;

-- Lista blanca de correos superadmin (gestión dinámica)
CREATE TABLE IF NOT EXISTS public.superadmin_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  added_by UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Registro de auditoría
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  target_professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS para las nuevas tablas
ALTER TABLE public.superadmin_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS: solo superadmins pueden acceder/modificar
CREATE POLICY "Solo superadmins pueden ver la lista blanca"
  ON public.superadmin_emails FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.professionals
      WHERE id = auth.uid() AND is_superadmin = true
    )
  );

CREATE POLICY "Solo superadmins pueden modificar la lista blanca"
  ON public.superadmin_emails FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.professionals
      WHERE id = auth.uid() AND is_superadmin = true
    )
  );

CREATE POLICY "Solo superadmins pueden ver logs de auditoría"
  ON public.admin_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.professionals
      WHERE id = auth.uid() AND is_superadmin = true
    )
  );

CREATE POLICY "Solo superadmins pueden insertar logs de auditoría"
  ON public.admin_audit_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.professionals
      WHERE id = auth.uid() AND is_superadmin = true
    )
  );
