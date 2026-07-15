-- Migration 012: Add pending_appointment JSONB column to the patients table
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS pending_appointment JSONB;
