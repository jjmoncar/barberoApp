import React, { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  Smartphone, 
  Mail, 
  Tag, 
  Clock, 
  Plus, 
  Scissors, 
  Package, 
  Star, 
  FileText,
  User,
  Heart,
  Upload,
  Calendar
} from 'lucide-react';
import { AppState } from '../lib/useAppContext';
import { Client, VisitRecord, Product } from '../types';

interface ClientesCRMProps {
  state: AppState;
}

export default function ClientesCRM({ state }: ClientesCRMProps) {
  const { 
    clients, 
    saveClient, 
    visitRecords, 
    addVisitRecord, 
    products, 
    config,
    selectedClientId,
    setSelectedClientId
  } = state;

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState<boolean>(false);
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState<boolean>(false);

  // New Client form state
  const [newName, setNewName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newTags, setNewTags] = useState<string>('Nuevo');

  // New Visit Record form state
  const [selectedService, setSelectedService] = useState<string>('');
  const [price, setPrice] = useState<number>(250);
  const [barberId, setBarberId] = useState<string>('b1');
  const [machineSettings, setMachineSettings] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [usedProducts, setUsedProducts] = useState<{ productId: string; qty: number }[]>([]);
  const [imageOfCut, setImageOfCut] = useState<string>('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=300');

  // Filter clients based on search
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const activeClient = clients.find(c => c.id === selectedClientId) || clients[0];
  const activeClientRecords = visitRecords.filter(r => r.clientId === activeClient?.id);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    const newClient: Client = {
      id: "c_" + Math.random().toString(36).substr(2, 9),
      name: newName,
      phone: newPhone,
      email: newEmail,
      points: 0,
      tier: "Nuevo",
      tags: newTags.split(',').map(t => t.trim()),
      visitsCount: 0
    };

    await saveClient(newClient);
    setSelectedClientId(newClient.id);
    setIsNewClientModalOpen(false);
    
    // Clear
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewTags('Nuevo');
  };

  const handleAddProductUsage = (productId: string) => {
    const existing = usedProducts.find(item => item.productId === productId);
    if (existing) {
      setUsedProducts(usedProducts.map(item => 
        item.productId === productId ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setUsedProducts([...usedProducts, { productId, qty: 1 }]);
    }
  };

  const handleRemoveProductUsage = (productId: string) => {
    setUsedProducts(usedProducts.filter(item => item.productId !== productId));
  };

  const handleCreateVisitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient) return;

    const barber = config?.barbers.find(b => b.id === barberId);
    const barberName = barber ? barber.name : "Alex Rivera";

    // Format products used array with name
    const productsFormatted = usedProducts.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        name: prod ? prod.name : "Producto",
        qty: item.qty
      };
    });

    const newRecord: VisitRecord = {
      id: "vr_" + Math.random().toString(36).substr(2, 9),
      clientId: activeClient.id,
      date: new Date().toISOString().split('T')[0],
      barberId,
      barberName,
      serviceName: selectedService || "Corte de Cabello Premium",
      price: Number(price),
      imageOfCut,
      productsUsed: productsFormatted,
      machineSettings,
      notes,
      rating
    };

    await addVisitRecord(newRecord);
    
    // Notify
    alert(`📝 ¡Ficha de Servicio Guardada!\nSe registraron los detalles para ${activeClient.name}. Se descontó el stock de los productos correspondientes y se sumaron puntos de fidelidad.`);

    // Reset Form
    setSelectedService('');
    setUsedProducts([]);
    setMachineSettings('');
    setNotes('');
    setIsNewRecordModalOpen(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)] overflow-hidden">
      {/* Left Sidebar: Client List Search (4 cols) */}
      <div className="lg:col-span-4 bg-surface-light rounded-2xl border border-surface-border flex flex-col overflow-hidden h-full">
        {/* Header search */}
        <div className="p-4 border-b border-surface-border space-y-3 bg-surface-dark/20">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-xl text-white">CLIENTES</h3>
            <button 
              onClick={() => setIsNewClientModalOpen(true)}
              className="p-2 bg-gold/10 hover:bg-gold/20 text-gold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <UserPlus className="w-4 h-4" /> Nuevo
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o celular..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-1.5 pl-10 pr-4 text-white text-xs placeholder-gray-600 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* List items */}
        <div className="flex-1 overflow-y-auto divide-y divide-surface-border">
          {filteredClients.map(c => {
            const isSelected = activeClient?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedClientId(c.id)}
                className={`w-full text-left p-4 flex justify-between items-center transition-all ${
                  isSelected ? 'bg-gold/5 border-l-4 border-gold' : 'hover:bg-white/[0.01]'
                }`}
              >
                <div>
                  <h4 className="font-semibold text-sm text-white">{c.name}</h4>
                  <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-gold" /> {c.phone}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    c.tier === 'VIP' ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' :
                    c.tier === 'Frecuente' ? 'bg-blue-500/10 text-blue-300' :
                    'bg-green-500/10 text-green-300'
                  }`}>
                    {c.tier}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">{c.visitsCount} visitas</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Content: Profile detail timeline (8 cols) */}
      <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
        {activeClient ? (
          <div className="bg-surface-light rounded-2xl border border-surface-border flex flex-col h-full overflow-hidden">
            {/* Header Details */}
            <div className="p-6 border-b border-surface-border bg-surface-dark/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gold/10 border-2 border-gold flex items-center justify-center font-display text-3xl text-gold shadow-lg">
                  {activeClient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-2xl text-white">{activeClient.name}</h2>
                    <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded font-bold uppercase tracking-wider">{activeClient.tier}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mt-1">
                    <span className="flex items-center gap-1"><Smartphone className="w-3.5 h-3.5 text-gold" /> {activeClient.phone}</span>
                    {activeClient.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-gold" /> {activeClient.email}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-surface-dark/50 px-3 py-1.5 rounded-xl border border-surface-border text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Puntos Club</p>
                  <p className="font-display text-lg text-gold">{activeClient.points} pts</p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedService(config?.services[0]?.name || '');
                    setPrice(config?.services[0]?.price || 250);
                    setIsNewRecordModalOpen(true);
                  }}
                  className="bg-gold hover:bg-gold-light text-black font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer gold-glow transition-all"
                >
                  <Plus className="w-4 h-4" /> Registrar Visita
                </button>
              </div>
            </div>

            {/* Profile body - Split Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Client Info Grid Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface-dark p-4 rounded-xl border border-surface-border">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Historial Operativo</p>
                  <p className="font-display text-3xl text-white mt-1">{activeClient.visitsCount} <span className="text-sm font-sans text-gray-400">servicios</span></p>
                </div>
                <div className="bg-surface-dark p-4 rounded-xl border border-surface-border">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Preferencia de Maquinaria</p>
                  <p className="text-sm font-semibold text-gray-200 mt-2">
                    {activeClientRecords.length > 0 && activeClientRecords[0].machineSettings
                      ? activeClientRecords[0].machineSettings 
                      : "No registrada aún. Registra una visita para guardar la guarda usada."}
                  </p>
                </div>
                <div className="bg-surface-dark p-4 rounded-xl border border-surface-border">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Tags y Notas Especiales</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {activeClient.tags.map(t => (
                      <span key={t} className="text-[9px] bg-gold/10 text-gold border border-gold/25 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{t}</span>
                    ))}
                    {activeClientRecords.length > 0 && activeClientRecords[0].notes && (
                      <span className="text-[9px] bg-red-500/10 text-red-300 border border-red-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Alergias / Cuidado</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Visit Timeline */}
              <div className="space-y-4">
                <h3 className="font-display text-xl text-gold tracking-wide">LÍNEA DE TIEMPO DE VISITAS ({activeClientRecords.length})</h3>
                {activeClientRecords.length === 0 ? (
                  <div className="text-center py-10 bg-surface-dark/40 rounded-xl border border-surface-border text-gray-500 text-sm">
                    No hay visitas registradas para este cliente. ¡Agenda su primer corte con el botón &ldquo;Registrar Visita&rdquo;!
                  </div>
                ) : (
                  <div className="space-y-6 relative border-l-2 border-surface-border pl-6 ml-3">
                    {activeClientRecords.map((rec) => (
                      <div key={rec.id} className="relative space-y-3">
                        {/* Dot indicator */}
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-gold border-4 border-surface-light shadow-md"></div>
                        
                        <div className="bg-surface-dark p-4 rounded-2xl border border-surface-border space-y-4 hover:border-gold/15 transition-all">
                          {/* Date and Barber details */}
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                            <div>
                              <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" /> {rec.date}
                              </span>
                              <h4 className="text-white text-base font-semibold mt-1">{rec.serviceName}</h4>
                              <p className="text-xs text-gray-400 mt-0.5">Atendido por: <span className="text-gold font-medium">{rec.barberName}</span></p>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex text-yellow-500">
                                {[...Array(rec.rating || 5)].map((_, i) => (
                                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                                ))}
                              </div>
                              <span className="text-gold font-mono font-bold text-sm">${rec.price}</span>
                            </div>
                          </div>

                          {/* Specific settings and formulas */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-white/5 text-xs text-gray-300">
                            <div>
                              <p className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Maquinaria y Guardas</p>
                              <p className="mt-1 font-semibold text-gray-200">{rec.machineSettings || "Sin detalles específicos"}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Productos Usados</p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {rec.productsUsed.length === 0 ? (
                                  <span className="text-gray-500 italic">Ninguno</span>
                                ) : (
                                  rec.productsUsed.map(p => (
                                    <span key={p.productId} className="bg-surface-light border border-surface-border px-2 py-0.5 rounded text-[10px] text-gray-300">
                                      {p.name} ({p.qty}u)
                                    </span>
                                  ))
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Notas de Estilo</p>
                              <p className="mt-1 text-gray-400">{rec.notes || "Sin notas"}</p>
                            </div>
                          </div>

                          {/* Haircut image if provided */}
                          {rec.imageOfCut && (
                            <div className="pt-2">
                              <p className="text-gray-500 font-bold uppercase tracking-wider text-[10px] mb-2">Foto de Referencia</p>
                              <div className="w-48 h-32 rounded-lg overflow-hidden border border-surface-border">
                                <img src={rec.imageOfCut} alt="Corte final" className="w-full h-full object-cover hover:scale-105 transition-all duration-300" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface-light rounded-2xl border border-surface-border flex-1 flex flex-col items-center justify-center p-8 text-center">
            <User className="w-16 h-16 text-gray-600 mb-4 animate-pulse" />
            <h3 className="font-display text-2xl text-white">SELECCIONA UN CLIENTE</h3>
            <p className="text-gray-400 text-sm max-w-sm mt-2">Busca en el panel lateral por nombre o número telefónico para abrir su expediente de estilo, notas y fotos previas.</p>
          </div>
        )}
      </div>

      {/* MODAL: New Client */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-surface-light rounded-2xl border border-surface-border max-w-sm w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-surface-border bg-surface-dark flex justify-between items-center">
              <div>
                <h3 className="font-display text-2xl text-gold">REGISTRAR NUEVO CLIENTE</h3>
                <p className="text-xs text-gray-400">Alta de usuario en el Club de Fidelidad</p>
              </div>
              <button onClick={() => setIsNewClientModalOpen(false)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateClient} className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Nombre Completo</label>
                <input 
                  type="text" required placeholder="Ej. Juan Casablancas"
                  value={newName} onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 px-3 text-white placeholder-gray-600 focus:outline-none text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Número Móvil</label>
                <input 
                  type="tel" required placeholder="Ej. 5512345678"
                  value={newPhone} onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 px-3 text-white placeholder-gray-600 focus:outline-none text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Email (Opcional)</label>
                <input 
                  type="email" placeholder="Ej. juan@strokes.com"
                  value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 px-3 text-white placeholder-gray-600 focus:outline-none text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Etiquetas Separadas por Comas</label>
                <input 
                  type="text" placeholder="Ej. VIP, Frecuente, Amigo"
                  value={newTags} onChange={(e) => setNewTags(e.target.value)}
                  className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 px-3 text-white placeholder-gray-600 focus:outline-none text-sm transition-all"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2.5 bg-gold hover:bg-gold-light text-black font-bold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-lg"
              >
                Crear Expediente
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: New Visit Record */}
      {isNewRecordModalOpen && activeClient && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-surface-light rounded-2xl border border-surface-border max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 h-[90vh] flex flex-col">
            <div className="p-5 border-b border-surface-border bg-surface-dark flex justify-between items-center">
              <div>
                <h3 className="font-display text-2xl text-gold">REGISTRAR SESIÓN DE CORTE</h3>
                <p className="text-xs text-gray-400">Registrar especificaciones para {activeClient.name}</p>
              </div>
              <button onClick={() => setIsNewRecordModalOpen(false)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateVisitRecord} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Servicio Realizado</label>
                  <select 
                    value={selectedService}
                    onChange={(e) => {
                      setSelectedService(e.target.value);
                      const sObj = config?.services.find(s => s.name === e.target.value);
                      if (sObj) setPrice(sObj.price);
                    }}
                    className="w-full bg-surface-dark border border-surface-border text-white text-sm rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                  >
                    {config?.services.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Precio Cobrado ($)</label>
                  <input 
                    type="number" required
                    value={price} onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Barbero Atendiendo</label>
                  <select 
                    value={barberId}
                    onChange={(e) => setBarberId(e.target.value)}
                    className="w-full bg-surface-dark border border-surface-border text-white text-sm rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                  >
                    {config?.barbers.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Calificación del Cliente</label>
                  <select 
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-surface-dark border border-surface-border text-white text-sm rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ Excelente (5/5)</option>
                    <option value={4}>⭐⭐⭐⭐ Bueno (4/5)</option>
                    <option value={3}>⭐⭐⭐ Regular (3/5)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Configuración de Maquinaria (Guarda / Clipper)</label>
                <input 
                  type="text" required placeholder="Ej. Guarda #2 laterales con desvanecido bajo"
                  value={machineSettings} onChange={(e) => setMachineSettings(e.target.value)}
                  className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 px-3 text-white placeholder-gray-600 focus:outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Productos del Inventario Consumidos</label>
                <p className="text-[10px] text-gray-400 mb-2">Agrega los productos consumidos para que se resten automáticamente del stock del negocio.</p>
                <div className="bg-surface-dark p-3 rounded-xl border border-surface-border space-y-2 max-h-32 overflow-y-auto">
                  {products.map(p => {
                    const matched = usedProducts.find(item => item.productId === p.id);
                    return (
                      <div key={p.id} className="flex justify-between items-center text-xs">
                        <span className="text-gray-300 font-medium">{p.name} (Stock: {p.stock}u)</span>
                        <div className="flex items-center gap-2">
                          {matched ? (
                            <>
                              <span className="text-gold font-bold">{matched.qty} u</span>
                              <button 
                                type="button" 
                                onClick={() => handleRemoveProductUsage(p.id)}
                                className="text-red-400 font-bold px-1 hover:underline"
                              >
                                Quitar
                              </button>
                            </>
                          ) : (
                            <button 
                              type="button" 
                              onClick={() => handleAddProductUsage(p.id)}
                              className="text-gold hover:underline font-bold"
                              disabled={p.stock <= 0}
                            >
                              + Consumir
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Foto del Corte Terminado (Dispositivo)</label>
                <div className="flex gap-3 items-center">
                  <div className="w-16 h-16 bg-surface-dark rounded-xl border border-surface-border overflow-hidden">
                    <img src={imageOfCut} alt="Corte final preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <button 
                      type="button"
                      onClick={() => {
                        // Simulate taking a photo with device camera
                        const mockPhotos = [
                          "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=300",
                          "https://images.unsplash.com/photo-1621574539437-4b7cb63120b8?auto=format&fit=crop&q=80&w=300",
                          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300"
                        ];
                        const randomPhoto = mockPhotos[Math.floor(Math.random() * mockPhotos.length)];
                        setImageOfCut(randomPhoto);
                        alert("📸 Foto tomada con éxito con la cámara del dispositivo.");
                      }}
                      className="py-1.5 px-3 bg-surface-dark hover:bg-white/5 border border-surface-border text-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" /> Capturar/Subir Foto
                    </button>
                    <p className="text-[10px] text-gray-500 mt-1">Soporta captura directa de cámara o subida de carrete.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Notas Libres (Fórmula de peinado, alergias, etc.)</label>
                <textarea 
                  rows={2} placeholder="Ej. Prefiere el fade muy sutil. Le gusta peinarse con cera brillante..."
                  value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none text-xs transition-all resize-none"
                />
              </div>

              <div className="pt-4 border-t border-surface-border flex gap-3">
                <button 
                  type="button" onClick={() => setIsNewRecordModalOpen(false)}
                  className="flex-1 py-2 bg-surface-dark hover:bg-white/5 border border-surface-border text-gray-300 font-semibold text-xs rounded-xl uppercase transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-gold hover:bg-gold-light text-black font-bold text-xs rounded-xl uppercase tracking-wider transition-all"
                >
                  Guardar Historial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export type ClientesCRMPropsType = ClientesCRMProps;
export type ClientesCRMType = React.ComponentType<ClientesCRMProps>;
export const ClientesCRMComponent = ClientesCRM;
