import type { FirebaseTimestamp } from './api';

export interface Service {
  id: string;
  nombre: string;
  descripcion: string;
  detalles: string;
  tiempo: string;
  precio: string;
  incluye: string[];
  userId: string;
  userEmail: string;
  createdAt: FirebaseTimestamp;
  updatedAt: FirebaseTimestamp;
  status: string;
}
