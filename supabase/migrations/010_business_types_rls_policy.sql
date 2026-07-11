-- Migración 010: Políticas RLS para business_types

-- Habilitar lectura pública (anon/authenticated) para el catálogo de tipos de negocio
CREATE POLICY "Allow public read access to business_types" 
ON public.business_types 
FOR SELECT 
TO public
USING (true);
