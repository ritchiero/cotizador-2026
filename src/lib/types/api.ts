import { Timestamp } from 'firebase/firestore';

// Tipo para timestamps de Firebase
export type FirebaseTimestamp = Timestamp | Date | null;

// Tipos para suggest-pricing API
export interface PricingSuggestionRequest {
  nombre: string;
  descripcion: string;
  detalles: string;
  tiempo?: string;
  incluye: string[];
  userId: string;
}

export interface PricingSuggestionResponse {
  modeloCobro: 'FLAT_FEE' | 'HOURLY' | 'MIXTO';
  rangoSugerido: {
    minimo: number;
    promedio: number;
    maximo: number;
  };
  complejidad: 'bajo' | 'medio' | 'alto';
  horasEstimadas: {
    minimo: number;
    maximo: number;
  };
  tarifaHorariaUsada: number;
  justificacion: string;
  factoresAnalizados: string[];
  confianza: number;
}
