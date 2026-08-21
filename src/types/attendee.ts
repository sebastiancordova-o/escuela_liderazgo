export interface Attendee {
  rowIndex: number;
  timestamp?: string;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  rut: string;
  rutClean: string;
  fechaNacimiento?: string;
  telefono?: string;
  tipoAsistente: string;
  organizacion?: string;
  email: string;
  pastorRed?: string;
  pago?: string; // Original payment status / amount
  precioPagado?: number | string; // Corrected payment amount for table 2026
  plataforma?: string; // Corrected platform (GLS, Transferencia, etc.)
  asistencia?: string;
  asistio: boolean;
  acreditadoAt?: string;
}

export interface StatsData {
  total: number;
  acreditados: number;
  pendientes: number;
  porcentaje: number;
  totalRecaudado: number;
  porTipo: Record<string, { total: number; acreditados: number }>;
}

export interface Table2026Response {
  success: boolean;
  source: 'google_sheets' | 'local_excel';
  data: Attendee[];
  total: number;
  totalAsistieron: number;
  totalRecaudado: number;
}
