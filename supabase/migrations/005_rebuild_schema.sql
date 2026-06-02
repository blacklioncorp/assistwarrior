-- ============================================================
-- Smart Receptionist — Rebuild Schema
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- 1. DROP ALL EXISTING TABLES & TRIGGERS TO START FRESH
DROP TABLE IF EXISTS public.admin_audit_logs CASCADE;
DROP TABLE IF EXISTS public.superadmin_emails CASCADE;
DROP TABLE IF EXISTS public.blocked_slots CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.push_subscriptions CASCADE;
DROP TABLE IF EXISTS public.activity_log CASCADE;
DROP TABLE IF EXISTS public.professionals CASCADE;

-- Extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: professionals
-- ============================================================
CREATE TABLE public.professionals (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  specialty TEXT,                          -- e.g., "Medicina General", "Dentista"
  clinic_name TEXT,
  phone_whatsapp TEXT,                     -- Teléfono WhatsApp del negocio
  timezone TEXT DEFAULT 'America/Mexico_City',
  working_hours JSONB DEFAULT '{
    "monday":    {"start": "09:00", "end": "18:00", "enabled": true},
    "tuesday":   {"start": "09:00", "end": "18:00", "enabled": true},
    "wednesday": {"start": "09:00", "end": "18:00", "enabled": true},
    "thursday":  {"start": "09:00", "end": "18:00", "enabled": true},
    "friday":    {"start": "09:00", "end": "18:00", "enabled": true},
    "saturday":  {"start": "09:00", "end": "14:00", "enabled": false},
    "sunday":    {"start": "09:00", "end": "14:00", "enabled": false}
  }'::JSONB,
  appointment_duration_minutes INTEGER DEFAULT 30,
  plan TEXT DEFAULT 'basic' CHECK (plan IN ('basic', 'pro', 'trial')),
  plan_status TEXT DEFAULT 'active' CHECK (plan_status IN ('active', 'inactive', 'trialing', 'past_due')),
  -- Stripe
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  -- Integraciones
  google_calendar_connected BOOLEAN DEFAULT false,
  calcom_api_key TEXT,
  -- n8n
  n8n_webhook_url TEXT,                    -- URL del webhook de n8n asignado a este profesional
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  -- Superadmin fields (from migration 002)
  is_superadmin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  tone_prompt TEXT,
  avatar_url TEXT
);

-- ============================================================
-- TABLA: patients
-- ============================================================
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_whatsapp TEXT NOT NULL,            -- En formato internacional, e.g., "+521234567890"
  email TEXT,
  date_of_birth DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(professional_id, phone_whatsapp)
);

-- ============================================================
-- TABLA: appointments
-- ============================================================
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  -- Datos de la cita
  patient_name TEXT NOT NULL,              -- Desnormalizado para acceso rápido
  patient_phone TEXT,
  title TEXT NOT NULL DEFAULT 'Consulta General',
  notes TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  -- Estado
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show')),
  -- Canal de origen
  channel TEXT DEFAULT 'dashboard' CHECK (channel IN ('whatsapp', 'voice', 'dashboard', 'calcom')),
  -- IDs externos
  google_calendar_event_id TEXT,
  calcom_booking_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABLA: conversations
-- ============================================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  patient_phone TEXT NOT NULL,
  patient_name TEXT,
  -- Estado del hilo
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived')),
  last_message_at TIMESTAMPTZ DEFAULT now(),
  last_message_preview TEXT,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABLA: messages
-- ============================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  -- Contenido
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT,                         -- 'image', 'audio', 'document'
  -- Dirección del mensaje
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  sender TEXT,                             -- 'patient', 'ai', 'professional'
  -- Estado de entrega
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  -- ID de WhatsApp para rastreo
  whatsapp_message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABLA: push_subscriptions
-- ============================================================
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABLA: activity_log
-- ============================================================
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('appointment_booked', 'appointment_cancelled', 'appointment_confirmed', 'new_patient', 'new_message', 'call_received')),
  title TEXT NOT NULL,
  description TEXT,
  related_id UUID,                         -- ID de cita, paciente, etc.
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABLA: blocked_slots (from migration 003)
-- ============================================================
CREATE TABLE public.blocked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_all_day BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- TABLA: superadmin_emails (from migration 002)
-- ============================================================
CREATE TABLE public.superadmin_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  added_by UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- TABLA: admin_audit_logs (from migration 002)
-- ============================================================
CREATE TABLE public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  target_professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- ÍNDICES para mejorar performance
-- ============================================================
CREATE INDEX idx_appointments_professional_starts ON public.appointments(professional_id, starts_at);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_patients_professional ON public.patients(professional_id);
CREATE INDEX idx_patients_phone ON public.patients(phone_whatsapp);
CREATE INDEX idx_conversations_professional ON public.conversations(professional_id, last_message_at DESC);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX idx_push_subscriptions_professional ON public.push_subscriptions(professional_id);
CREATE INDEX idx_activity_professional ON public.activity_log(professional_id, created_at DESC);
CREATE INDEX idx_blocked_slots_professional ON public.blocked_slots(professional_id, starts_at, ends_at);

-- ============================================================
-- TRIGGERS: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_professionals_updated
  BEFORE UPDATE ON public.professionals
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE OR REPLACE TRIGGER on_patients_updated
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE OR REPLACE TRIGGER on_appointments_updated
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ============================================================
-- TRIGGER: Crear perfil al registrarse
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.professionals (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.superadmin_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas: professionals
CREATE POLICY "Profesional puede ver su propio perfil"
  ON public.professionals FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Profesional puede actualizar su propio perfil"
  ON public.professionals FOR UPDATE
  USING (auth.uid() = id);

-- Políticas: patients
CREATE POLICY "Profesional ve sus propios pacientes"
  ON public.patients FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Profesional crea pacientes"
  ON public.patients FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Profesional actualiza sus pacientes"
  ON public.patients FOR UPDATE
  USING (auth.uid() = professional_id);

CREATE POLICY "Profesional elimina sus pacientes"
  ON public.patients FOR DELETE
  USING (auth.uid() = professional_id);

-- Políticas: appointments
CREATE POLICY "Profesional ve sus citas"
  ON public.appointments FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Profesional crea citas"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Profesional actualiza sus citas"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = professional_id);

CREATE POLICY "Profesional cancela sus citas"
  ON public.appointments FOR DELETE
  USING (auth.uid() = professional_id);

-- Políticas: conversations
CREATE POLICY "Profesional ve sus conversaciones"
  ON public.conversations FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Profesional actualiza sus conversaciones"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = professional_id);

-- Políticas: messages
CREATE POLICY "Profesional ve mensajes de sus conversaciones"
  ON public.messages FOR SELECT
  USING (auth.uid() = professional_id);

-- Políticas: push_subscriptions
CREATE POLICY "Profesional ve sus suscripciones push"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Profesional registra suscripción push"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Profesional actualiza suscripción push"
  ON public.push_subscriptions FOR UPDATE
  USING (auth.uid() = professional_id);

CREATE POLICY "Profesional elimina sus suscripciones push"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = professional_id);

-- Políticas: activity_log
CREATE POLICY "Profesional ve su actividad"
  ON public.activity_log FOR SELECT
  USING (auth.uid() = professional_id);

-- Políticas: blocked_slots (from migration 003)
CREATE POLICY "Profesionales gestionan sus propios bloqueos"
  ON public.blocked_slots FOR ALL 
  USING (auth.uid() = professional_id)
  WITH CHECK (auth.uid() = professional_id);

-- Políticas: superadmin_emails & admin_audit_logs (from migration 002)
CREATE POLICY "Solo superadmins pueden ver la lista blanca"
  ON public.superadmin_emails FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.professionals WHERE id = auth.uid() AND is_superadmin = true));

CREATE POLICY "Solo superadmins pueden modificar la lista blanca"
  ON public.superadmin_emails FOR ALL
  USING (EXISTS (SELECT 1 FROM public.professionals WHERE id = auth.uid() AND is_superadmin = true));

CREATE POLICY "Solo superadmins pueden ver logs de auditoría"
  ON public.admin_audit_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.professionals WHERE id = auth.uid() AND is_superadmin = true));

CREATE POLICY "Solo superadmins pueden insertar logs de auditoría"
  ON public.admin_audit_logs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.professionals WHERE id = auth.uid() AND is_superadmin = true));

-- ============================================================
-- CAPA DE PROTECCIÓN BASE DE DATOS: TRIGGER DE BLOQUEO DE HORAS (from migration 004)
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_appointment_blocked_slots_collision()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('scheduled', 'confirmed') AND EXISTS (
    SELECT 1 
    FROM public.blocked_slots
    WHERE professional_id = NEW.professional_id
      AND NEW.starts_at < ends_at
      AND NEW.ends_at > starts_at
  ) THEN
    RAISE EXCEPTION 'La cita coincide con un horario bloqueado. Por favor elige otro horario.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_check_appointment_blocked_slots_collision
BEFORE INSERT OR UPDATE OF starts_at, ends_at, status ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.check_appointment_blocked_slots_collision();

-- ============================================================
-- 3. RESTORE EXISTING USERS INTO professionals
-- ============================================================
INSERT INTO public.professionals (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
