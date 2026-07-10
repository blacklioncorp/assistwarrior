// lib/utils/terminology.ts

export type BusinessConfig = {
  appointment_label?: string;
  client_label?: string;
  requires_google_calendar?: boolean;
  requires_delivery?: boolean;
  custom_fields?: Array<{
    name: string;
    type: string;
    description: string;
  }>;
};

export const DEFAULT_CONFIG: BusinessConfig = {
  appointment_label: "Cita",
  client_label: "Paciente",
  requires_google_calendar: true,
  requires_delivery: false,
  custom_fields: []
};

type TerminologyKey = 'appointment' | 'appointments' | 'client' | 'clients' | 'new_appointment' | 'new_client';

export function getTerm(config: BusinessConfig | null | undefined, key: TerminologyKey): string {
  const safeConfig = { ...DEFAULT_CONFIG, ...config };
  const apptLabel = safeConfig.appointment_label || "Cita";
  const clientLabel = safeConfig.client_label || "Paciente";
  
  switch (key) {
    case 'appointment':
      return apptLabel;
    case 'appointments':
      return `${apptLabel}s`;
    case 'client':
      return clientLabel;
    case 'clients':
      return `${clientLabel}s`;
    case 'new_appointment':
      return `Nuev${apptLabel.endsWith('a') ? 'a' : 'o'} ${apptLabel}`;
    case 'new_client':
      return `Nuev${clientLabel.endsWith('a') ? 'a' : 'o'} ${clientLabel}`;
    default:
      return key;
  }
}
