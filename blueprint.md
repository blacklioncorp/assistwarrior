# Blueprint: Smart Receptionist - Dashboard & Superadmin Portal

### Overview
This is a Next.js (App Router, Tailwind CSS, TypeScript) application that provides medical receptionist services. It allows medical professionals to view and schedule appointments, manage patients, set the assistant's AI tone, and upgrade plans. It also features a secret administrative login route (`/micro`) leading to a global Superadmin Console (`/dashboard/superadmin`) to monitor and manage all professional accounts and review system audit logs.

---

### Style & Design System
*   **Color Palette:** Curated premium slate and deep blue tones (e.g., `#090D16`, `bg-slate-900/40`, `#1E4A8A` for primary actions) with subtle amber/gold borders for secret admin panels and warning badges.
*   **Layout:** Responsive dashboard layout containing a sticky desktop sidebar with dynamic user/admin option views and a sleek mobile navigation bar.
*   **Depth & Elevation:** Modern glassmorphism with backdrop filters, multi-layered shadows to elevate cards and dialogs, and smooth interactive micro-animations (e.g., hover scaling, slide-in transitions).
*   **Typography:** Expressive headings using clean typography hierarchies to optimize scannability.

---

### Database Schema (Supabase)
1.  **`public.professionals` Table Extensions:**
    *   `is_superadmin` (boolean, default false): Flag for administrative privileges.
    *   `is_active` (boolean, default true): Account status (allows suspension).
    *   `tone_prompt` (text): Custom instructions to guide the AI assistant's responses.
2.  **`public.superadmin_emails` Table:**
    *   Dynamic whitelist of emails allowed to log in via `/micro` and acquire administrative credentials.
3.  **`public.admin_audit_logs` Table:**
    *   Logs administrative actions (e.g., plan upgrades, account suspensions, whitelisting other administrators) with tracking of the acting administrator, affected professional, details, and timestamps.
4.  **`public.blocked_slots` Table & Database Triggers:**
    *   `blocked_slots` table to store professional's blocked periods.
    *   `trigger_check_appointment_blocked_slots_collision`: Trigger before insert or update on `appointments` to enforce that scheduled appointments do not overlap with blocked slots. This secures the calendar against direct writes from external tools (like n8n).


---

### Features & Capabilities

#### 1. Server Actions (`app/actions.ts` & `app/actions/superadmin.ts`)
*   `createPatient`: Validates name and phone, registers new patients, and logs dashboard registration activity.
*   `createAppointment`: Validates calendar date and time availability locally. Ensures appointments fall within the doctor's `working_hours` and do not collide with overlapping appointments. Supports instant, inline new-patient registration.
*   `updateSettings`: Updates professional name, clinic details, specialty, contact number, and the AI voice assistant's `tone_prompt`.
*   `createStripeCheckoutSession`: Generates real Stripe subscription sessions. Fallbacks gracefully to simulation/development mode if Stripe keys are missing.
*   `savePushSubscription` / `removePushSubscription`: Registers browser push tokens in database for real-time alerts.
*   `superadmin.ts` Console Actions: Protected server-side actions verifying permissions with `checkIsSuperadmin()`. Handles platform stats aggregates, filtering professionals, updating doctor plans, suspending accounts, and managing the email whitelist.

#### 2. Secret Route `/micro` & Superadmin Console
*   **`/micro` Login:** A passwordless login form with a golden shield aesthetic. Validates entered email against the `superadmin_emails` table and the `SUPERADMIN_EMAILS` env variable before sending a secure OTP magic link.
*   **`/dashboard/superadmin` Console:** Protected console displaying platform-wide statistics (doctors, total appointments, total patients, conversion metrics). Includes search/filters for doctor profiles (adjust plans, suspend/reactivate accounts), email whitelist administration, and audit logs.
*   **Dynamic Synchronization:** Synchronizes whitelisted emails from environment variables during initial loads and automatically updates the authenticated administrator's profile privileges.

#### 3. Client Modals & Interfaces
*   `NewAppointmentModal`: Combines a sliding calendar day picker with available 30-minute consultation slots. Features a tabbed patient selector (select existing vs. quick create new) and registers appointments instantly via Server Actions.
*   `NewPatientModal`: Floating dialog to quickly register a new patient (name, WhatsApp phone, optional email, notes).
*   `AppointmentsClient` / `PatientsClient`: Fully interactive panels supporting client-side filtering (by status: scheduled, confirmed, cancelled) and instant query searches optimized with `useTransition` to prevent input latency.
*   `SettingsClient` & `BillingPage`: Forms to customize doctor profiles and manage Stripe/mock billing upgrades.

---

### Completed Implementation Steps
1.  **Created DB Schema migrations** in `supabase/migrations/002_add_superadmin.sql` to define the superadmin flag, whitelist, and audit tables.
2.  **Implemented core server actions** in `app/actions.ts` for patients and appointments (colliding slots validation, working hours restriction, inline registration).
3.  **Wrote superadmin actions** in `app/actions/superadmin.ts` and authorization helper `checkIsSuperadmin()` in `lib/utils/superadmin.ts`.
4.  **Created secret admin login view** (`app/(auth)/micro/page.tsx` and `app/(auth)/micro/actions.ts`) to handle passwordless sign-ins for authorized emails.
5.  **Designed and coded Superadmin Dashboard Console** (`app/(dashboard)/dashboard/superadmin/page.tsx` and `SuperadminClient.tsx`) with full account control tools.
6.  **Developed interactive Dialog modals** `NewAppointmentModal.tsx` and `NewPatientModal.tsx` for manual clinic scheduling.
7.  **Connected frontend layout and page views** (Appointments, Patients search with `useTransition`, Settings tone form, and Billing subscription triggers).
8.  **Fixed compilation bugs:** Added missing `cn` utility imports in `AppointmentsClient.tsx` and fixed out-of-scope variable references to `patient` during inline creation in `createAppointment` action.
9.  **Added mock payment support** to `app/(dashboard)/dashboard/billing/page.tsx` so users can test plan upgrades during development without Stripe configuration.
10. **Configured build optimizations:** Marked pages utilizing cookies as `force-dynamic` to prevent static page pre-rendering warnings.
11. **Verified build compilation successfully** via `npm run build`.
12. **Implemented PostgreSQL trigger (`004_block_collision_trigger.sql`)** to prevent appointments from overlapping with `blocked_slots` directly at the database layer. This protects against automated integrations (such as n8n workflows) writing directly to the database.
13. **Created a database-wide rebuild script (`005_rebuild_schema.sql`)** to allow users to completely clean and rebuild their Supabase tables, restoring user profiles from `auth.users` automatically. This resolves schema mismatches (e.g. `phone_number` vs `phone_whatsapp` column mismatch) caused by pre-existing tables.

---

## Current Plan: Fix Meta Webhook Verification Error

### Goal
Resolve the Meta webhook verification error ("No se ha podido validar la URL de devolución de llamada ni el identificador de verificación") by handling Meta's GET handshake request in the n8n `senzio-workflow.json` workflow.

### Proposed Changes
1. **[MODIFY] [senzio-workflow.json](file:///Users/adrianmendoza/Documents/ASISTENTEMEDICO/assistwarrior/n8n/senzio-workflow.json)**
   - Add a new Webhook node `WhatsApp Webhook (Verification)` listening to `GET` requests on path `whatsapp-webhook`.
   - Configure the GET Webhook node to use `responseMode: "responseNode"`.
   - Add an IF node `Is Token Valid?` that checks if the `hub.verify_token` in the query parameters is exactly `senzio_token`.
   - Add a Respond to Webhook node `Respond with Challenge` connected to the `true` output of the IF node. Set it to respond with plain text and return `hub.challenge`.
   - Add a Respond to Webhook node `Respond with Forbidden` connected to the `false` output of the IF node. Set it to respond with a `403 Forbidden` status.

### Verification Plan
- The user will import the updated `senzio-workflow.json` to their n8n instance.
- The user will test the webhook validation in the Meta dashboard, verifying that it now correctly handshakes and saves the webhook URL.
