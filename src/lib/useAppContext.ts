import { useState, useEffect } from 'react';
import { dbService } from './db-utils';
import { 
  BarbershopConfig, 
  Client, 
  Product, 
  Appointment, 
  VisitRecord, 
  Expense 
} from '../types';

export type UserRole = 'owner' | 'barber' | 'client';

export function useAppState() {
  const [role, setRole] = useState<UserRole>('owner');
  const [currentView, setCurrentView] = useState<string>('dashboard'); // 'dashboard', 'agenda', 'clientes', 'inventario', 'ai_explorer', 'config', 'public_booking'
  const [loading, setLoading] = useState<boolean>(true);
  
  // State variables
  const [config, setConfig] = useState<BarbershopConfig | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [visitRecords, setVisitRecords] = useState<VisitRecord[]>([]);

  // Selected state for client view detail
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [loadedConfig, loadedClients, loadedProducts, loadedAppointments, loadedExpenses, loadedVisitRecords] = await Promise.all([
          dbService.getConfig(),
          dbService.getClients(),
          dbService.getProducts(),
          dbService.getAppointments(),
          dbService.getExpenses(),
          dbService.getVisitRecords()
        ]);

        setConfig(loadedConfig);
        setClients(loadedClients);
        setProducts(loadedProducts);
        setAppointments(loadedAppointments);
        setExpenses(loadedExpenses);
        setVisitRecords(loadedVisitRecords);
      } catch (e) {
        console.error("Error loading initial data", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const refreshClients = async () => {
    const data = await dbService.getClients();
    setClients(data);
  };

  const refreshProducts = async () => {
    const data = await dbService.getProducts();
    setProducts(data);
  };

  const refreshAppointments = async () => {
    const data = await dbService.getAppointments();
    setAppointments(data);
  };

  const refreshExpenses = async () => {
    const data = await dbService.getExpenses();
    setExpenses(data);
  };

  const refreshVisitRecords = async () => {
    const data = await dbService.getVisitRecords();
    setVisitRecords(data);
  };

  // State actions
  const saveConfig = async (updated: BarbershopConfig) => {
    await dbService.saveConfig(updated);
    setConfig(updated);
  };

  const saveClient = async (client: Client) => {
    await dbService.saveClient(client);
    await refreshClients();
  };

  const saveProduct = async (product: Product) => {
    await dbService.saveProduct(product);
    await refreshProducts();
  };

  const saveAppointment = async (appt: Appointment) => {
    await dbService.saveAppointment(appt);
    await refreshAppointments();
  };

  const deleteAppointment = async (id: string) => {
    await dbService.deleteAppointment(id);
    await refreshAppointments();
  };

  const saveExpense = async (exp: Expense) => {
    await dbService.saveExpense(exp);
    await refreshExpenses();
  };

  const addVisitRecord = async (record: VisitRecord) => {
    await dbService.saveVisitRecord(record);
    
    // Increment visit count & points for client
    const client = clients.find(c => c.id === record.clientId);
    if (client) {
      const pointsEarned = Math.floor(record.price * 0.10); // 10% cash back in points
      const updatedClient: Client = {
        ...client,
        visitsCount: client.visitsCount + 1,
        points: client.points + pointsEarned,
        tier: (client.visitsCount + 1 >= 10) ? 'VIP' : (client.visitsCount + 1 >= 4) ? 'Frecuente' : 'Nuevo'
      };
      await saveClient(updatedClient);
    }

    await refreshVisitRecords();
    await refreshProducts(); // Products stock got reduced!
  };

  return {
    role,
    setRole,
    currentView,
    setCurrentView,
    loading,
    config,
    saveConfig,
    clients,
    saveClient,
    products,
    saveProduct,
    appointments,
    saveAppointment,
    deleteAppointment,
    expenses,
    saveExpense,
    visitRecords,
    addVisitRecord,
    selectedClientId,
    setSelectedClientId
  };
}
export type AppState = ReturnType<typeof useAppState>;
export type useAppState = ReturnType<typeof useAppState>;
