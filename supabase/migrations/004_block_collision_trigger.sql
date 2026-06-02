-- Migration: Add database trigger to prevent appointments from overlapping with blocked slots
-- This protects against direct database inserts/updates (e.g. from n8n or external API integrations)

CREATE OR REPLACE FUNCTION public.check_appointment_blocked_slots_collision()
RETURNS TRIGGER AS $$
BEGIN
  -- We only perform the check for active appointments (not cancelled or completed/no_show in typical flows)
  -- The check queries blocked_slots for the same professional where times overlap
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

-- Create the trigger on the appointments table
CREATE OR REPLACE TRIGGER trigger_check_appointment_blocked_slots_collision
BEFORE INSERT OR UPDATE OF starts_at, ends_at, status ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.check_appointment_blocked_slots_collision();
