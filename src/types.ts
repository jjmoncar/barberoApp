export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  category: string;
}

export interface Barber {
  id: string;
  name: string;
  photo: string;
  specialty: string;
  yearsOfExperience: number;
}

export interface WorkingHour {
  day: string; // "Lunes", "Martes", etc.
  enabled: boolean;
  open: string; // "09:00"
  close: string; // "19:00"
}

export interface BarbershopConfig {
  name: string;
  address: string;
  phone: string;
  logo: string;
  workingHours: WorkingHour[];
  services: Service[];
  barbers: Barber[];
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  points: number;
  tier: 'Nuevo' | 'Frecuente' | 'VIP';
  tags: string[];
  visitsCount: number;
  lastAnalysisDate?: string;
}

export interface FaceAnalysis {
  faceShape: string; // "Ovalado", "Redondo", etc.
  hairLine: string; // "Alta", "Media", etc.
  hairTexture: string; // "Ondulado", "Liso", etc.
  prominentFeatures: string[];
  recommendations: RecommendedStyle[];
}

export interface RecommendedStyle {
  name: string;
  description: string;
  maintenance: 'Bajo' | 'Medio' | 'Alto';
  compatibility: number; // 0-100
  explanation: string;
  imageAlt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  cost: number;
  price: number;
  provider: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  serviceId: string;
  serviceName: string;
  price: number;
  duration: number;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM
  barberId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  walkIn?: boolean;
}

export interface VisitRecord {
  id: string;
  clientId: string;
  date: string;
  barberId: string;
  barberName: string;
  serviceName: string;
  price: number;
  imageOfCut?: string;
  productsUsed: { productId: string; name: string; qty: number }[];
  machineSettings?: string; // e.g. "Guarda #2, fade bajo"
  notes?: string;
  rating?: number;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
}
