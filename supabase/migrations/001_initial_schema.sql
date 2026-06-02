-- ============================================================
-- Smart Receptionist — Migración Inicial
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- Extensión para generar UUIDs
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLA: professionals
-- El perfil del médico/profesional que usa la plataforma
-- ============================================================
create table if not exists public.professionals (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  specialty text,                          -- e.g., "Medicina General", "Dentista"
  clinic_name text,
  phone_whatsapp text,                     -- Teléfono WhatsApp del negocio
  timezone text default 'America/Mexico_City',
  working_hours jsonb default '{
    "monday":    {"start": "09:00", "end": "18:00", "enabled": true},
    "tuesday":   {"start": "09:00", "end": "18:00", "enabled": true},
    "wednesday": {"start": "09:00", "end": "18:00", "enabled": true},
    "thursday":  {"start": "09:00", "end": "18:00", "enabled": true},
    "friday":    {"start": "09:00", "end": "18:00", "enabled": true},
    "saturday":  {"start": "09:00", "end": "14:00", "enabled": false},
    "sunday":    {"start": "09:00", "end": "14:00", "enabled": false}
  }'::jsonb,
  appointment_duration_minutes integer default 30,
  plan text default 'basic' check (plan in ('basic', 'pro', 'trial')),
  plan_status text default 'active' check (plan_status in ('active', 'inactive', 'trialing', 'past_due')),
  -- Stripe (futuro)
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  -- Integraciones
  google_calendar_connected boolean default false,
  calcom_api_key text,
  -- n8n
  n8n_webhook_url text,                    -- URL del webhook de n8n asignado a este profesional
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- TABLA: patients
-- Pacientes registrados por cada profesional
-- ============================================================
create table if not exists public.patients (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  full_name text not null,
  phone_whatsapp text not null,            -- En formato internacional, e.g., "+521234567890"
  email text,
  date_of_birth date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(professional_id, phone_whatsapp)
);

-- ============================================================
-- TABLA: appointments
-- Citas agendadas
-- ============================================================
create table if not exists public.appointments (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete set null,
  -- Datos de la cita
  patient_name text not null,              -- Desnormalizado para acceso rápido
  patient_phone text,
  title text not null default 'Consulta General',
  notes text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  -- Estado
  status text default 'scheduled' check (status in ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show')),
  -- Canal de origen
  channel text default 'dashboard' check (channel in ('whatsapp', 'voice', 'dashboard', 'calcom')),
  -- IDs externos
  google_calendar_event_id text,
  calcom_booking_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- TABLA: conversations
-- Hilos de conversación de WhatsApp con cada paciente
-- ============================================================
create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete set null,
  patient_phone text not null,
  patient_name text,
  -- Estado del hilo
  status text default 'open' check (status in ('open', 'closed', 'archived')),
  last_message_at timestamptz default now(),
  last_message_preview text,
  unread_count integer default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLA: messages
-- Mensajes individuales dentro de cada conversación
-- ============================================================
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  -- Contenido
  content text not null,
  media_url text,
  media_type text,                         -- 'image', 'audio', 'document'
  -- Dirección del mensaje
  direction text not null check (direction in ('inbound', 'outbound')),
  sender text,                             -- 'patient', 'ai', 'professional'
  -- Estado de entrega
  status text default 'sent' check (status in ('sent', 'delivered', 'read', 'failed')),
  -- ID de WhatsApp para rastreo
  whatsapp_message_id text,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLA: push_subscriptions
-- Suscripciones Web Push para notificaciones en el browser
-- ============================================================
create table if not exists public.push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLA: activity_log
-- Registro de actividad reciente para el dashboard
-- ============================================================
create table if not exists public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  type text not null check (type in ('appointment_booked', 'appointment_cancelled', 'appointment_confirmed', 'new_patient', 'new_message', 'call_received')),
  title text not null,
  description text,
  related_id uuid,                         -- ID de cita, paciente, etc.
  created_at timestamptz default now()
);

-- ============================================================
-- ÍNDICES para mejorar performance
-- ============================================================
create index if not exists idx_appointments_professional_starts on public.appointments(professional_id, starts_at);
create index if not exists idx_appointments_status on public.appointments(status);
create index if not exists idx_patients_professional on public.patients(professional_id);
create index if not exists idx_patients_phone on public.patients(phone_whatsapp);
create index if not exists idx_conversations_professional on public.conversations(professional_id, last_message_at desc);
create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at);
create index if not exists idx_push_subscriptions_professional on public.push_subscriptions(professional_id);
create index if not exists idx_activity_professional on public.activity_log(professional_id, created_at desc);

-- ============================================================
-- TRIGGERS: updated_at automático
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_professionals_updated
  before update on public.professionals
  for each row execute procedure public.handle_updated_at();

create trigger on_patients_updated
  before update on public.patients
  for each row execute procedure public.handle_updated_at();

create trigger on_appointments_updated
  before update on public.appointments
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- TRIGGER: Crear perfil al registrarse
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.professionals (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Los profesionales SOLO pueden ver sus propios datos
-- ============================================================

alter table public.professionals enable row level security;
alter table public.patients enable row level security;
alter table public.appointments enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.activity_log enable row level security;

-- Políticas: professionals
create policy "Profesional puede ver su propio perfil"
  on public.professionals for select
  using (auth.uid() = id);

create policy "Profesional puede actualizar su propio perfil"
  on public.professionals for update
  using (auth.uid() = id);

-- Políticas: patients
create policy "Profesional ve sus propios pacientes"
  on public.patients for select
  using (auth.uid() = professional_id);

create policy "Profesional crea pacientes"
  on public.patients for insert
  with check (auth.uid() = professional_id);

create policy "Profesional actualiza sus pacientes"
  on public.patients for update
  using (auth.uid() = professional_id);

create policy "Profesional elimina sus pacientes"
  on public.patients for delete
  using (auth.uid() = professional_id);

-- Políticas: appointments
create policy "Profesional ve sus citas"
  on public.appointments for select
  using (auth.uid() = professional_id);

create policy "Profesional crea citas"
  on public.appointments for insert
  with check (auth.uid() = professional_id);

create policy "Profesional actualiza sus citas"
  on public.appointments for update
  using (auth.uid() = professional_id);

create policy "Profesional cancela sus citas"
  on public.appointments for delete
  using (auth.uid() = professional_id);

-- Políticas: conversations
create policy "Profesional ve sus conversaciones"
  on public.conversations for select
  using (auth.uid() = professional_id);

create policy "Profesional actualiza sus conversaciones"
  on public.conversations for update
  using (auth.uid() = professional_id);

-- Políticas: messages
create policy "Profesional ve mensajes de sus conversaciones"
  on public.messages for select
  using (auth.uid() = professional_id);

-- Políticas: push_subscriptions
create policy "Profesional ve sus suscripciones push"
  on public.push_subscriptions for select
  using (auth.uid() = professional_id);

create policy "Profesional registra suscripción push"
  on public.push_subscriptions for insert
  with check (auth.uid() = professional_id);

create policy "Profesional actualiza suscripción push"
  on public.push_subscriptions for update
  using (auth.uid() = professional_id);

create policy "Profesional elimina sus suscripciones push"
  on public.push_subscriptions for delete
  using (auth.uid() = professional_id);

-- Políticas: activity_log
create policy "Profesional ve su actividad"
  on public.activity_log for select
  using (auth.uid() = professional_id);

-- ============================================================
-- DATOS DE EJEMPLO (opcional, comentar en producción)
-- ============================================================
-- insert into public.professionals (id, email, full_name, specialty, clinic_name)
-- values ('00000000-0000-0000-0000-000000000001', 'demo@example.com', 'Dr. Juan Pérez', 'Medicina General', 'Clínica Salud Total');
