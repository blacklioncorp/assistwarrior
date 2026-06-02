-- ============================================================
-- SCRIPT DE DEMOSTRACIÓN: Dr. Carlos Mendoza
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- Habilitar extensión pgcrypto para cifrar contraseñas si no existe
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_user_id UUID := gen_random_uuid();
  v_patient1_id UUID := gen_random_uuid();
  v_patient2_id UUID := gen_random_uuid();
  v_patient3_id UUID := gen_random_uuid();
  v_conversation_id UUID := gen_random_uuid();
BEGIN

  -- 1. Crear usuario en auth.users
  -- Asegurarse de que el email no exista previamente
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'dr.carlos@assistwarrior.com') THEN
    
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, 
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
      created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'dr.carlos@assistwarrior.com', 
      crypt('DemoAssist2026!', gen_salt('bf')), 
      now(), '{"provider":"email","providers":["email"]}', '{}', 
      now(), now()
    );
    
    -- Insert auth.identities
    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_user_id, v_user_id::text, format('{"sub":"%s","email":"dr.carlos@assistwarrior.com"}', v_user_id)::jsonb, 'email', now(), now(), now()
    );

    -- Nota: El trigger handle_new_user() en la DB creará la entrada en public.professionals automáticamente.

  ELSE
    -- Si ya existe, obtener su ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'dr.carlos@assistwarrior.com';
    
    -- Actualizar contraseña por si acaso para asegurar el acceso
    UPDATE auth.users 
    SET encrypted_password = crypt('DemoAssist2026!', gen_salt('bf')) 
    WHERE id = v_user_id;
  END IF;

  -- Darle tiempo al trigger para que cree el profesional
  PERFORM pg_sleep(1);

  -- 2. Actualizar el perfil del profesional
  UPDATE public.professionals SET
    full_name = 'Dr. Carlos Mendoza',
    specialty = 'Cardiólogo',
    clinic_name = 'Centro Cardiológico Mendoza',
    phone_whatsapp = '+525512345678',
    google_calendar_connected = true,
    n8n_webhook_url = 'https://n8n.assistwarrior.com/webhook/demo',
    plan = 'pro',
    avatar_url = 'https://i.pravatar.cc/150?u=carlos',
    tone_prompt = 'Soy el Dr. Mendoza. Respondo con amabilidad y precisión sobre temas cardiológicos.',
    working_hours = '{
      "monday":    {"start": "09:00", "end": "18:00", "enabled": true},
      "tuesday":   {"start": "09:00", "end": "18:00", "enabled": true},
      "wednesday": {"start": "09:00", "end": "18:00", "enabled": true},
      "thursday":  {"start": "09:00", "end": "18:00", "enabled": true},
      "friday":    {"start": "09:00", "end": "14:00", "enabled": true},
      "saturday":  {"start": "09:00", "end": "14:00", "enabled": false},
      "sunday":    {"start": "09:00", "end": "14:00", "enabled": false}
    }'::JSONB
  WHERE id = v_user_id;

  -- Limpiar datos de demostración anteriores (por si se corre el script múltiples veces)
  DELETE FROM public.patients WHERE professional_id = v_user_id;
  DELETE FROM public.blocked_slots WHERE professional_id = v_user_id;
  -- Al borrar pacientes, las citas, conversaciones y mensajes se borran en cascada gracias al esquema ON DELETE CASCADE.

  -- 3. Insertar Pacientes
  INSERT INTO public.patients (id, professional_id, full_name, phone_whatsapp, email) VALUES
    (v_patient1_id, v_user_id, 'Ana Sofia Garcia', '+525588887777', 'ana@gmail.com'),
    (v_patient2_id, v_user_id, 'Roberto Fernandez', '+525599996666', 'roberto@hotmail.com'),
    (v_patient3_id, v_user_id, 'Luis Hernandez', '+525544443333', NULL);

  -- 4. Insertar Citas Falsas
  -- Uso funciones dinámicas (now() + interval) para asegurar que la demostración siempre muestre citas próximas.
  INSERT INTO public.appointments (professional_id, patient_id, patient_name, patient_phone, title, starts_at, ends_at, status, channel) VALUES
    (v_user_id, v_patient1_id, 'Ana Sofia Garcia', '+525588887777', 'Revisión de estudios', date_trunc('hour', now()) + interval '1 day' + interval '10 hours', date_trunc('hour', now()) + interval '1 day' + interval '10 hours 30 minutes', 'scheduled', 'whatsapp'),
    (v_user_id, v_patient2_id, 'Roberto Fernandez', '+525599996666', 'Consulta primera vez', date_trunc('hour', now()) + interval '2 days' + interval '12 hours', date_trunc('hour', now()) + interval '2 days' + interval '12 hours 30 minutes', 'confirmed', 'voice');

  -- 5. Insertar Bloqueos
  INSERT INTO public.blocked_slots (professional_id, title, starts_at, ends_at, is_all_day) VALUES
    (v_user_id, 'Congreso Internacional de Cardiología', date_trunc('day', now()) + interval '7 days', date_trunc('day', now()) + interval '9 days', true),
    (v_user_id, 'Comida', date_trunc('hour', now()) + interval '1 day' + interval '14 hours', date_trunc('hour', now()) + interval '1 day' + interval '15 hours', false);

  -- 6. Insertar Conversación simulada de WhatsApp
  INSERT INTO public.conversations (id, professional_id, patient_id, patient_phone, patient_name, status, last_message_preview, unread_count) VALUES
    (v_conversation_id, v_user_id, v_patient1_id, '+525588887777', 'Ana Sofia Garcia', 'open', '¡Claro! Quedas agendada a las 10 am de mañana.', 0);

  -- Insertar Mensajes de la conversación
  INSERT INTO public.messages (conversation_id, professional_id, content, direction, sender, status, created_at) VALUES
    (v_conversation_id, v_user_id, 'Hola, ¿me podrían agendar a las 10 am de mañana?', 'inbound', 'patient', 'read', now() - interval '5 minutes'),
    (v_conversation_id, v_user_id, '¡Claro! Quedas agendada a las 10 am de mañana.', 'outbound', 'ai', 'delivered', now());

END $$;
