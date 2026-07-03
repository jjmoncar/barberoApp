import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert,
  Send,
  Smartphone
} from 'lucide-react';
import { AppState } from '../lib/useAppContext';
import { Appointment, Service, Barber } from '../types';

interface AgendaProps {
  state: AppState;
}

export default function Agenda({ state }: AgendaProps) {
  const { 
    config, 
    appointments, 
    saveAppointment, 
    deleteAppointment,
    clients,
    saveClient
  } = state;

  const [selectedBarberFilter, setSelectedBarberFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedBarberId, setSelectedBarberId] = useState<string>('b1');

  // Form states
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [appointmentNotes, setAppointmentNotes] = useState<string>('');
  const [walkIn, setWalkIn] = useState<boolean>(false);

  if (!config) return null;

  const services = config.services;
  const barbers = config.barbers;

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  // Map appointment list for rendering on the grid
  const getAppointmentForSlot = (time: string, barberId: string) => {
    return appointments.find(a => a.timeSlot === time && a.barberId === barberId && a.status !== 'cancelled');
  };

  const handleOpenBookingModal = (time: string, barberId: string) => {
    setSelectedSlot(time);
    setSelectedBarberId(barberId);
    setSelectedServiceId(services[0]?.id || '');
    setIsModalOpen(true);
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !selectedSlot) {
      alert("Por favor rellena el nombre y teléfono del cliente.");
      return;
    }

    const selectedService = services.find(s => s.id === selectedServiceId);
    if (!selectedService) return;

    // Check if client already exists, otherwise create
    let finalClientId = "guest";
    const existingClient = clients.find(c => c.phone === clientPhone);
    if (existingClient) {
      finalClientId = existingClient.id;
    } else {
      // Create client
      const newClientId = "c_" + Math.random().toString(36).substr(2, 9);
      await saveClient({
        id: newClientId,
        name: clientName,
        phone: clientPhone,
        email: "",
        points: 0,
        tier: "Nuevo",
        tags: ["Nuevo"],
        visitsCount: 0
      });
      finalClientId = newClientId;
    }

    const newAppt: Appointment = {
      id: "a_" + Math.random().toString(36).substr(2, 9),
      clientId: finalClientId,
      clientName,
      clientPhone,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      price: selectedService.price,
      duration: selectedService.duration,
      date: new Date().toISOString().split('T')[0],
      timeSlot: selectedSlot,
      barberId: selectedBarberId,
      status: "confirmed",
      notes: appointmentNotes,
      walkIn
    };

    await saveAppointment(newAppt);

    // Simulated Notification
    alert(`📅 ¡Cita Agendada con Éxito!\nSe ha enviado un recordatorio automático por WhatsApp al cliente ${clientName} (${clientPhone}) para el servicio de ${selectedService.name} a las ${selectedSlot}.`);

    // Reset Form
    setClientName('');
    setClientPhone('');
    setAppointmentNotes('');
    setWalkIn(false);
    setIsModalOpen(false);
  };

  const handleUpdateStatus = async (appt: Appointment, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    if (newStatus === 'cancelled') {
      const confirmCancel = window.confirm("¿Seguro que deseas cancelar esta cita?");
      if (!confirmCancel) return;
      await deleteAppointment(appt.id);
      return;
    }

    const updated: Appointment = {
      ...appt,
      status: newStatus
    };
    await saveAppointment(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Title and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-gold font-mono tracking-widest uppercase text-xs font-bold">Planificación de Cabina</span>
          <h2 className="font-display text-4xl text-white">AGENDA SEMANAL</h2>
          <p className="text-gray-400 text-sm">Gestiona reservas de clientes, walk-ins de paso y descansos de barberos en tiempo real.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleOpenBookingModal("10:00", "b1")}
            className="bg-gold text-black hover:bg-gold-light font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2 cursor-pointer gold-glow transition-all"
          >
            <Plus className="w-4 h-4" />
            Nueva Cita / Walk-in
          </button>
        </div>
      </div>

      {/* Grid Header & Barber Profiles Status Strip */}
      <div className="bg-surface-light p-4 rounded-2xl border border-surface-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-gray-300">Disponibilidad Actual: 85%</span>
          </div>
          <div className="h-4 w-px bg-white/10 hidden md:block"></div>
          <div className="flex items-center gap-4">
            {barbers.map(barber => (
              <div key={barber.id} className="flex items-center gap-2 text-xs">
                <img src={barber.photo} alt={barber.name} className="w-6 h-6 rounded-full object-cover border border-gold/20" />
                <span className="text-gray-300 font-medium">{barber.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-1.5 bg-surface-dark border border-surface-border text-gray-400 rounded-lg hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold px-2 text-gray-300">Hoy</span>
          <button className="p-1.5 bg-surface-dark border border-surface-border text-gray-400 rounded-lg hover:text-white transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Timeline Schedule Grid */}
      <div className="bg-surface-light rounded-2xl border border-surface-border overflow-hidden">
        {/* Grid Header (Hours + Barbers) */}
        <div className="grid grid-cols-12 border-b border-surface-border bg-surface-dark text-xs uppercase font-semibold text-gray-400">
          <div className="col-span-2 p-4 text-center border-r border-surface-border font-mono">Hora</div>
          {barbers.map(barber => (
            <div key={barber.id} className="col-span-2 p-4 text-center border-r border-surface-border last:border-0 font-display text-sm tracking-wide text-gold">
              {barber.name}
            </div>
          ))}
          <div className="col-span-2 p-4 text-center font-display text-sm tracking-wide text-gray-400">Notas Rápidas</div>
        </div>

        {/* Grid Slots */}
        <div className="divide-y divide-surface-border">
          {timeSlots.map(time => (
            <div key={time} className="grid grid-cols-12 min-h-[85px] hover:bg-white/[0.01] transition-colors relative">
              {/* Hour Column */}
              <div className="col-span-2 p-3 border-r border-surface-border flex items-center justify-center font-mono text-sm text-gray-400 bg-surface-dark/20">
                {time}
              </div>

              {/* Barbers Columns */}
              {barbers.map(barber => {
                const appt = getAppointmentForSlot(time, barber.id);
                return (
                  <div key={barber.id} className="col-span-2 p-2 border-r border-surface-border flex flex-col justify-center relative group">
                    {appt ? (
                      <div className={`p-2.5 rounded-xl border-l-4 shadow-md transition-all group-hover:scale-[1.01] relative overflow-hidden h-full flex flex-col justify-between ${
                        appt.status === 'completed' 
                          ? 'bg-green-500/5 border-green-500 hover:border-green-400' 
                          : appt.walkIn
                          ? 'bg-purple-500/5 border-purple-500 hover:border-purple-400'
                          : 'bg-gold/5 border-gold hover:border-gold-light'
                      }`}>
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-semibold text-xs text-white truncate max-w-[85px]" title={appt.clientName}>
                              {appt.clientName}
                            </span>
                            {appt.status === 'completed' ? (
                              <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                            ) : (
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => handleUpdateStatus(appt, 'completed')}
                                  className="text-[9px] bg-green-500/15 text-green-400 hover:bg-green-500 hover:text-black font-bold px-1 rounded transition-colors"
                                  title="Completar cita"
                                >
                                  OK
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(appt, 'cancelled')}
                                  className="text-[9px] bg-red-500/15 text-red-400 hover:bg-red-500 hover:text-black font-bold px-1 rounded transition-colors"
                                  title="Cancelar cita"
                                >
                                  X
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">{appt.serviceName}</p>
                        </div>
                        <div className="flex justify-between items-end mt-1 border-t border-white/5 pt-1">
                          <span className="text-[9px] font-mono text-gold font-bold">${appt.price}</span>
                          {appt.walkIn && <span className="text-[8px] bg-purple-500/20 text-purple-300 px-1 rounded font-bold">WALK-IN</span>}
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleOpenBookingModal(time, barber.id)}
                        className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-gold/5 flex items-center justify-center text-gold gap-1 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Reservar
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Side Memo column */}
              <div className="col-span-2 p-3 text-xs text-gray-500 flex flex-col justify-center bg-surface-dark/10">
                {time === '13:00' && (
                  <span className="text-purple-400/80 italic font-mono">🕒 Almuerzo staff</span>
                )}
                {time === '17:00' && (
                  <span className="text-yellow-400/80 italic font-mono">⚡ Horario pico</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Form Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-surface-light rounded-2xl border border-surface-border max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-surface-border bg-surface-dark flex justify-between items-center">
              <div>
                <h3 className="font-display text-2xl text-gold">RESERVAR CITA DE BARBERÍA</h3>
                <p className="text-xs text-gray-400">Programación ágil de servicios y walk-ins</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateAppointment} className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Nombre del Cliente</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Juan Pérez"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Teléfono Móvil (WhatsApp)</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input 
                    type="tel" 
                    required
                    placeholder="Ej. +52 55 1234 5678"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Hora Programada</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      disabled
                      value={selectedSlot || ''}
                      className="w-full bg-surface-dark/40 border border-surface-border rounded-xl py-2 pl-10 pr-4 text-gray-400 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Barbero Asignado</label>
                  <select 
                    value={selectedBarberId}
                    onChange={(e) => setSelectedBarberId(e.target.value)}
                    className="w-full bg-surface-dark border border-surface-border text-white text-sm rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                  >
                    {barbers.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Servicio Solicitado</label>
                <select 
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full bg-surface-dark border border-surface-border text-white text-sm rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - ${s.price} ({s.duration}m)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Notas Especiales / Comentarios</label>
                <textarea 
                  rows={2}
                  placeholder="Ej. Alérgico al tónico de mentol, fade muy bajo..."
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none text-sm transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-3 bg-surface-dark/40 p-3 rounded-xl border border-surface-border">
                <input 
                  type="checkbox"
                  id="walkInCheck"
                  checked={walkIn}
                  onChange={(e) => setWalkIn(e.target.checked)}
                  className="rounded border-gray-600 text-gold focus:ring-gold bg-surface-dark w-4 h-4"
                />
                <label htmlFor="walkInCheck" className="text-xs text-gray-300 font-medium cursor-pointer select-none">
                  Cliente Walk-in de paso (Sin cita previa)
                </label>
              </div>

              <div className="pt-4 border-t border-surface-border flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-surface-dark hover:bg-white/5 border border-surface-border text-gray-300 font-semibold text-xs rounded-xl uppercase transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-gold hover:bg-gold-light text-black font-bold text-xs rounded-xl uppercase gold-glow transition-all"
                >
                  Agendar y Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export type AgendaPropsType = AgendaProps;
export type AgendaType = React.ComponentType<AgendaProps>;
export const AgendaComponent = Agenda;
