CREATE TABLE IF NOT EXISTS pricing_plans (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre        TEXT NOT NULL,
  precio_mxn    NUMERIC(10,2),
  descripcion   TEXT,
  es_popular    BOOL DEFAULT FALSE,
  es_contacto   BOOL DEFAULT FALSE,
  orden         INT DEFAULT 0,
  features      JSONB,
  activo        BOOL DEFAULT TRUE,
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Datos iniciales
INSERT INTO pricing_plans (nombre, precio_mxn, descripcion, es_popular, es_contacto, orden, features) VALUES
(
  'Básico', 799,
  'Para negocios que comienzan a automatizar su atención',
  false, false, 1,
  '["1 número de WhatsApp","Hasta 200 conversaciones/mes","1 vertical de negocio","Agendamiento automático","Soporte por email"]'
),
(
  'Pro', 1499,
  'Para negocios con mayor volumen y múltiples verticales',
  true, false, 2,
  '["2 números de WhatsApp","Hasta 600 conversaciones/mes","Hasta 3 verticales","Agendamiento + pedidos","Panel de métricas","Soporte prioritario"]'
),
(
  'Enterprise', null,
  'Para cadenas, franquicias y equipos con necesidades específicas',
  false, true, 3,
  '["Números ilimitados","Conversaciones ilimitadas","Verticales ilimitadas","Integraciones a la medida","SLA garantizado","Gerente de cuenta dedicado"]'
);
