# n8n — Workflow: WhatsApp Asistente Virtual Médico

Este directorio contiene el workflow de n8n que conecta WhatsApp con la plataforma
**Smart Receptionist (AssistWarrior)** para agendar, cancelar y confirmar citas
automáticamente desde mensajes de WhatsApp.

---

## Archivo

| Archivo | Descripción |
|---------|-------------|
| `assistwarrior-appointments-workflow.json` | Workflow listo para importar en n8n |

---

## Requisitos previos

- Instancia de **n8n** (self-hosted o cloud) con versión ≥ 1.30
- Acceso a la API de **WhatsApp Business** (Meta)
- Credenciales de **OpenAI** (GPT-4 o compatible)
- Cuenta de **Google Calendar** con OAuth2
- Tu instancia de **Supabase** con la base de datos de AssistWarrior ya migrada

---

## Variables de entorno de n8n

Configura las siguientes **variables de entorno globales** en tu instancia de n8n
(`Settings → Environment Variables` o en el archivo `.env` de n8n):

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `APP_URL` | URL pública de tu aplicación Next.js (sin barra final) | `https://app.assistwarrior.com` |
| `N8N_WEBHOOK_SECRET` | El mismo valor que en el `.env.local` de Next.js | `una-cadena-secreta-larga` |

---

## Credenciales de n8n requeridas

Crea y configura las siguientes credenciales en n8n (`Credentials → Add Credential`):

| Nombre en el workflow | Tipo de credencial n8n | Qué configurar |
|-----------------------|------------------------|----------------|
| `Supabase` | Supabase API | URL del proyecto + `service_role` key |
| `OpenAI` | OpenAI API | API Key de OpenAI |
| `WhatsApp` | WhatsApp Business Cloud API | Token de acceso de la app de Meta + phone number ID |
| `Google Calendar` | Google Calendar OAuth2 | Client ID + Client Secret de Google Cloud Console |

> **Nota de seguridad:** el workflow NO usa las credenciales de Supabase para escribir
> citas. Todo el acceso de escritura (INSERT/UPDATE) va a través de los endpoints seguros
> de Next.js (`/api/n8n/appointments`) autenticados con `N8N_WEBHOOK_SECRET`, no con la
> `service_role` key directamente desde n8n.

---

## Cómo importar el workflow

1. Abre tu instancia de n8n y ve a **Workflows → Import from File**.
2. Selecciona el archivo `assistwarrior-appointments-workflow.json`.
3. Haz clic en **Import**.
4. Ve a **Credentials** y asigna las credenciales correctas a cada nodo que las requiera
   (Supabase, OpenAI, WhatsApp, Google Calendar).
5. Actualiza el **Webhook URL** del nodo `WhatsApp Trigger` en Meta Business Manager para
   que apunte a la URL de webhook generada por n8n.
6. Activa el workflow con el toggle en la esquina superior derecha.

---

## Qué hace el workflow

```
WhatsApp msg  →  Extraer datos  →  Buscar profesional
                                         ↓
                               ¿Activo y plan válido?
                               ├── No → "Servicio no disponible"
                               └── Sí → Buscar paciente
                                             ↓
                                    ¿Paciente existente?
                                    ├── No → Presentación del consultorio
                                    └── Sí → Clasificar intención (OpenAI)
                                                    ↓
                                         Enrutar por intención
                                         ├── schedule/reschedule → Validar fecha/hora → working_hours → blocked_slots → Google Calendar → POST /api/n8n/appointments → push notification al médico
                                         ├── cancel → Buscar cita → PATCH /api/n8n/appointments (cancel) → Google Calendar delete → encuesta
                                         ├── confirm → Buscar cita → PATCH /api/n8n/appointments (confirm)
                                         └── question/other → OpenAI responde
```

---

## Endpoints de Next.js que consume el workflow

| Método | Ruta | Autenticación | Propósito |
|--------|------|---------------|-----------|
| `POST` | `/api/n8n/appointments` | `Bearer N8N_WEBHOOK_SECRET` | Crear cita (valida solapamiento, crea paciente si nuevo, inserta en DB) |
| `PATCH` | `/api/n8n/appointments` | `Bearer N8N_WEBHOOK_SECRET` | Cancelar o confirmar cita existente |
| `POST` | `/api/notifications/send` | `Bearer N8N_WEBHOOK_SECRET` | Enviar push notification al médico |

---

## Notas de seguridad

- El secreto `N8N_WEBHOOK_SECRET` se compara con `crypto.timingSafeEqual` en el servidor
  Next.js para evitar ataques de timing.
- n8n nunca escribe directamente en Supabase para citas: toda mutación pasa por la API
  con validación de Zod, solapamiento de horarios y verificación de plan activo.
- El `service_role` key de Supabase se usa en n8n únicamente para los SELECTs de solo
  lectura (buscar profesional, buscar paciente, buscar citas activas, blocked_slots,
  disponibilidad de calendario).
