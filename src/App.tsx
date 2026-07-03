import React from 'react';
import { useAppState } from './lib/useAppContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Agenda from './components/Agenda';
import ClientesCRM from './components/ClientesCRM';
import Inventario from './components/Inventario';
import AIExplorer from './components/AIExplorer';
import Configuracion from './components/Configuracion';
import PublicBooking from './components/PublicBooking';
import { Scissors, Sparkles, AlertCircle, Laptop } from 'lucide-react';

export default function App() {
  const state = useAppState();
  const { 
    currentView, 
    setCurrentView, 
    role, 
    setRole, 
    loading, 
    config 
  } = state;

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="font-display text-2xl text-gold tracking-widest animate-pulse">CARGANDO CORTESMART...</p>
        <p className="text-xs text-gray-500 font-mono">Sincronizando base de datos en la nube</p>
      </div>
    );
  }

  // Determine if we should show full-screen public view (for client booking experience simulation)
  const isFullScreenBooking = currentView === 'public_booking_fullscreen';

  if (isFullScreenBooking) {
    return (
      <div className="min-h-screen bg-bg-dark p-4 md:p-8 text-gray-200">
        {/* Mock Top bar to return to Admin */}
        <div className="max-w-xl mx-auto mb-6 bg-surface-light border border-surface-border p-3 rounded-xl flex justify-between items-center text-xs">
          <span className="text-gray-400 font-semibold flex items-center gap-1">
            <Laptop className="w-4 h-4 text-gold" /> Simulación de Vista Pública (Cliente)
          </span>
          <button 
            onClick={() => setCurrentView('public_booking')}
            className="px-3 py-1 bg-gold text-black font-bold rounded-lg hover:bg-gold-light uppercase tracking-wider"
          >
            Volver a Suite Administración
          </button>
        </div>
        <PublicBooking state={state} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark text-gray-200 flex">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        role={role} 
        setRole={setRole}
        barbershopName={config.name}
      />

      {/* Main Container */}
      <main className="flex-1 ml-[280px] p-8 min-h-screen overflow-y-auto">
        {/* Multi-role context warning alert banner in admin mode */}
        {role === 'client' && currentView !== 'public_booking' && (
          <div className="mb-6 p-4 bg-gold/10 border-l-4 border-gold rounded-xl flex items-center justify-between text-xs text-gray-300">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold animate-bounce" />
              Estás simulando la experiencia de un <strong>Cliente</strong>. Tienes acceso al portal de escáner facial y sistema de reservas en línea.
            </span>
            <button 
              onClick={() => {
                setRole('owner');
                setCurrentView('dashboard');
              }}
              className="text-gold font-bold hover:underline uppercase tracking-wider text-[10px]"
            >
              Cambiar a Dueño
            </button>
          </div>
        )}

        {role === 'barber' && (
          <div className="mb-6 p-4 bg-blue-500/10 border-l-4 border-blue-400 rounded-xl flex items-center justify-between text-xs text-gray-300">
            <span className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-blue-400" />
              Sesión iniciada como <strong>Barbero</strong>. Administra tu agenda de hoy y consulta las fichas y fórmulas de tus clientes.
            </span>
            <button 
              onClick={() => {
                setRole('owner');
                setCurrentView('dashboard');
              }}
              className="text-blue-400 font-bold hover:underline uppercase tracking-wider text-[10px]"
            >
              Cambiar a Dueño
            </button>
          </div>
        )}

        {/* Primary View Router */}
        {currentView === 'dashboard' && role === 'owner' && <Dashboard state={state} />}
        {currentView === 'agenda' && <Agenda state={state} />}
        {currentView === 'clientes' && <ClientesCRM state={state} />}
        {currentView === 'inventario' && role === 'owner' && <Inventario state={state} />}
        {currentView === 'ai_explorer' && <AIExplorer state={state} />}
        {currentView === 'config' && role === 'owner' && <Configuracion state={state} />}
        
        {currentView === 'public_booking' && (
          <div className="space-y-6">
            <div className="bg-surface-light p-6 rounded-2xl border border-surface-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-display text-2xl text-white">PORTAL DE CLIENTES (PUBLIC LINK)</h3>
                <p className="text-gray-400 text-sm mt-1">Este es el portal público que tus clientes abren para programar sus citas.</p>
              </div>
              <button 
                onClick={() => setCurrentView('public_booking_fullscreen')}
                className="py-2.5 px-5 bg-gold hover:bg-gold-light text-black font-bold text-xs rounded-xl uppercase tracking-wider gold-glow transition-all"
              >
                Abrir Portal en Pantalla Completa
              </button>
            </div>
            <PublicBooking state={state} />
          </div>
        )}
      </main>
    </div>
  );
}
