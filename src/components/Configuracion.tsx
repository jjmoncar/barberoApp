import React, { useState } from 'react';
import { 
  Building2, 
  Clock, 
  Scissors, 
  UserSquare2, 
  Save, 
  Plus, 
  Trash2,
  Phone,
  MapPin,
  Camera
} from 'lucide-react';
import { AppState } from '../lib/useAppContext';
import { Service, Barber, WorkingHour } from '../types';

interface ConfiguracionProps {
  state: AppState;
}

export default function Configuracion({ state }: ConfiguracionProps) {
  const { config, saveConfig } = state;

  const [activeTab, setActiveTab] = useState<string>('general');

  // Form states for general
  const [name, setName] = useState<string>(config?.name || '');
  const [address, setAddress] = useState<string>(config?.address || '');
  const [phone, setPhone] = useState<string>(config?.phone || '');
  const [logo, setLogo] = useState<string>(config?.logo || '');

  // Form states for new service
  const [newSName, setNewSName] = useState<string>('');
  const [newSPrice, setNewSPrice] = useState<number>(200);
  const [newSDuration, setNewSDuration] = useState<number>(30);
  const [newSCategory, setNewSCategory] = useState<string>('Corte');

  // Form states for new barber
  const [newBName, setNewBName] = useState<string>('');
  const [newBSpecialty, setNewBSpecialty] = useState<string>('');
  const [newBExp, setNewBExp] = useState<number>(3);
  const [newBPhoto, setNewBPhoto] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150');

  if (!config) return null;

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...config,
      name,
      address,
      phone,
      logo
    };
    await saveConfig(updated);
    alert("💾 ¡Ajustes generales guardados correctamente en la base de datos Firestore!");
  };

  const handleToggleDay = async (dayIndex: number) => {
    const updatedHours = [...config.workingHours];
    updatedHours[dayIndex].enabled = !updatedHours[dayIndex].enabled;
    await saveConfig({ ...config, workingHours: updatedHours });
  };

  const handleHoursChange = async (dayIndex: number, field: 'open' | 'close', value: string) => {
    const updatedHours = [...config.workingHours];
    updatedHours[dayIndex][field] = value;
    await saveConfig({ ...config, workingHours: updatedHours });
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSName) return;

    const newService: Service = {
      id: "s_" + Math.random().toString(36).substr(2, 9),
      name: newSName,
      price: Number(newSPrice),
      duration: Number(newSDuration),
      category: newSCategory
    };

    const updatedServices = [...config.services, newService];
    await saveConfig({ ...config, services: updatedServices });
    
    // Reset
    setNewSName('');
    alert(`✂️ Servicio '${newSName}' añadido.`);
  };

  const handleDeleteService = async (id: string) => {
    const confirmDelete = window.confirm("¿Seguro que deseas eliminar este servicio?");
    if (!confirmDelete) return;

    const updatedServices = config.services.filter(s => s.id !== id);
    await saveConfig({ ...config, services: updatedServices });
  };

  const handleAddBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBName || !newBSpecialty) return;

    const newBarber: Barber = {
      id: "b_" + Math.random().toString(36).substr(2, 9),
      name: newBName,
      photo: newBPhoto,
      specialty: newBSpecialty,
      yearsOfExperience: Number(newBExp)
    };

    const updatedBarbers = [...config.barbers, newBarber];
    await saveConfig({ ...config, barbers: updatedBarbers });

    // Reset
    setNewBName('');
    setNewBSpecialty('');
    alert(`💈 Barbero '${newBName}' agregado al catálogo de personal.`);
  };

  const handleDeleteBarber = async (id: string) => {
    const confirmDelete = window.confirm("¿Seguro que deseas dar de baja a este barbero?");
    if (!confirmDelete) return;

    const updatedBarbers = config.barbers.filter(b => b.id !== id);
    await saveConfig({ ...config, barbers: updatedBarbers });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <span className="text-gold font-mono tracking-widest uppercase text-xs font-bold">Configuración Global</span>
        <h2 className="font-display text-4xl text-white">AJUSTES DE NEGOCIO</h2>
        <p className="text-gray-400 text-sm">Personaliza la imagen corporativa, horarios de atención, catálogo de servicios y equipo de barberos.</p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-surface-border gap-2">
        <button 
          onClick={() => setActiveTab('general')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'general' ? 'border-gold text-gold' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          General
        </button>
        <button 
          onClick={() => setActiveTab('horarios')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'horarios' ? 'border-gold text-gold' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Horarios
        </button>
        <button 
          onClick={() => setActiveTab('servicios')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'servicios' ? 'border-gold text-gold' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Servicios
        </button>
        <button 
          onClick={() => setActiveTab('barberos')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'barberos' ? 'border-gold text-gold' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Equipo de Barberos
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="bg-surface-light p-6 rounded-2xl border border-surface-border space-y-4 max-w-xl">
          <h3 className="font-display text-xl text-white flex items-center gap-2 mb-4">
            <Building2 className="text-gold w-5 h-5" /> INFORMACIÓN DE LA BARBERÍA
          </h3>

          <div>
            <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Nombre Comercial</label>
            <input 
              type="text" required
              value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Dirección Física</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <input 
                type="text" required
                value={address} onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 pl-10 pr-4 text-white text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Teléfono de Atención</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input 
                  type="text" required
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 pl-10 pr-4 text-white text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">URL del Logotipo</label>
              <input 
                type="text" required
                value={logo} onChange={(e) => setLogo(e.target.value)}
                className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 px-3 text-white text-sm focus:outline-none font-mono"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="py-2.5 px-6 bg-gold hover:bg-gold-light text-black font-bold text-xs rounded-xl uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer gold-glow transition-all"
          >
            <Save className="w-4 h-4" /> Guardar Cambios
          </button>
        </form>
      )}

      {activeTab === 'horarios' && (
        <div className="bg-surface-light p-6 rounded-2xl border border-surface-border space-y-4 max-w-xl">
          <h3 className="font-display text-xl text-white flex items-center gap-2 mb-4">
            <Clock className="text-gold w-5 h-5" /> CONFIGURAR HORARIOS COMERCIALES
          </h3>

          <div className="space-y-3">
            {config.workingHours.map((wh, idx) => (
              <div key={wh.day} className="flex items-center justify-between bg-surface-dark p-3 rounded-xl border border-surface-border gap-4">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox"
                    checked={wh.enabled}
                    onChange={() => handleToggleDay(idx)}
                    className="rounded border-gray-600 text-gold focus:ring-gold bg-surface-light w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-white w-20">{wh.day}</span>
                </div>

                {wh.enabled ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="time"
                      value={wh.open}
                      onChange={(e) => handleHoursChange(idx, 'open', e.target.value)}
                      className="bg-surface-light border border-surface-border text-white text-xs rounded-lg p-1.5 focus:outline-none"
                    />
                    <span className="text-xs text-gray-500">a</span>
                    <input 
                      type="time"
                      value={wh.close}
                      onChange={(e) => handleHoursChange(idx, 'close', e.target.value)}
                      className="bg-surface-light border border-surface-border text-white text-xs rounded-lg p-1.5 focus:outline-none"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-red-400 font-bold uppercase font-mono bg-red-500/10 px-2 py-0.5 rounded-full">CERRADO</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'servicios' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Services List */}
          <div className="bg-surface-light p-6 rounded-2xl border border-surface-border space-y-4">
            <h3 className="font-display text-xl text-white flex items-center gap-2 mb-4">
              <Scissors className="text-gold w-5 h-5" /> CATÁLOGO DE SERVICIOS ({config.services.length})
            </h3>

            <div className="space-y-3">
              {config.services.map(s => (
                <div key={s.id} className="bg-surface-dark p-3.5 rounded-xl border border-surface-border flex justify-between items-center hover:border-gold/15 transition-all">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white text-sm">{s.name}</h4>
                      <span className="bg-white/5 border border-white/10 text-gray-400 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest">{s.category}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Duración estimada: <span className="font-semibold">{s.duration} min</span></p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-gold font-bold text-sm">${s.price}</span>
                    <button 
                      onClick={() => handleDeleteService(s.id)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-black rounded-lg text-red-400 transition-all cursor-pointer"
                      title="Eliminar servicio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Service form */}
          <form onSubmit={handleAddService} className="bg-surface-light p-6 rounded-2xl border border-surface-border space-y-4 h-fit">
            <h3 className="font-display text-xl text-white flex items-center gap-2 mb-4">
              <Plus className="text-gold w-5 h-5" /> AGREGAR NUEVO SERVICIO
            </h3>

            <div>
              <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Nombre del Servicio</label>
              <input 
                type="text" required placeholder="Ej. Ritual de Toalla Caliente y Afeitado"
                value={newSName} onChange={(e) => setNewSName(e.target.value)}
                className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Precio de Venta ($)</label>
                <input 
                  type="number" required min={0}
                  value={newSPrice} onChange={(e) => setNewSPrice(Number(e.target.value))}
                  className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Duración (Minutos)</label>
                <input 
                  type="number" required min={5} step={5}
                  value={newSDuration} onChange={(e) => setNewSDuration(Number(e.target.value))}
                  className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Categoría</label>
              <select 
                value={newSCategory} onChange={(e) => setNewSCategory(e.target.value)}
                className="w-full bg-surface-dark border border-surface-border text-white text-sm rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
              >
                <option value="Corte">Corte</option>
                <option value="Barba">Barba</option>
                <option value="Combos">Combos</option>
                <option value="Facial">Tratamientos Faciales</option>
                <option value="Color">Tintes y Color</option>
              </select>
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-gold hover:bg-gold-light text-black font-bold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-lg"
            >
              Agregar Servicio
            </button>
          </form>
        </div>
      )}

      {activeTab === 'barberos' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Barbers list */}
          <div className="bg-surface-light p-6 rounded-2xl border border-surface-border space-y-4">
            <h3 className="font-display text-xl text-white flex items-center gap-2 mb-4">
              <UserSquare2 className="text-gold w-5 h-5" /> EQUIPO ACTIVO ({config.barbers.length})
            </h3>

            <div className="space-y-4">
              {config.barbers.map(b => (
                <div key={b.id} className="bg-surface-dark p-4 rounded-xl border border-surface-border flex gap-4 justify-between items-center hover:border-gold/15 transition-all">
                  <div className="flex gap-3 items-center">
                    <img src={b.photo} alt={b.name} className="w-12 h-12 rounded-full object-cover border border-gold/20" />
                    <div>
                      <h4 className="font-semibold text-white text-sm">{b.name}</h4>
                      <p className="text-xs text-gold font-medium mt-0.5">{b.specialty}</p>
                      <p className="text-[10px] text-gray-400 mt-1">Experiencia: <span className="font-semibold">{b.yearsOfExperience} años</span></p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteBarber(b.id)}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-black rounded-lg text-red-400 transition-all cursor-pointer"
                    title="Dar de baja barbero"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add barber form */}
          <form onSubmit={handleAddBarber} className="bg-surface-light p-6 rounded-2xl border border-surface-border space-y-4 h-fit">
            <h3 className="font-display text-xl text-white flex items-center gap-2 mb-4">
              <Plus className="text-gold w-5 h-5" /> AGREGAR BARBERO PROFESIONAL
            </h3>

            <div>
              <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Nombre Completo</label>
              <input 
                type="text" required placeholder="Ej. Roberto Mancini"
                value={newBName} onChange={(e) => setNewBName(e.target.value)}
                className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Especialidad</label>
                <input 
                  type="text" required placeholder="Ej. Desvanecidos, Tijera"
                  value={newBSpecialty} onChange={(e) => setNewBSpecialty(e.target.value)}
                  className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Años de Trayectoria</label>
                <input 
                  type="number" required min={0}
                  value={newBExp} onChange={(e) => setNewBExp(Number(e.target.value))}
                  className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Foto de Perfil (URL)</label>
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 bg-surface-dark rounded-full overflow-hidden border border-surface-border">
                  <img src={newBPhoto} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <input 
                  type="text" required
                  value={newBPhoto} onChange={(e) => setNewBPhoto(e.target.value)}
                  className="flex-1 bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 px-3 text-white text-xs focus:outline-none font-mono"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-gold hover:bg-gold-light text-black font-bold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-lg"
            >
              Agregar Barbero
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
export type ConfiguracionPropsType = ConfiguracionProps;
export type ConfiguracionType = React.ComponentType<ConfiguracionProps>;
export const ConfiguracionComponent = Configuracion;
