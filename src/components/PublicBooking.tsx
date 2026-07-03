import React, { useState } from 'react';
import { 
  Scissors, 
  User, 
  Clock, 
  Calendar, 
  Smartphone, 
  Mail, 
  CheckCircle2, 
  Share2, 
  Printer, 
  MessageSquare,
  QrCode
} from 'lucide-react';
import { AppState } from '../lib/useAppContext';
import { Appointment } from '../types';

interface PublicBookingProps {
  state: AppState;
}

export default function PublicBooking({ state }: PublicBookingProps) {
  const { config, saveAppointment, clients, saveClient } = state;

  const [step, setStep] = useState<number>(1); // 1: Select Service & Barber, 2: Select Date & Time & Info, 3: Completed Ticket
  
  // Selected fields state
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedBarberId, setSelectedBarberId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('11:00');
  
  // User form details
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Generated Appointment state for receipt ticket
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  if (!config) return null;

  const services = config.services;
  const barbers = config.barbers;

  const availableHours = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  const selectedService = services.find(s => s.id === selectedServiceId) || services[0];
  const selectedBarber = barbers.find(b => b.id === selectedBarberId) || barbers[0];

  const handleNextStep = () => {
    if (!selectedServiceId) {
      setSelectedServiceId(services[0]?.id || '');
    }
    if (!selectedBarberId) {
      setSelectedBarberId(barbers[0]?.id || '');
    }
    setStep(2);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      alert("Por favor rellena tu nombre y número telefónico.");
      return;
    }

    // Match client or register client
    let finalClientId = "guest";
    const existingClient = clients.find(c => c.phone === clientPhone);
    if (existingClient) {
      finalClientId = existingClient.id;
    } else {
      const newClientId = "c_" + Math.random().toString(36).substr(2, 9);
      await saveClient({
        id: newClientId,
        name: clientName,
        phone: clientPhone,
        email: clientEmail,
        points: 0,
        tier: "Nuevo",
        tags: ["Reserva Online"],
        visitsCount: 0
      });
      finalClientId = newClientId;
    }

    const newAppt: Appointment = {
      id: "a_" + Math.random().toString(36).substr(2, 9),
      clientId: finalClientId,
      clientName,
      clientPhone,
      clientEmail,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      price: selectedService.price,
      duration: selectedService.duration,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      barberId: selectedBarber.id,
      status: "confirmed",
      notes
    };

    await saveAppointment(newAppt);
    setCreatedAppointment(newAppt);
    setStep(3);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Brand Heading Link banner */}
      <div className="text-center bg-surface-light p-4 rounded-2xl border border-surface-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={config.logo} alt="Logo" className="w-10 h-10 rounded-xl object-cover border border-gold/30" />
          <div className="text-left">
            <h3 className="font-display text-lg text-gold leading-tight">{config.name}</h3>
            <p className="text-[10px] text-gray-400 font-mono">PORTAL DE CLIENTES</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">RESERVA INMEDIATA</p>
          <p className="text-xs text-green-400 font-mono">● Activo y en línea</p>
        </div>
      </div>

      {/* STEP 1: Select catalogs */}
      {step === 1 && (
        <div className="bg-surface-light p-6 rounded-3xl border border-surface-border space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="font-display text-2xl text-white">1. SELECCIONA TU SERVICIO</h2>
            <p className="text-gray-400 text-xs mt-1">Elige el servicio de estilismo o afeitado que deseas agendar.</p>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {services.map(s => {
              const isSelected = selectedServiceId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedServiceId(s.id)}
                  type="button"
                  className={`w-full text-left p-3.5 rounded-2xl border flex justify-between items-center transition-all ${
                    isSelected 
                      ? 'bg-gold/10 border-gold' 
                      : 'bg-surface-dark border-surface-border hover:border-gold/30'
                  }`}
                >
                  <div>
                    <span className="text-xs bg-white/5 border border-white/10 text-gray-400 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">{s.category}</span>
                    <h4 className="font-semibold text-white text-sm mt-1">{s.name}</h4>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">{s.duration} minutos de servicio</p>
                  </div>
                  <span className="font-mono text-gold font-bold text-sm">${s.price}</span>
                </button>
              );
            })}
          </div>

          <div>
            <h2 className="font-display text-2xl text-white">2. ELIGE A TU BARBERO</h2>
            <p className="text-gray-400 text-xs mt-1">Selecciona a tu estilista de confianza.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {barbers.map(b => {
              const isSelected = selectedBarberId === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBarberId(b.id)}
                  type="button"
                  className={`p-3 rounded-2xl border text-left flex gap-3 items-center transition-all ${
                    isSelected 
                      ? 'bg-gold/10 border-gold' 
                      : 'bg-surface-dark border-surface-border hover:border-gold/30'
                  }`}
                >
                  <img src={b.photo} alt={b.name} className="w-10 h-10 rounded-full object-cover border border-gold/20" />
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-xs text-white truncate">{b.name}</h4>
                    <p className="text-[10px] text-gold truncate">{b.specialty}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <button 
            onClick={handleNextStep}
            className="w-full py-3 bg-gold hover:bg-gold-light text-black font-bold text-xs rounded-xl uppercase tracking-wider shadow-lg flex items-center justify-center gap-1 cursor-pointer transition-all gold-glow"
          >
            Continuar con la Fecha <Clock className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: Scheduling calendar details & contact form */}
      {step === 2 && (
        <form onSubmit={handleCreateBooking} className="bg-surface-light p-6 rounded-3xl border border-surface-border space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="font-display text-2xl text-white">3. FECHA Y HORA</h2>
            <p className="text-gray-400 text-xs mt-1">Escoge el día y hora para tu cita con {selectedBarber?.name}.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Seleccionar Día</label>
              <input 
                type="date" required
                value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 px-3 text-white text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Hora de Entrada</label>
              <select 
                value={selectedTimeSlot} onChange={(e) => setSelectedTimeSlot(e.target.value)}
                className="w-full bg-surface-dark border border-surface-border text-white text-xs rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
              >
                {availableHours.map(h => (
                  <option key={h} value={h}>{h} hrs</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl text-white">4. DATOS DE RESERVA</h2>
            <p className="text-gray-400 text-xs mt-1">Escribe tus datos para confirmar tu agenda y enviarte el boleto de reserva.</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Nombre y Apellido</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input 
                  type="text" required placeholder="Ej. Carlos Slim"
                  value={clientName} onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 pl-10 pr-4 text-white text-xs placeholder-gray-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Teléfono Móvil (WhatsApp)</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                  <input 
                    type="tel" required placeholder="Ej. 5512345678"
                    value={clientPhone} onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 pl-10 pr-4 text-white text-xs placeholder-gray-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Email (Opcional)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                  <input 
                    type="email" placeholder="Ej. carlos@slim.com"
                    value={clientEmail} onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 pl-10 pr-4 text-white text-xs placeholder-gray-600 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Notas Especiales o Preferencias de Desvanecido</label>
              <textarea 
                rows={2} placeholder="Ej. Deseo un desvanecido medio con desbaste en barba..."
                value={notes} onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none text-xs transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button 
              type="button" onClick={() => setStep(1)}
              className="flex-1 py-2.5 bg-surface-dark hover:bg-white/5 border border-surface-border text-gray-300 font-semibold text-xs rounded-xl uppercase transition-colors"
            >
              Atrás
            </button>
            <button 
              type="submit"
              className="flex-1 py-2.5 bg-gold hover:bg-gold-light text-black font-bold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-lg"
            >
              Confirmar Reservación
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: Beautiful Confirmation Receipt Ticket */}
      {step === 3 && createdAppointment && (
        <div className="bg-surface-light p-6 rounded-3xl border border-gold/30 space-y-6 animate-in fade-in duration-300 relative overflow-hidden gold-glow">
          <div className="scan-line opacity-25"></div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-green-500/10 text-green-400 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="font-display text-3xl text-white">¡RESERVA CONFIRMADA!</h2>
            <p className="text-xs text-gray-400">Tu turno ha sido asignado de forma exitosa en el sistema de {config.name}.</p>
          </div>

          {/* Actual Ticket card layout */}
          <div className="bg-surface-dark border border-surface-border rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Código de Turno</p>
                <p className="text-white font-mono text-sm font-semibold">#{createdAppointment.id.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Móvil Registrado</p>
                <p className="text-gray-300 font-mono text-xs">{createdAppointment.clientPhone}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Cliente:</span>
                <span className="text-white font-semibold">{createdAppointment.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Servicio:</span>
                <span className="text-white font-semibold">{createdAppointment.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Estilista / Barbero:</span>
                <span className="text-gold font-semibold">{selectedBarber?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Fecha de Cita:</span>
                <span className="text-white font-mono font-semibold">{createdAppointment.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Hora Estipulada:</span>
                <span className="text-gold font-mono font-bold text-base">{createdAppointment.timeSlot} hrs</span>
              </div>
              <hr className="border-white/5" />
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-bold">Total a pagar:</span>
                <span className="text-gold font-mono font-bold text-lg">${createdAppointment.price.toFixed(2)}</span>
              </div>
            </div>

            {/* Simulated Ticket QR Code scan details */}
            <div className="pt-3 border-t border-white/5 flex flex-col items-center justify-center gap-2">
              <QrCode className="w-20 h-20 text-white/80" />
              <p className="text-[9px] text-gray-500 font-mono">Muestra este código QR al ingresar a la sucursal</p>
            </div>
          </div>

          {/* Quick confirmation notification share details */}
          <div className="space-y-3">
            <button 
              onClick={() => {
                const text = `Hola ${createdAppointment.clientName}, tu cita para ${createdAppointment.serviceName} el ${createdAppointment.date} a las ${createdAppointment.timeSlot} con ${selectedBarber?.name} en ${config.name} ha sido confirmada.`;
                window.open(`https://wa.me/${createdAppointment.clientPhone}?text=${encodeURIComponent(text)}`);
              }}
              className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" /> Enviar Ticket por WhatsApp
            </button>

            <div className="flex gap-2">
              <button 
                onClick={() => window.print()}
                className="flex-1 py-2 bg-surface-dark border border-surface-border hover:bg-white/5 text-gray-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`Cita en ${config.name} el ${createdAppointment.date} a las ${createdAppointment.timeSlot} hrs.`);
                  alert("📋 Detalles copiados al portapapeles.");
                }}
                className="flex-1 py-2 bg-surface-dark border border-surface-border hover:bg-white/5 text-gray-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" /> Compartir
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <button 
              onClick={() => {
                setCreatedAppointment(null);
                setStep(1);
              }}
              className="text-xs text-gold hover:underline font-semibold"
            >
              Hacer otra Reservación de Turno
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export type PublicBookingPropsType = PublicBookingProps;
export type PublicBookingType = React.ComponentType<PublicBookingProps>;
export const PublicBookingComponent = PublicBooking;
