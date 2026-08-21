'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  User, 
  Mail, 
  Phone, 
  DollarSign, 
  Calendar,
  RefreshCw,
  AlertCircle,
  CreditCard,
  Banknote,
  Check,
  ShieldCheck,
  Users,
  Tag
} from 'lucide-react';
import { Attendee } from '@/types/attendee';
import { extractPriceFromText, isAttendeePrepaid, PASTORES_LIST } from '@/lib/rut';

interface AttendeeCardProps {
  attendee: Attendee;
  onMarkAttendance: (attended: boolean, precioPagado?: number, plataforma?: string, pastorRed?: string) => void;
  isUpdating: boolean;
}

export function AttendeeCard({ attendee, onMarkAttendance, isUpdating }: AttendeeCardProps) {
  const fullName = `${attendee.nombre} ${attendee.apellido1} ${attendee.apellido2 || ''}`.trim();
  
  const isEstudiante = attendee.tipoAsistente.toLowerCase().includes('estudiante');
  const isVisita = attendee.tipoAsistente.toLowerCase().includes('visita');
  const isTerceraEdad = attendee.tipoAsistente.toLowerCase().includes('tercera') || attendee.tipoAsistente.toLowerCase().includes('edad');
  const isLiderazgo = !isEstudiante && !isVisita && !isTerceraEdad;

  // Check if prepaid in database
  const isPrepaid = isAttendeePrepaid(attendee.pago);

  // Dynamic price derived from attendee's category or registered price
  const initialPrice = typeof attendee.precioPagado === 'number' && attendee.precioPagado > 0
    ? attendee.precioPagado 
    : extractPriceFromText(attendee.tipoAsistente || attendee.pago || '');
  
  const [precio, setPrecio] = useState<number>(initialPrice);
  const [modalidadPago, setModalidadPago] = useState<'Transferencia' | 'Efectivo'>('Efectivo');
  
  // Pastor de Red State
  const [pastorRed, setPastorRed] = useState<string>(attendee.pastorRed || '');
  const [isCustomPastor, setIsCustomPastor] = useState(false);
  const [customPastor, setCustomPastor] = useState('');

  useEffect(() => {
    const derivedPrice = typeof attendee.precioPagado === 'number' && attendee.precioPagado > 0
      ? attendee.precioPagado 
      : extractPriceFromText(attendee.tipoAsistente || attendee.pago || '');
    setPrecio(derivedPrice);
    
    if (attendee.plataforma?.toLowerCase().includes('transferencia')) {
      setModalidadPago('Transferencia');
    } else {
      setModalidadPago('Efectivo');
    }

    const currentPastor = attendee.pastorRed || '';
    setPastorRed(currentPastor);
    if (currentPastor && !PASTORES_LIST.includes(currentPastor)) {
      setIsCustomPastor(true);
      setCustomPastor(currentPastor);
    } else {
      setIsCustomPastor(false);
      setCustomPastor('');
    }
  }, [attendee]);

  const handlePastorSelect = (val: string) => {
    if (val === '__OTRO__') {
      setIsCustomPastor(true);
      setPastorRed(customPastor);
    } else {
      setIsCustomPastor(false);
      setPastorRed(val);
    }
  };

  const handleCustomPastorChange = (val: string) => {
    setCustomPastor(val);
    setPastorRed(val);
  };

  const handleConfirmAttendance = () => {
    const finalPlat = isPrepaid ? (attendee.plataforma || 'Plataforma GLS') : modalidadPago;
    const finalPastor = isCustomPastor ? customPastor.trim() : pastorRed.trim();
    onMarkAttendance(true, precio, finalPlat, finalPastor);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto animate-in fade-in duration-200">
      <div className={`solid-panel rounded-2xl overflow-hidden border-2 transition-all ${
        attendee.asistio 
          ? 'border-emerald-600' 
          : 'border-[#1A3447]'
      }`}>
        
        {/* Status Header Banner */}
        <div className={`px-4 sm:px-6 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-3 border-b ${
          attendee.asistio 
            ? 'bg-emerald-950/70 border-emerald-700' 
            : 'bg-[#081824] border-[#1A3447]'
        }`}>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {attendee.asistio ? (
              <div className="flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-600 text-white font-bold text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span>ACREDITADO / EN SALA</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-amber-600/30 border border-amber-500 text-amber-300 font-bold text-xs sm:text-sm">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-400" />
                <span>REGISTRADO (PENDIENTE CHECK-IN)</span>
              </div>
            )}

            <span className="text-[11px] sm:text-xs font-mono text-slate-400">
              Fila #{attendee.rowIndex}
            </span>
          </div>

          {/* Payment Status Pill */}
          {isPrepaid || attendee.asistio ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>✓ PAGO CONFIRMADO ({attendee.plataforma || (isPrepaid ? 'Previo' : modalidadPago)})</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950 border border-amber-500 text-amber-300 text-xs font-bold">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>⚠ DEBE PAGAR EN PUERTA</span>
            </span>
          )}
        </div>

        {/* Card Content Body */}
        <div className="p-4 sm:p-7 space-y-5">
          
          {/* Main Attendee Name & RUT */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md text-[11px] sm:text-xs font-bold uppercase tracking-wider border ${
                isEstudiante 
                  ? 'bg-sky-900/60 text-sky-200 border-sky-600' 
                  : isVisita 
                    ? 'bg-purple-900/60 text-purple-200 border-purple-600'
                    : isTerceraEdad
                      ? 'bg-teal-900/60 text-teal-200 border-teal-600'
                      : 'bg-[#0E2A3D] text-[#38BDF8] border-[#0284C7]/60'
              }`}>
                {attendee.tipoAsistente || 'Liderazgo General ($12.000.-)'}
              </span>

              {attendee.organizacion && (
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-medium bg-[#0E2433] text-slate-300 border border-[#1A3447]">
                  {attendee.organizacion}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight capitalize break-words">
              {fullName.toLowerCase()}
            </h2>

            <p className="text-lg sm:text-xl font-mono font-bold text-[#0284C7] mt-1">
              RUT: {attendee.rut}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#1A3447] text-xs sm:text-sm">
            
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#091722] border border-[#1A3447]">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#0284C7] flex-shrink-0" />
              <div className="overflow-hidden">
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Correo Electrónico</p>
                <p className="font-semibold text-slate-200 truncate">{attendee.email || 'No registrado'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#091722] border border-[#1A3447]">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#0284C7] flex-shrink-0" />
              <div>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Teléfono (WhatsApp)</p>
                <p className="font-semibold text-slate-200 font-mono">{attendee.telefono || 'No registrado'}</p>
              </div>
            </div>

            {attendee.timestamp && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#091722] border border-[#1A3447] sm:col-span-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Fecha de Inscripción</p>
                  <p className="font-semibold text-slate-300 text-[11px] sm:text-xs">{attendee.timestamp}</p>
                </div>
              </div>
            )}

          </div>

          {/* PASTOR DE RED SELECTOR / FIELD */}
          <div className="p-3.5 rounded-xl bg-[#091722] border border-[#1A3447] space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#EA580C]" />
              <span>Pastor de Red (Traído de la Base / Modificable)</span>
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="relative">
                <select
                  value={isCustomPastor ? '__OTRO__' : pastorRed}
                  onChange={(e) => handlePastorSelect(e.target.value)}
                  className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-lg px-3 py-2 text-white text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="">-- Sin Pastor Asignado --</option>
                  {PASTORES_LIST.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  <option value="__OTRO__">Otro Pastor / Escribir nombre...</option>
                </select>
              </div>

              {isCustomPastor ? (
                <input
                  type="text"
                  value={customPastor}
                  onChange={(e) => handleCustomPastorChange(e.target.value)}
                  placeholder="Escribe el nombre del Pastor..."
                  className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-lg px-3 py-2 text-white text-xs font-medium outline-none"
                />
              ) : (
                <div className="flex items-center px-3 py-2 rounded-lg bg-[#07131B] border border-[#1A3447] text-xs text-slate-300 font-medium">
                  <span>Pastor actual: <strong>{pastorRed || 'Ninguno'}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* PAYMENT & MODALITY CONFIGURATION BOX */}
          {isPrepaid ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-emerald-300">
                      PAGO REGISTRADO EN BASE DE DATOS
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-300">
                      Este participante ya figura como pagado ({attendee.pago || 'Pagado'}). <strong>No requiere pagar nuevamente.</strong>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Monto</span>
                  <span className="text-base font-mono font-bold text-emerald-300">
                    ${precio > 0 ? precio.toLocaleString('es-CL') : '12.000'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#091824] border-2 border-amber-500/80 space-y-4">
              
              {/* Header showing attendee category */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1A3447] pb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-amber-300">
                      REGISTRAR PAGO EN PUERTA
                    </p>
                    <p className="text-[11px] text-slate-300">
                      Categoría registrada: <strong className="text-[#38BDF8]">{attendee.tipoAsistente || 'Liderazgo General ($12.000.-)'}</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#07131B] px-3 py-1.5 rounded-lg border border-[#1A3447]">
                  <Tag className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span className="text-xs font-semibold text-slate-200">
                    {attendee.tipoAsistente || 'Liderazgo General ($12.000.-)'}
                  </span>
                </div>
              </div>

              {/* 2 Payment Options: Transferencia o Efectivo */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  ¿Cómo va a pagar? (Selecciona una de las 2 opciones):
                </label>
                <div className="grid grid-cols-2 gap-3">
                  
                  <button
                    type="button"
                    onClick={() => setModalidadPago('Transferencia')}
                    className={`p-3.5 rounded-xl border-2 flex items-center justify-center gap-2.5 font-bold text-sm transition-all ${
                      modalidadPago === 'Transferencia'
                        ? 'border-[#0284C7] bg-[#0E2A3D] text-white shadow-md'
                        : 'border-[#1A3447] bg-[#07131B] text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className={`w-5 h-5 ${modalidadPago === 'Transferencia' ? 'text-[#38BDF8]' : 'text-slate-500'}`} />
                    <span>Transferencia</span>
                    {modalidadPago === 'Transferencia' && <Check className="w-4 h-4 text-[#38BDF8]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalidadPago('Efectivo')}
                    className={`p-3.5 rounded-xl border-2 flex items-center justify-center gap-2.5 font-bold text-sm transition-all ${
                      modalidadPago === 'Efectivo'
                        ? 'border-emerald-500 bg-emerald-950/70 text-white shadow-md'
                        : 'border-[#1A3447] bg-[#07131B] text-slate-400 hover:text-white'
                    }`}
                  >
                    <Banknote className={`w-5 h-5 ${modalidadPago === 'Efectivo' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>Efectivo</span>
                    {modalidadPago === 'Efectivo' && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>

                </div>
              </div>

              {/* Official Tariffs Selection (ONLY 12.000 and 5.000) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>Monto a Cobrar ($):</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">${precio.toLocaleString('es-CL')}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button 
                    type="button" 
                    onClick={() => setPrecio(12000)}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                      precio === 12000 
                        ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-sm' 
                        : 'bg-[#0A1822] text-slate-300 border-[#1A3447] hover:border-slate-600'
                    }`}
                  >
                    <span>Liderazgo General</span>
                    <span className="font-mono font-black text-sm">$12.000.-</span>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setPrecio(5000)}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                      precio === 5000 
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm' 
                        : 'bg-[#0A1822] text-slate-300 border-[#1A3447] hover:border-slate-600'
                    }`}
                  >
                    <span>Estudiante / Visita / 3ra Edad</span>
                    <span className="font-mono font-black text-sm">$5.000.-</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 border-t border-[#1A3447] flex flex-col sm:flex-row gap-3">
            
            <button
              type="button"
              onClick={handleConfirmAttendance}
              disabled={isUpdating}
              className={`min-h-[52px] flex-1 py-3.5 px-6 rounded-xl font-bold text-base uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all text-white active:scale-98 ${
                attendee.asistio
                  ? 'bg-emerald-700 hover:bg-emerald-600 border border-emerald-500'
                  : isPrepaid
                    ? 'btn-success shadow-md'
                    : 'bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 shadow-md'
              }`}
            >
              {isUpdating ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-6 h-6 font-bold" />
              )}
              <span>
                {attendee.asistio 
                  ? '✓ Actualizar Asistió' 
                  : isPrepaid 
                    ? 'Marcar Asistió (Pagado)' 
                    : `Marcar Pagado (${modalidadPago} - $${precio.toLocaleString('es-CL')}) y Asistió`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onMarkAttendance(false, precio, modalidadPago, pastorRed)}
              disabled={isUpdating || !attendee.asistio}
              className={`min-h-[46px] py-3 px-5 rounded-xl font-semibold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 border transition-colors ${
                !attendee.asistio
                  ? 'border-slate-800 bg-slate-900/30 text-slate-500 cursor-not-allowed'
                  : 'border-rose-700 bg-rose-950/60 text-rose-300 hover:bg-rose-900 hover:text-white'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>Desmarcar</span>
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}
