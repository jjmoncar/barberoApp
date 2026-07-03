import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  PackageSearch, 
  Sparkles, 
  Settings, 
  Scissors, 
  UserSquare2, 
  LogOut,
  ExternalLink
} from 'lucide-react';
import { UserRole } from '../lib/useAppContext';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  barbershopName: string;
}

export default function Sidebar({ 
  currentView, 
  setCurrentView, 
  role, 
  setRole, 
  barbershopName 
}: SidebarProps) {

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Panel de Control', 
      icon: LayoutDashboard, 
      allowed: ['owner'] 
    },
    { 
      id: 'agenda', 
      label: 'Agenda Semanal', 
      icon: CalendarDays, 
      allowed: ['owner', 'barber'] 
    },
    { 
      id: 'clientes', 
      label: 'Fichas de Clientes', 
      icon: Users, 
      allowed: ['owner', 'barber'] 
    },
    { 
      id: 'inventario', 
      label: 'Inventario de Stock', 
      icon: PackageSearch, 
      allowed: ['owner'] 
    },
    { 
      id: 'ai_explorer', 
      label: 'Escáner Facial IA', 
      icon: Sparkles, 
      allowed: ['owner', 'barber', 'client'] 
    },
    { 
      id: 'config', 
      label: 'Ajustes de Negocio', 
      icon: Settings, 
      allowed: ['owner'] 
    },
    { 
      id: 'public_booking', 
      label: 'Página de Reservas', 
      icon: ExternalLink, 
      allowed: ['owner', 'barber', 'client'] 
    }
  ];

  const filteredNavItems = navItems.filter(item => item.allowed.includes(role));

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] bg-surface-dark border-r border-surface-border flex flex-col p-6 z-40">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gold/10 border border-gold/30 rounded-xl flex items-center justify-center">
          <Scissors className="text-gold w-5 h-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl tracking-wide text-gold">CorteSmart</h1>
          <p className="text-xs text-gray-400 font-mono tracking-wider">MANAGEMENT SUITE</p>
        </div>
      </div>

      {/* Role Switcher Selector */}
      <div className="mb-6 p-3 bg-surface-light rounded-xl border border-surface-border">
        <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">
          Rol de Acceso Activo:
        </label>
        <div className="grid grid-cols-3 gap-1">
          <button 
            onClick={() => {
              setRole('owner');
              setCurrentView('dashboard');
            }}
            className={`text-[10px] py-1 px-1 rounded font-bold transition-all ${
              role === 'owner' 
                ? 'bg-gold text-black' 
                : 'text-gray-300 hover:bg-white/5'
            }`}
          >
            Dueño
          </button>
          <button 
            onClick={() => {
              setRole('barber');
              setCurrentView('agenda');
            }}
            className={`text-[10px] py-1 px-1 rounded font-bold transition-all ${
              role === 'barber' 
                ? 'bg-gold text-black' 
                : 'text-gray-300 hover:bg-white/5'
            }`}
          >
            Barbero
          </button>
          <button 
            onClick={() => {
              setRole('client');
              setCurrentView('ai_explorer');
            }}
            className={`text-[10px] py-1 px-1 rounded font-bold transition-all ${
              role === 'client' 
                ? 'bg-gold text-black' 
                : 'text-gray-300 hover:bg-white/5'
            }`}
          >
            Cliente
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 flex flex-col gap-2">
        {filteredNavItems.map(item => {
          const IconComponent = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all text-left ${
                isActive 
                  ? 'bg-gold text-black font-semibold gold-glow' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <IconComponent className={`w-5 h-5 ${isActive ? 'text-black' : 'text-gold'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Details */}
      <div className="mt-auto border-t border-surface-border pt-4">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center font-display text-gold">
            {role === 'owner' ? 'O' : role === 'barber' ? 'B' : 'C'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">
              {role === 'owner' ? 'Propietario VIP' : role === 'barber' ? 'Barbero Master' : 'Cliente Registrado'}
            </p>
            <p className="text-[10px] text-gray-400 font-mono">
              {role === 'owner' ? 'jjmoncar@gmail.com' : role === 'barber' ? 'Barbero #1' : 'CorteSmart App'}
            </p>
          </div>
        </div>

        <button 
          onClick={() => alert("Sesión finalizada. En un ambiente real, esto borraría la cookie de autenticación.")}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
export type SidebarPropsType = SidebarProps;
export type SidebarType = React.ComponentType<SidebarProps>;
export const SidebarComponent = Sidebar;
