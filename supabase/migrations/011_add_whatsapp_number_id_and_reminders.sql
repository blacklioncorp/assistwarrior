-- Migration 011: Add whatsapp_phone_number_id to professionals and reminder_sent to appointments

-- 1. Agregar columna whatsapp_phone_number_id a la tabla professionals
ALTER TABLE public.professionals 
ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id TEXT;

-- 2. Agregar columna reminder_sent a la tabla appointments
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

-- 3. Agregar columnas para integración de voz
ALTER TABLE public.professionals 
ADD COLUMN IF NOT EXISTS voice_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS voice_phone_number TEXT;

-- 4. Crear índice para acelerar la búsqueda de citas pendientes de recordatorio
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_sent 
ON public.appointments(status, reminder_sent, starts_at);
