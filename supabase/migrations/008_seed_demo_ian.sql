-- ============================================================
-- SMART RECEPTIONIST — DEMO: Dr. Carlos Mendoza
-- Email: ianmendozarodriguez@gmail.com
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- 1. Limpiar usuario demo anterior si existe
DO $$
DECLARE
  v_old_id UUID;
BEGIN
  -- Limpiar el usuario anterior (domohomeian / rodriguezianmerzi)
  SELECT id INTO v_old_id FROM auth.users 
  WHERE email IN ('domohomeian@gmail.com', 'rodriguezianmerzi@gmail.com');
  
  IF v_old_id IS NOT NULL THEN
    -- Borrar datos en cascada
    DELETE FROM public.activity_log WHERE professional_id = v_old_id;
    DELETE FROM public.messages WHERE professional_id = v_old_id;
    DELETE FROM public.conversations WHERE professional_id = v_old_id;
    DELETE FROM public.appointments WHERE professional_id = v_old_id;
    DELETE FROM public.blocked_slots WHERE professional_id = v_old_id;
    DELETE FROM public.patients WHERE professional_id = v_old_id;
    DELETE FROM public.push_subscriptions WHERE professional_id = v_old_id;
    DELETE FROM public.professionals WHERE id = v_old_id;
    DELETE FROM auth.identities WHERE user_id = v_old_id;
    DELETE FROM auth.sessions WHERE user_id = v_old_id;
    DELETE FROM auth.refresh_tokens WHERE user_id = v_old_id;
    DELETE FROM auth.mfa_factors WHERE user_id = v_old_id;
    DELETE FROM auth.users WHERE id = v_old_id;
  END IF;
END $$;

-- 2. Crear nuevo usuario demo
DO $$
DECLARE
  v_user_id UUID := gen_random_uuid();
  v_patient1_id UUID := gen_random_uuid();
  v_patient2_id UUID := gen_random_uuid();
  v_patient3_id UUID := gen_random_uuid();
  v_conversation_id UUID := gen_random_uuid();
  v_demo_email TEXT := 'ianmendozarodriguez@gmail.com';
BEGIN

  -- Verificar si ya existe
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = v_demo_email) THEN
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_demo_email;
    
    -- Limpiar datos existentes
    DELETE FROM public.activity_log WHERE professional_id = v_user_id;
    DELETE FROM public.messages WHERE professional_id = v_user_id;
    DELETE FROM public.conversations WHERE professional_id = v_user_id;
    DELETE FROM public.appointments WHERE professional_id = v_user_id;
    DELETE FROM public.blocked_slots WHERE professional_id = v_user_id;
    DELETE FROM public.patients WHERE professional_id = v_user_id;
    
    -- Asegurar que identities esté correcto
    DELETE FROM auth.identities WHERE user_id = v_user_id;
    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider, 
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_user_id, v_user_id::text,
      jsonb_build_object('sub', v_user_id::text, 'email', v_demo_email, 'email_verified', true, 'phone_verified', false),
      'email', now(), now(), now()
    );
    
  ELSE
    -- Crear usuario nuevo en auth.users
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin, 
      created_at, updated_at,
      confirmation_sent_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_demo_email,
      crypt('DemoAssist2026!', gen_salt('bf')),
      now(),  -- email_confirmed_at = ahora (IMPORTANTE para que OTP funcione)
      jsonb_build_object('provider', 'email', 'providers', array['email']),
      jsonb_build_object(),
      false,
      now(), now(),
      now()
    );

    -- Crear identity (DEBE coincidir exactamente con auth.users.email)
    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider, 
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_user_id, v_user_id::text,
      jsonb_build_object('sub', v_user_id::text, 'email', v_demo_email, 'email_verified', true, 'phone_verified', false),
      'email', now(), now(), now()
    );
  END IF;

  -- El trigger handle_new_user() ya debió crear el profesional.
  -- Actualizarlo con los datos demo:
  INSERT INTO public.professionals (id, email)
  VALUES (v_user_id, v_demo_email)
  ON CONFLICT (id) DO NOTHING;

  UPDATE public.professionals SET
    email = v_demo_email,
    full_name = 'Dr. Carlos Mendoza',
    specialty = 'Cardiólogo',
    clinic_name = 'Centro Cardiológico Mendoza',
    phone_whatsapp = '+525512345678',
    plan = 'pro',
    plan_status = 'active',
    google_calendar_connected = true,
    n8n_webhook_url = 'https://n8n.assistwarrior.com/webhook/demo',
    tone_prompt = 'Soy el Dr. Mendoza. Respondo con amabilidad y precisión sobre temas cardiológicos.',
    avatar_url = 'https://i.pravatar.cc/150?u=carlos',
    is_active = true,
    is_superadmin = false,
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

  -- 3. Pacientes
  INSERT INTO public.patients (id, professional_id, full_name, phone_whatsapp, email) VALUES
    (v_patient1_id, v_user_id, 'Ana Sofia Garcia', '+525588887777', 'ana@gmail.com'),
    (v_patient2_id, v_user_id, 'Roberto Fernandez', '+525599996666', 'roberto@hotmail.com'),
    (v_patient3_id, v_user_id, 'Luis Hernandez', '+525544443333', NULL);

  -- 4. Citas
  INSERT INTO public.appointments (professional_id, patient_id, patient_name, patient_phone, title, starts_at, ends_at, status, channel) VALUES
    (v_user_id, v_patient1_id, 'Ana Sofia Garcia', '+525588887777', 'Revisión de estudios',
     date_trunc('hour', now()) + interval '1 day' + interval '10 hours',
     date_trunc('hour', now()) + interval '1 day' + interval '10 hours 30 minutes',
     'scheduled', 'whatsapp'),
    (v_user_id, v_patient2_id, 'Roberto Fernandez', '+525599996666', 'Consulta primera vez',
     date_trunc('hour', now()) + interval '2 days' + interval '12 hours',
     date_trunc('hour', now()) + interval '2 days' + interval '12 hours 30 minutes',
     'confirmed', 'voice');

  -- 5. Bloqueos de horario
  INSERT INTO public.blocked_slots (professional_id, title, starts_at, ends_at, is_all_day) VALUES
    (v_user_id, 'Congreso Internacional de Cardiología',
     date_trunc('day', now()) + interval '7 days',
     date_trunc('day', now()) + interval '9 days', true),
    (v_user_id, 'Comida',
     date_trunc('hour', now()) + interval '1 day' + interval '14 hours',
     date_trunc('hour', now()) + interval '1 day' + interval '15 hours', false);

  -- 6. Conversación y mensajes
  INSERT INTO public.conversations (id, professional_id, patient_id, patient_phone, patient_name, status, last_message_preview, unread_count, last_message_at)
  VALUES (v_conversation_id, v_user_id, v_patient1_id, '+525588887777', 'Ana Sofia Garcia', 'open',
          '¡Claro! Quedas agendada a las 10 am de mañana.', 0, now());

  INSERT INTO public.messages (conversation_id, professional_id, content, direction, sender, status, created_at) VALUES
    (v_conversation_id, v_user_id, 'Hola, ¿me podrían agendar a las 10 am de mañana?', 'inbound', 'patient', 'read', now() - interval '5 minutes'),
    (v_conversation_id, v_user_id, '¡Claro! Quedas agendada a las 10 am de mañana.', 'outbound', 'ai', 'delivered', now());

  -- 7. Actividad reciente
  INSERT INTO public.activity_log (professional_id, type, title, description, related_id, created_at) VALUES
    (v_user_id, 'new_message', 'Nuevo mensaje de Ana Sofia Garcia', 'Mensaje vía WhatsApp', v_conversation_id, now() - interval '4 minutes'),
    (v_user_id, 'appointment_confirmed', 'Cita confirmada', 'Revisión de estudios - Ana Sofia Garcia', v_patient1_id, now() - interval '3 minutes');

  RAISE NOTICE '✅ Usuario demo creado: % (ID: %)', v_demo_email, v_user_id;

END $$;
