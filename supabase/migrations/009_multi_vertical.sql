-- SENZIO — Migración 009: Arquitectura Multi-Vertical

-- 1. Tabla de Tipos de Negocio
CREATE TABLE IF NOT EXISTS public.business_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Insertar valores por defecto (Verticales Iniciales)
INSERT INTO public.business_types (name, label, config) VALUES
('doctor', 'Médicos / Salud', '{
  "appointment_label": "Cita",
  "client_label": "Paciente",
  "requires_google_calendar": true,
  "requires_delivery": false,
  "custom_fields": []
}'::jsonb),
('restaurant', 'Restaurantes', '{
  "appointment_label": "Pedido",
  "client_label": "Comensal",
  "requires_google_calendar": false,
  "requires_delivery": true,
  "custom_fields": [
    {"name": "order_details", "type": "string", "description": "Detalles del pedido de comida"},
    {"name": "delivery_address", "type": "string", "description": "Dirección de entrega (si aplica)"}
  ]
}'::jsonb),
('dentist', 'Dentistas', '{
  "appointment_label": "Consulta",
  "client_label": "Paciente",
  "requires_google_calendar": true,
  "requires_delivery": false,
  "custom_fields": [
    {"name": "reason_for_visit", "type": "string", "description": "Razón de la consulta (ej. limpieza, dolor)"}
  ]
}'::jsonb)
ON CONFLICT (name) DO UPDATE SET label = EXCLUDED.label, config = EXCLUDED.config;

-- 3. Modificar la tabla professionals
ALTER TABLE public.professionals 
ADD COLUMN IF NOT EXISTS business_type_id UUID REFERENCES public.business_types(id),
ADD COLUMN IF NOT EXISTS business_config JSONB DEFAULT '{}'::jsonb;

-- 4. Asignar 'doctor' por defecto a todos los profesionales existentes
DO $$
DECLARE
    doctor_type_id UUID;
BEGIN
    SELECT id INTO doctor_type_id FROM public.business_types WHERE name = 'doctor' LIMIT 1;
    
    IF doctor_type_id IS NOT NULL THEN
        UPDATE public.professionals 
        SET business_type_id = doctor_type_id 
        WHERE business_type_id IS NULL;
    END IF;
END $$;
