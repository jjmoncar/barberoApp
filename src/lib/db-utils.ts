import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  getDoc,
  getDocFromServer
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  BarbershopConfig, 
  Client, 
  Product, 
  Appointment, 
  VisitRecord, 
  Expense,
  Service,
  Barber
} from '../types';

// Default / Seed Data
export const DEFAULT_CONFIG: BarbershopConfig = {
  name: "CorteSmart Luxury Barbershop",
  address: "Av. de la Reforma 450, Ciudad de México, CDMX",
  phone: "+52 55 1234 5678",
  logo: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=200",
  workingHours: [
    { day: "Lunes", enabled: true, open: "09:00", close: "19:00" },
    { day: "Martes", enabled: true, open: "09:00", close: "19:00" },
    { day: "Miércoles", enabled: true, open: "09:00", close: "19:00" },
    { day: "Jueves", enabled: true, open: "09:00", close: "20:00" },
    { day: "Viernes", enabled: true, open: "09:00", close: "21:00" },
    { day: "Sábado", enabled: true, open: "09:00", close: "21:00" },
    { day: "Domingo", enabled: false, open: "10:00", close: "16:00" },
  ],
  services: [
    { id: "s1", name: "Corte de Cabello Premium", price: 250, duration: 45, category: "Corte" },
    { id: "s2", name: "Marcado y Ritual de Barba", price: 180, duration: 30, category: "Barba" },
    { id: "s3", name: "Combo Corte + Barba", price: 380, duration: 60, category: "Combos" },
    { id: "s4", name: "Tratamiento Exfoliante AI", price: 200, duration: 45, category: "Facial" },
    { id: "s5", name: "Afeitado Tradicional Navaja", price: 150, duration: 30, category: "Barba" },
  ],
  barbers: [
    { id: "b1", name: "Alex Rivera", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150", specialty: "Fades & Degradados", yearsOfExperience: 5 },
    { id: "b2", name: "Mateo Costa", photo: "https://images.unsplash.com/photo-1621574539437-4b7cb63120b8?auto=format&fit=crop&q=80&w=150", specialty: "Corte Clásico & Tijera", yearsOfExperience: 8 },
    { id: "b3", name: "Sofía Luna", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150", specialty: "Barbas, Rituales & Color", yearsOfExperience: 4 },
    { id: "b4", name: "Carlos Vera", photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150", specialty: "Hair Tattoo & Diseños", yearsOfExperience: 6 },
  ]
};

export const DEFAULT_PRODUCTS: Product[] = [
  { id: "p1", name: "Cera Premium Mate", category: "Estilizado", stock: 15, minStock: 5, cost: 120, price: 220, provider: "BarberPro" },
  { id: "p2", name: "Óleo para Barba 'Noir'", category: "Hidratación", stock: 12, minStock: 4, cost: 150, price: 280, provider: "NourishMen" },
  { id: "p3", name: "Shampoo Anticaída AI", category: "Cuidado", stock: 2, minStock: 5, cost: 180, price: 350, provider: "LabBio" },
  { id: "p4", name: "Aftershave de Mentol", category: "Acabado", stock: 1, minStock: 3, cost: 90, price: 180, provider: "CoolCut" },
];

export const DEFAULT_CLIENTS: Client[] = [
  { id: "c1", name: "Julian Casablancas", phone: "5512345678", email: "julian@strokes.com", points: 2450, tier: "VIP", tags: ["VIP", "Frecuente"], visitsCount: 15 },
  { id: "c2", name: "Andrés Bello", phone: "5543210987", email: "andres@bello.cl", points: 800, tier: "Frecuente", tags: ["Frecuente"], visitsCount: 5 },
  { id: "c3", name: "Julián Pérez", phone: "5588776655", email: "julian.perez@example.com", points: 150, tier: "Nuevo", tags: ["Nuevo"], visitsCount: 1 },
  { id: "c4", name: "Roberto G.", phone: "5599001122", email: "roberto@gmail.com", points: 350, tier: "Nuevo", tags: ["Recomendado AI"], visitsCount: 2 }
];

export const DEFAULT_APPOINTMENTS: Appointment[] = [
  {
    id: "a_1",
    clientId: "c3",
    clientName: "Julián Pérez",
    clientPhone: "5588776655",
    serviceId: "s1",
    serviceName: "Corte de Cabello Premium",
    price: 250,
    duration: 45,
    date: new Date().toISOString().split('T')[0],
    timeSlot: "10:30",
    barberId: "b4",
    status: "confirmed"
  },
  {
    id: "a_2",
    clientId: "c2",
    clientName: "Andrés Bello",
    clientPhone: "5543210987",
    serviceId: "s3",
    serviceName: "Combo Corte + Barba",
    price: 380,
    duration: 60,
    date: new Date().toISOString().split('T')[0],
    timeSlot: "11:15",
    barberId: "b2",
    status: "confirmed"
  },
  {
    id: "a_3",
    clientId: "c4",
    clientName: "Roberto G.",
    clientPhone: "5599001122",
    serviceId: "s2",
    serviceName: "Marcado y Ritual de Barba",
    price: 180,
    duration: 30,
    date: new Date().toISOString().split('T')[0],
    timeSlot: "12:00",
    barberId: "b4",
    status: "pending"
  }
];

export const DEFAULT_EXPENSES: Expense[] = [
  { id: "e1", date: "2026-06-25", description: "Renta de Local Comercial", category: "Renta", amount: 12000 },
  { id: "e2", date: "2026-06-28", description: "Factura de Luz - Aire Acondicionado", category: "Servicios", amount: 2200 },
  { id: "e3", date: "2026-07-01", description: "Compra de Toallas de Algodón x10", category: "Equipamiento", amount: 1500 },
  { id: "e4", date: "2026-07-02", description: "Suministro de Tónicos y Talco", category: "Insumos", amount: 1800 }
];

// Helper to write data to LocalStorage if Firestore is failing or rules are not set
class StorageService {
  private isFirebaseWorking = false;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const docRef = doc(db, 'config', 'barbershop');
        
        // Use getDocFromServer to verify server connectivity directly
        const fetchPromise = getDocFromServer(docRef);
        
        // Timeout after 1500ms to avoid blocking
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Timeout establishing Firestore connection")), 1500)
        );

        await Promise.race([fetchPromise, timeoutPromise]);
        this.isFirebaseWorking = true;
        console.log("🔥 Firestore initialized and connected successfully!");
      } catch (e) {
        console.warn("⚠️ Firestore not available (offline, rules, or unconfigured). Falling back to LocalStorage.", e);
        this.isFirebaseWorking = false;
      }
    })();

    return this.initPromise;
  }

  // Config
  async getConfig(): Promise<BarbershopConfig> {
    await this.init();
    if (this.isFirebaseWorking) {
      try {
        const docSnap = await getDoc(doc(db, 'config', 'barbershop'));
        if (docSnap.exists()) {
          return docSnap.data() as BarbershopConfig;
        } else {
          // Seed it
          await setDoc(doc(db, 'config', 'barbershop'), DEFAULT_CONFIG);
          return DEFAULT_CONFIG;
        }
      } catch (e) {
        console.error("Firestore getConfig failed, trying LocalStorage", e);
      }
    }
    const local = localStorage.getItem('cs_config');
    if (local) return JSON.parse(local);
    localStorage.setItem('cs_config', JSON.stringify(DEFAULT_CONFIG));
    return DEFAULT_CONFIG;
  }

  async saveConfig(config: BarbershopConfig): Promise<void> {
    await this.init();
    if (this.isFirebaseWorking) {
      try {
        await setDoc(doc(db, 'config', 'barbershop'), config);
        return;
      } catch (e) {
        console.error("Firestore saveConfig failed", e);
      }
    }
    localStorage.setItem('cs_config', JSON.stringify(config));
  }

  // Clients
  async getClients(): Promise<Client[]> {
    await this.init();
    if (this.isFirebaseWorking) {
      try {
        const querySnapshot = await getDocs(collection(db, 'clients'));
        if (querySnapshot.empty) {
          // Seed clients
          for (const client of DEFAULT_CLIENTS) {
            await setDoc(doc(db, 'clients', client.id), client);
          }
          return DEFAULT_CLIENTS;
        }
        return querySnapshot.docs.map(doc => doc.data() as Client);
      } catch (e) {
        console.error("Firestore getClients failed", e);
      }
    }
    const local = localStorage.getItem('cs_clients');
    if (local) return JSON.parse(local);
    localStorage.setItem('cs_clients', JSON.stringify(DEFAULT_CLIENTS));
    return DEFAULT_CLIENTS;
  }

  async saveClient(client: Client): Promise<void> {
    await this.init();
    if (this.isFirebaseWorking) {
      try {
        await setDoc(doc(db, 'clients', client.id), client);
        return;
      } catch (e) {
        console.error("Firestore saveClient failed", e);
      }
    }
    const clients = await this.getClients();
    const idx = clients.findIndex(c => c.id === client.id);
    if (idx >= 0) clients[idx] = client;
    else clients.push(client);
    localStorage.setItem('cs_clients', JSON.stringify(clients));
  }

  // Products
  async getProducts(): Promise<Product[]> {
    await this.init();
    if (this.isFirebaseWorking) {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        if (querySnapshot.empty) {
          for (const product of DEFAULT_PRODUCTS) {
            await setDoc(doc(db, 'products', product.id), product);
          }
          return DEFAULT_PRODUCTS;
        }
        return querySnapshot.docs.map(doc => doc.data() as Product);
      } catch (e) {
        console.error("Firestore getProducts failed", e);
      }
    }
    const local = localStorage.getItem('cs_products');
    if (local) return JSON.parse(local);
    localStorage.setItem('cs_products', JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }

  async saveProduct(product: Product): Promise<void> {
    await this.init();
    if (this.isFirebaseWorking) {
      try {
        await setDoc(doc(db, 'products', product.id), product);
        return;
      } catch (e) {
        console.error("Firestore saveProduct failed", e);
      }
    }
    const products = await this.getProducts();
    const idx = products.findIndex(p => p.id === product.id);
    if (idx >= 0) products[idx] = product;
    else products.push(product);
    localStorage.setItem('cs_products', JSON.stringify(products));
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    await this.init();
    if (this.isFirebaseWorking) {
      try {
        const querySnapshot = await getDocs(collection(db, 'appointments'));
        if (querySnapshot.empty) {
          for (const appt of DEFAULT_APPOINTMENTS) {
            await setDoc(doc(db, 'appointments', appt.id), appt);
          }
          return DEFAULT_APPOINTMENTS;
        }
        return querySnapshot.docs.map(doc => doc.data() as Appointment);
      } catch (e) {
        console.error("Firestore getAppointments failed", e);
      }
    }
    const local = localStorage.getItem('cs_appointments');
    if (local) return JSON.parse(local);
    localStorage.setItem('cs_appointments', JSON.stringify(DEFAULT_APPOINTMENTS));
    return DEFAULT_APPOINTMENTS;
  }

  async saveAppointment(appt: Appointment): Promise<void> {
    await this.init();
    if (this.isFirebaseWorking) {
      try {
        await setDoc(doc(db, 'appointments', appt.id), appt);
        return;
      } catch (e) {
        console.error("Firestore saveAppointment failed", e);
      }
    }
    const appts = await this.getAppointments();
    const idx = appts.findIndex(a => a.id === appt.id);
    if (idx >= 0) appts[idx] = appt;
    else appts.push(appt);
    localStorage.setItem('cs_appointments', JSON.stringify(appts));
  }

  async deleteAppointment(id: string): Promise<void> {
    await this.init();
    if (this.isFirebaseWorking) {
      try {
        await deleteDoc(doc(db, 'appointments', id));
        return;
      } catch (e) {
        console.error("Firestore deleteAppointment failed", e);
      }
    }
    const appts = await this.getAppointments();
    const updated = appts.filter(a => a.id !== id);
    localStorage.setItem('cs_appointments', JSON.stringify(updated));
  }

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    await this.init();
    if (this.isFirebaseWorking) {
      try {
        const querySnapshot = await getDocs(collection(db, 'expenses'));
        if (querySnapshot.empty) {
          for (const exp of DEFAULT_EXPENSES) {
            await setDoc(doc(db, 'expenses', exp.id), exp);
          }
          return DEFAULT_EXPENSES;
        }
        return querySnapshot.docs.map(doc => doc.data() as Expense);
      } catch (e) {
        console.error("Firestore getExpenses failed", e);
      }
    }
    const local = localStorage.getItem('cs_expenses');
    if (local) return JSON.parse(local);
    localStorage.setItem('cs_expenses', JSON.stringify(DEFAULT_EXPENSES));
    return DEFAULT_EXPENSES;
  }

  async saveExpense(exp: Expense): Promise<void> {
    await this.init();
    if (this.isFirebaseWorking) {
      try {
        await setDoc(doc(db, 'expenses', exp.id), exp);
        return;
      } catch (e) {
        console.error("Firestore saveExpense failed", e);
      }
    }
    const exps = await this.getExpenses();
    const idx = exps.findIndex(e => e.id === exp.id);
    if (idx >= 0) exps[idx] = exp;
    else exps.push(exp);
    localStorage.setItem('cs_expenses', JSON.stringify(exps));
  }

  // Visit Records (Historical notes & photo cuts)
  async getVisitRecords(clientId?: string): Promise<VisitRecord[]> {
    await this.init();
    if (this.isFirebaseWorking) {
      try {
        const querySnapshot = await getDocs(collection(db, 'visit_records'));
        const records = querySnapshot.docs.map(doc => doc.data() as VisitRecord);
        if (clientId) {
          return records.filter(r => r.clientId === clientId).sort((a,b) => b.date.localeCompare(a.date));
        }
        return records.sort((a,b) => b.date.localeCompare(a.date));
      } catch (e) {
        console.error("Firestore getVisitRecords failed", e);
      }
    }
    const local = localStorage.getItem('cs_visit_records');
    let records: VisitRecord[] = local ? JSON.parse(local) : [];
    if (!local) {
      // Seed default client records
      records = [
        {
          id: "vr_1",
          clientId: "c1",
          date: "2026-06-24",
          barberId: "b1",
          barberName: "Alex Rivera",
          serviceName: "Combo Corte + Barba",
          price: 380,
          imageOfCut: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=300",
          productsUsed: [{ productId: "p1", name: "Cera Premium Mate", qty: 1 }],
          machineSettings: "Guarda #2 en laterales, fade bajo. Marcado de barba tradicional.",
          notes: "Le gusta el fade muy bajo. Alérgico al tónico de mentol.",
          rating: 5
        },
        {
          id: "vr_2",
          clientId: "c1",
          date: "2026-05-15",
          barberId: "b1",
          barberName: "Alex Rivera",
          serviceName: "Corte de Cabello Premium",
          price: 250,
          imageOfCut: "https://images.unsplash.com/photo-1621574539437-4b7cb63120b8?auto=format&fit=crop&q=80&w=300",
          productsUsed: [],
          machineSettings: "Guarda #1.5, fade medio.",
          notes: "Prefiere peinado de lado con cera brillante.",
          rating: 4
        }
      ];
      localStorage.setItem('cs_visit_records', JSON.stringify(records));
    }
    if (clientId) {
      return records.filter(r => r.clientId === clientId).sort((a,b) => b.date.localeCompare(a.date));
    }
    return records.sort((a,b) => b.date.localeCompare(a.date));
  }

  async saveVisitRecord(record: VisitRecord): Promise<void> {
    await this.init();
    if (this.isFirebaseWorking) {
      try {
        await setDoc(doc(db, 'visit_records', record.id), record);
        // Deduct product stock in Firestore if working
        for (const p of record.productsUsed) {
          try {
            const pDoc = await getDoc(doc(db, 'products', p.productId));
            if (pDoc.exists()) {
              const currentStock = pDoc.data().stock;
              await updateDoc(doc(db, 'products', p.productId), {
                stock: Math.max(0, currentStock - p.qty)
              });
            }
          } catch (e) {
            console.error("Stock deduct failed for " + p.productId);
          }
        }
        return;
      } catch (e) {
        console.error("Firestore saveVisitRecord failed", e);
      }
    }
    const records = await this.getVisitRecords();
    records.push(record);
    localStorage.setItem('cs_visit_records', JSON.stringify(records));

    // Deduct stock locally
    const products = await this.getProducts();
    for (const prodUsed of record.productsUsed) {
      const pIdx = products.findIndex(p => p.id === prodUsed.productId);
      if (pIdx >= 0) {
        products[pIdx].stock = Math.max(0, products[pIdx].stock - prodUsed.qty);
      }
    }
    localStorage.setItem('cs_products', JSON.stringify(products));
  }
}

export const dbService = new StorageService();
dbService.init();
