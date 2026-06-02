-- Tabla de bloqueos de horario
CREATE TABLE IF NOT EXISTS public.blocked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_all_day BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para búsqueda eficiente de solapamientos
CREATE INDEX IF NOT EXISTS idx_blocked_slots_professional 
  ON public.blocked_slots(professional_id, starts_at, ends_at);

-- Políticas RLS
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profesionales gestionan sus propios bloqueos"
  ON public.blocked_slots 
  FOR ALL 
  USING (auth.uid() = professional_id)
  WITH CHECK (auth.uid() = professional_id);
