import type { FirebaseTimestamp } from './api';

export interface PaymentMethod {
  id: string;
  type: string;
  details: Record<string, string | number | boolean>; // Object with string keys and primitive values
  isDefault: boolean;
  isActive?: boolean;
  createdAt: FirebaseTimestamp;
  updatedAt: FirebaseTimestamp;
}
