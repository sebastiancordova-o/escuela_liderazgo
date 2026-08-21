'use client';

import React, { useState } from 'react';
import { UserPlus, Sparkles, User, Mail, Phone, Building, Tag, Loader2, AlertCircle, Users, CreditCard, Banknote, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatRut, cleanRut, validateRut, calculateExpectedDv, formatPhoneStrict, PASTORES_LIST, CATEGORIAS_OFICIALES } from '@/lib/rut';
import { Attendee } from '@/types/attendee';
import { toast } from 'sonner';

interface NewAttendeeFormProps {
  initialRut: string;
  onRegisterSuccess: (attendee: Attendee) => void;
  onCancel: () => void;
}

export function NewAttendeeForm({ initialRut, onRegisterSuccess, onCancel }: NewAttendeeFormProps) {
  const [rut, setRut] = useState(formatRut(initialRut) || initialRut);
  const [nombre, setNombre] = useState('');
  const [apellido1, setApellido1] = useState('');
  const [apellido2, setApellido2] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('+569');
  const [tipoAsistente, setTipoAsistente] = useState('Liderazgo General ($12.000.-)');
  const [organizacion, setOrganizacion] = useState('Catedral de la Alabanza');
  const [pastorRed, setPastorRed] = useState('');
  const [customPastor, setCustomPastor] = useState('');
  const [isCustomPastor, setIsCustomPastor] = useState(false);
  const [plataforma, setPlataforma] = useState<'Transferencia' | 'Efectivo'>('Efectivo');
  const [precioPagado, setPrecioPagado] = useState(12000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const clean = cleanRut(rut);
  const isRutComplete = clean.length >= 7;
  const isRutValid = isRutComplete ? validateRut(clean) : true;
  const expectedDv = isRutComplete && !isRutValid ? calculateExpectedDv(clean) : '';

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneStrict(e.target.value);
    setTelefono(formatted);
  };

  const handleTipoChange = (val: string) => {
    setTipoAsistente(val);
    if (val.includes('12')) setPrecioPagado(12000);
    else if (val.includes('5')) setPrecioPagado(5000);
    else if (val.includes('Invitado') || val.includes('Staff')) setPrecioPagado(0);
    else setPrecioPagado(12000);
  };

  const handlePastorSelect = (val: string) => {
    if (val === '__OTRO__') {
      setIsCustomPastor(true);
      setPastorRed(customPastor);
    } else {
      setIsCustomPastor(false);
      setPastorRed(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nombre.trim() || !apellido1.trim() || !rut.trim()) {
      setErrorMsg('Por favor completa Nombre, Primer Apellido y RUT.');
      return;
    }

    const cleanRutVal = cleanRut(rut);
    if (!validateRut(cleanRutVal)) {
      setErrorMsg(`RUT Erróneo: El RUT ${formatRut(cleanRutVal)} no cumple con la norma chilena.`);
      toast.error('RUT Erróneo', { description: 'Por favor ingresa un RUT válido según el algoritmo de verificación.' });
      return;
    }

    const finalPhone = formatPhoneStrict(telefono);
    const finalPastor = isCustomPastor ? customPastor.trim() : pastorRed.trim();

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/attendees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          apellido1: apellido1.trim(),
          apellido2: apellido2.trim(),
          rut: cleanRutVal,
          email: email.trim(),
          telefono: finalPhone,
          tipoAsistente,
          organizacion: organizacion.trim(),
          pastorRed: finalPastor,
          precioPagado,
          plataforma,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error al registrar participante');
      }

      onRegisterSuccess(data.data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto animate-in fade-in duration-200">
      <div className="solid-panel rounded-2xl overflow-hidden border-2 border-[#1A3447]">
        
        {/* Banner */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#081824] border-b border-[#1A3447] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#EA580C]/20 border border-[#EA580C] flex items-center justify-center text-[#EA580C] flex-shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 flex-wrap">
                RUT No Registrado
                <span className="text-[10px] sm:text-xs font-mono font-bold text-[#EA580C] px-2 py-0.5 rounded bg-[#EA580C]/10 border border-[#EA580C]/30">
                  Registro Rápido
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300">
                Ingresa los datos para registrar e inscribir la asistencia inmediatamente en la tabla 2026.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-7 space-y-4 sm:space-y-5">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 text-xs sm:text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* RUT with Validation */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                <span>RUT *</span>
                {isRutComplete && !isRutValid && (
                  <span className="text-rose-400 font-bold text-[11px] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    RUT Erróneo {expectedDv ? `(DV esperado: ${expectedDv})` : ''}
                  </span>
                )}
                {isRutComplete && isRutValid && (
                  <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    RUT Válido
                  </span>
                )}
              </label>
              <input
                type="text"
                required
                value={rut}
                onChange={(e) => setRut(formatRut(cleanRut(e.target.value)))}
                className={`w-full bg-[#07131B] border rounded-xl px-4 py-2.5 text-white font-mono font-bold text-base sm:text-lg outline-none min-h-[46px] transition-colors ${
                  isRutComplete && !isRutValid 
                    ? 'border-rose-600 focus:border-rose-500 bg-rose-950/20' 
                    : 'border-[#1A3447] focus:border-[#0284C7]'
                }`}
                placeholder="12.345.678-5"
              />
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Nombre *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-xl pl-10 pr-4 py-2.5 text-white text-sm font-medium outline-none min-h-[46px]"
                  placeholder="Ej: Carolina"
                />
              </div>
            </div>

            {/* Apellido 1 */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Primer Apellido *
              </label>
              <input
                type="text"
                required
                value={apellido1}
                onChange={(e) => setApellido1(e.target.value)}
                className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-xl px-4 py-2.5 text-white text-sm font-medium outline-none min-h-[46px]"
                placeholder="Ej: González"
              />
            </div>

            {/* Apellido 2 */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Segundo Apellido (Opcional)
              </label>
              <input
                type="text"
                value={apellido2}
                onChange={(e) => setApellido2(e.target.value)}
                className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-xl px-4 py-2.5 text-white text-sm font-medium outline-none min-h-[46px]"
                placeholder="Ej: Muñoz"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-xl pl-10 pr-4 py-2.5 text-white text-sm font-medium outline-none min-h-[46px]"
                  placeholder="ejemplo@correo.com"
                />
              </div>
            </div>

            {/* Teléfono (Strict +569XXXXXXXX without space) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Teléfono / WhatsApp</span>
                <span className="text-[10px] text-slate-400 font-mono font-normal">+569XXXXXXXX</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={telefono}
                  onChange={handlePhoneChange}
                  className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-xl pl-10 pr-4 py-2.5 text-white text-sm font-mono font-medium outline-none min-h-[46px]"
                  placeholder="+56991234567"
                />
              </div>
            </div>

            {/* Pastor de Red (Opcional) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Pastor de Red</span>
                <span className="text-[10px] text-slate-400 font-normal">Opcional</span>
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <Users className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    value={isCustomPastor ? '__OTRO__' : pastorRed}
                    onChange={(e) => handlePastorSelect(e.target.value)}
                    className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-xl pl-10 pr-4 py-2.5 text-white text-sm font-medium outline-none cursor-pointer min-h-[46px]"
                  >
                    <option value="">-- Sin Pastor / No aplica --</option>
                    {PASTORES_LIST.map((pastor) => (
                      <option key={pastor} value={pastor}>{pastor}</option>
                    ))}
                    <option value="__OTRO__">Otro Pastor / Escribir nombre...</option>
                  </select>
                </div>

                {isCustomPastor && (
                  <input
                    type="text"
                    value={customPastor}
                    onChange={(e) => setCustomPastor(e.target.value)}
                    placeholder="Escribe el nombre del Pastor de Red..."
                    className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-xl px-4 py-2 text-white text-xs font-medium outline-none animate-in fade-in"
                  />
                )}
              </div>
            </div>

            {/* Tipo Asistente (Official categories) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Tipo de Asistente (Tarifa Oficial)
              </label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={tipoAsistente}
                  onChange={(e) => handleTipoChange(e.target.value)}
                  className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-xl pl-10 pr-4 py-2.5 text-white text-sm font-medium outline-none cursor-pointer min-h-[46px]"
                >
                  <option value="Liderazgo General ($12.000.-)">Liderazgo General ($12.000.-)</option>
                  <option value="Estudiante ($5.000.-)">Estudiante ($5.000.-)</option>
                  <option value="Visita ($5.000.-)">Visita ($5.000.-)</option>
                  <option value="Tercera Edad ($5.000.-)">Tercera Edad ($5.000.-)</option>
                  <option value="Invitado Especial / Staff">Invitado Especial / Staff</option>
                </select>
              </div>
            </div>

            {/* Medio de Pago (2 Opciones: Transferencia o Efectivo) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Medio de Pago en Puerta:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlataforma('Transferencia')}
                  className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all ${
                    plataforma === 'Transferencia'
                      ? 'border-[#0284C7] bg-[#0E2A3D] text-white'
                      : 'border-[#1A3447] bg-[#07131B] text-slate-400'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#38BDF8]" />
                  <span>Transferencia</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlataforma('Efectivo')}
                  className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all ${
                    plataforma === 'Efectivo'
                      ? 'border-emerald-500 bg-emerald-950/60 text-white'
                      : 'border-[#1A3447] bg-[#07131B] text-slate-400'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <span>Efectivo</span>
                </button>
              </div>
            </div>

            {/* Organización */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Organización / Iglesia
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={organizacion}
                  onChange={(e) => setOrganizacion(e.target.value)}
                  className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-xl pl-10 pr-4 py-2.5 text-white text-sm font-medium outline-none min-h-[46px]"
                  placeholder="Catedral de la Alabanza, etc."
                />
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#1A3447] flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isSubmitting || (isRutComplete && !isRutValid)}
              className="btn-success min-h-[48px] flex-1 py-3 px-6 rounded-xl font-bold text-base uppercase tracking-wider flex items-center justify-center gap-2.5 text-white shadow-md disabled:opacity-50 active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-white" />
                  <span>Registrar Pago (${precioPagado.toLocaleString('es-CL')}) y Acreditar</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="min-h-[46px] py-2.5 px-6 rounded-xl font-semibold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors"
            >
              Cancelar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
