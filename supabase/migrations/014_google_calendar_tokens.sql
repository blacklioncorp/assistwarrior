-- 014_google_calendar_tokens.sql

-- Tabla para guardar el refresh token de Google Calendar de cada profesional
CREATE TABLE public.google_tokens (
    professional_id UUID PRIMARY KEY REFERENCES public.professionals(id) ON DELETE CASCADE,
    refresh_token TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.google_tokens ENABLE ROW LEVEL SECURITY;

-- Política de RLS: Un profesional solo puede leer y modificar su propio token.
-- Sin embargo, los administradores (Service Role) o funciones del backend 
-- pueden acceder a todo usando el service_role key.
CREATE POLICY "Professionals can view their own google token"
    ON public.google_tokens FOR SELECT
    USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can insert their own google token"
    ON public.google_tokens FOR INSERT
    WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Professionals can update their own google token"
    ON public.google_tokens FOR UPDATE
    USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can delete their own google token"
    ON public.google_tokens FOR DELETE
    USING (auth.uid() = professional_id);
