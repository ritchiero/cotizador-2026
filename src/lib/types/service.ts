import type { FirebaseTimestamp } from './api';

export interface Service {
  id: string;
  nombre: string;
  descripcion: string;
  detalles: string;
  tiempo: string;
  precio: string;
  moneda?: 'MXN' | 'USD'; // Opcional para compatibilidad con servicios existentes
  incluye: string[];
  userId: string;
  userEmail: string;
  createdAt: FirebaseTimestamp;
  updatedAt: FirebaseTimestamp;
  status: string;
}
