'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Search, 
  RefreshCw, 
  DollarSign, 
  Users, 
  Download, 
  Filter,
  Edit2,
  X,
  Save,
  Check,
  User,
  Phone,
  Mail,
  Building,
  Tag
} from 'lucide-react';
import { Attendee } from '@/types/attendee';
import { formatRut, cleanRut, formatPhoneStrict, PASTORES_LIST } from '@/lib/rut';
import { toast } from 'sonner';

export function Table2026View() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onlyAttended, setOnlyAttended] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRecaudado, setTotalRecaudado] = useState(0);
  const [totalAsistieron, setTotalAsistieron] = useState(0);

  // Edit Modal State
  const [editingAttendee, setEditingAttendee] = useState<Attendee | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchTableData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/table-2026?onlyAttended=${onlyAttended}&q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (data.success) {
        setAttendees(data.data || []);
        setTotalRecaudado(data.totalRecaudado || 0);
        setTotalAsistieron(data.totalAsistieron || 0);
      }
    } catch (e) {
      toast.error('Error al cargar datos de tabla 2026');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData();
  }, [onlyAttended]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTableData();
  };

  // Open Edit Modal
  const handleOpenEdit = (att: Attendee) => {
    setEditingAttendee({
      ...att,
      telefono: formatPhoneStrict(att.telefono || ''),
    });
  };

  // Save Edit to Google Sheets
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttendee) return;

    setIsSavingEdit(true);
    try {
      const cleanPhone = formatPhoneStrict(editingAttendee.telefono || '');
      const payload = {
        attendee: {
          ...editingAttendee,
          telefono: cleanPhone,
          precioPagado: Number(editingAttendee.precioPagado) || 0,
        }
      };

      const res = await fetch('/api/table-2026', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error al actualizar');
      }

      toast.success('¡Registro actualizado en Google Sheets!');
      setEditingAttendee(null);
      fetchTableData();
    } catch (err: any) {
      toast.error('Error', {
        description: err.message || 'No se pudo guardar la edición.',
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (attendees.length === 0) return;
    
    const headers = ['RUT', 'NOMBRE', 'APELLIDO 1', 'APELLIDO 2', 'EMAIL', 'TELEFONO', 'PASTOR DE RED', 'TIPO ASISTENTE', 'ORGANIZACION', 'PRECIO PAGADO', 'PLATAFORMA', 'ASISTENCIA'];
    const rows = attendees.map(a => [
      `"${a.rut}"`,
      `"${a.nombre}"`,
      `"${a.apellido1}"`,
      `"${a.apellido2 || ''}"`,
      `"${a.email || ''}"`,
      `"${formatPhoneStrict(a.telefono || '')}"`,
      `"${a.pastorRed || ''}"`,
      `"${a.tipoAsistente}"`,
      `"${a.organizacion || ''}"`,
      `"${a.precioPagado || a.pago}"`,
      `"${a.plataforma || ''}"`,
      `"${a.asistencia || (a.asistio ? 'Sí' : 'No')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,﻿' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `asistencia_2026_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Archivo CSV descargado con éxito');
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 animate-in fade-in duration-200">
      
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        
        <div className="solid-panel p-4 rounded-xl border border-[#1A3447] flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-slate-400">Total en Sala (Tabla 2026)</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">{totalAsistieron} personas</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-950/70 border border-emerald-700 flex items-center justify-center text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="solid-panel p-4 rounded-xl border border-[#1A3447] flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-slate-400">Recaudación Total Asistentes</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#38BDF8]">
              ${totalRecaudado.toLocaleString('es-CL')}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#0E2A3D] border border-[#0284C7] flex items-center justify-center text-[#0284C7]">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Control Bar: Search & Filters */}
      <div className="solid-panel p-3.5 rounded-xl border border-[#1A3447] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, RUT o Pastor..."
            className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-lg pl-10 pr-4 py-2 text-xs sm:text-sm text-white outline-none"
          />
        </form>

        {/* Filter Toggle */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setOnlyAttended(!onlyAttended)}
            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-colors ${
              onlyAttended
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-[#0E2433] border-[#1A3447] text-slate-300 hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{onlyAttended ? 'Solo Asistieron' : 'Todos en 2026'}</span>
          </button>

          <button
            type="button"
            onClick={fetchTableData}
            disabled={isLoading}
            className="p-2 rounded-lg bg-[#0E2433] border border-[#1A3447] text-slate-300 hover:text-white transition-colors"
            title="Recargar tabla"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={attendees.length === 0}
            className="px-3 py-2 rounded-lg text-xs font-bold bg-[#0E2433] hover:bg-[#0284C7] border border-[#1A3447] text-white flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>

      </div>

      {/* Main Table */}
      <div className="solid-panel rounded-xl border border-[#1A3447] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-200">
            <thead className="bg-[#081824] text-slate-400 uppercase text-[10px] sm:text-xs font-bold border-b border-[#1A3447] tracking-wider">
              <tr>
                <th className="px-3.5 py-3">Acción</th>
                <th className="px-3.5 py-3">Asistencia</th>
                <th className="px-3.5 py-3">Participante</th>
                <th className="px-3.5 py-3">RUT</th>
                <th className="px-3.5 py-3">Teléfono</th>
                <th className="px-3.5 py-3">Pastor de Red</th>
                <th className="px-3.5 py-3">Plataforma</th>
                <th className="px-3.5 py-3">Precio Pagado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A3447]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0284C7]" />
                    <span>Cargando tabla 2026 desde Google Sheets...</span>
                  </td>
                </tr>
              ) : attendees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    <span>No hay participantes registrados en la tabla 2026 todavía.</span>
                  </td>
                </tr>
              ) : (
                attendees.map((att, idx) => (
                  <tr key={`${att.rutClean}-${idx}`} className="hover:bg-[#0E2433] transition-colors">
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(att)}
                        className="px-2.5 py-1 rounded bg-[#0284C7]/20 hover:bg-[#0284C7] text-[#38BDF8] hover:text-white border border-[#0284C7]/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Editar datos de este participante"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Editar</span>
                      </button>
                    </td>

                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      {att.asistio ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                          <Check className="w-3 h-3" />
                          <span>Asistió</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">
                          Pendiente
                        </span>
                      )}
                    </td>

                    <td className="px-3.5 py-2.5 font-semibold text-white whitespace-nowrap">
                      {att.nombre} {att.apellido1} {att.apellido2 || ''}
                    </td>

                    <td className="px-3.5 py-2.5 font-mono font-bold text-[#38BDF8] whitespace-nowrap">
                      {att.rut}
                    </td>

                    <td className="px-3.5 py-2.5 font-mono text-xs text-slate-300 whitespace-nowrap">
                      {formatPhoneStrict(att.telefono || '') || 'Sin teléfono'}
                    </td>

                    <td className="px-3.5 py-2.5 text-slate-300 whitespace-nowrap">
                      {att.pastorRed || '-'}
                    </td>

                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-[#07131B] border border-[#1A3447] text-slate-300 text-xs">
                        {att.plataforma || 'Manual Web'}
                      </span>
                    </td>

                    <td className="px-3.5 py-2.5 font-mono font-bold text-emerald-400 whitespace-nowrap">
                      ${Number(att.precioPagado || att.pago || 10000).toLocaleString('es-CL')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Attendee Modal */}
      {editingAttendee && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="solid-panel w-full max-w-2xl rounded-2xl border-2 border-[#0284C7] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#081824] border-b border-[#1A3447] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#0284C7]" />
                <h3 className="text-base font-bold text-white">
                  Editar Registro (Tabla 2026)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingAttendee(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 overflow-y-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* RUT */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    RUT *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingAttendee.rut}
                    onChange={(e) => setEditingAttendee({ ...editingAttendee, rut: formatRut(cleanRut(e.target.value)) })}
                    className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-lg px-3 py-2 text-white font-mono font-bold text-sm outline-none"
                  />
                </div>

                {/* Asistencia Toggle */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Estado Asistencia
                  </label>
                  <select
                    value={editingAttendee.asistio ? 'SI' : 'NO'}
                    onChange={(e) => setEditingAttendee({ 
                      ...editingAttendee, 
                      asistio: e.target.value === 'SI',
                      asistencia: e.target.value === 'SI' ? 'Sí' : 'No'
                    })}
                    className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-lg px-3 py-2 text-white font-semibold text-sm outline-none"
                  >
                    <option value="SI">✓ Asistió (Presente)</option>
                    <option value="NO">✕ No Asistió (Pendiente)</option>
                  </select>
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingAttendee.nombre}
                    onChange={(e) => setEditingAttendee({ ...editingAttendee, nombre: e.target.value })}
                    className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-lg px-3 py-2 text-white text-sm outline-none"
                  />
                </div>

                {/* Primer Apellido */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Primer Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingAttendee.apellido1}
                    onChange={(e) => setEditingAttendee({ ...editingAttendee, apellido1: e.target.value })}
                    className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-lg px-3 py-2 text-white text-sm outline-none"
                  />
                </div>

                {/* Segundo Apellido */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Segundo Apellido
                  </label>
                  <input
                    type="text"
                    value={editingAttendee.apellido2 || ''}
                    onChange={(e) => setEditingAttendee({ ...editingAttendee, apellido2: e.target.value })}
                    className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-lg px-3 py-2 text-white text-sm outline-none"
                  />
                </div>

                {/* Teléfono (Strict +569XXXXXXXX) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Teléfono (+569XXXXXXXX)
                  </label>
                  <input
                    type="text"
                    value={editingAttendee.telefono || ''}
                    onChange={(e) => setEditingAttendee({ ...editingAttendee, telefono: formatPhoneStrict(e.target.value) })}
                    className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-lg px-3 py-2 text-white font-mono text-sm outline-none"
                    placeholder="+56991234567"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingAttendee.email || ''}
                    onChange={(e) => setEditingAttendee({ ...editingAttendee, email: e.target.value })}
                    className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-lg px-3 py-2 text-white text-sm outline-none"
                  />
                </div>

                {/* Pastor de Red */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Pastor de Red
                  </label>
                  <input
                    type="text"
                    value={editingAttendee.pastorRed || ''}
                    onChange={(e) => setEditingAttendee({ ...editingAttendee, pastorRed: e.target.value })}
                    className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-lg px-3 py-2 text-white text-sm outline-none"
                    placeholder="Christian Jara, Genoveva Navales, etc."
                  />
                </div>

                {/* Plataforma */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Plataforma
                  </label>
                  <select
                    value={editingAttendee.plataforma || 'Manual Web'}
                    onChange={(e) => setEditingAttendee({ ...editingAttendee, plataforma: e.target.value })}
                    className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-lg px-3 py-2 text-white text-sm outline-none"
                  >
                    <option value="Plataforma GLS">Plataforma GLS</option>
                    <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                    <option value="Pago Puerta / Efectivo">Pago Puerta / Efectivo</option>
                    <option value="Manual Web">Manual Web</option>
                    <option value="NR / Sin Registro">NR / Sin Registro</option>
                  </select>
                </div>

                {/* Precio Pagado */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Precio Pagado ($)
                  </label>
                  <input
                    type="number"
                    value={editingAttendee.precioPagado ?? 10000}
                    onChange={(e) => setEditingAttendee({ ...editingAttendee, precioPagado: Number(e.target.value) || 0 })}
                    className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-lg px-3 py-2 text-white font-mono font-bold text-sm outline-none"
                  />
                </div>

                {/* Tipo de Asistente */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Tipo de Asistente
                  </label>
                  <input
                    type="text"
                    value={editingAttendee.tipoAsistente}
                    onChange={(e) => setEditingAttendee({ ...editingAttendee, tipoAsistente: e.target.value })}
                    className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-lg px-3 py-2 text-white text-sm outline-none"
                  />
                </div>

                {/* Organización */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Organización
                  </label>
                  <input
                    type="text"
                    value={editingAttendee.organizacion || ''}
                    onChange={(e) => setEditingAttendee({ ...editingAttendee, organizacion: e.target.value })}
                    className="w-full bg-[#07131B] border border-[#1A3447] focus:border-[#0284C7] rounded-lg px-3 py-2 text-white text-sm outline-none"
                  />
                </div>

              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#1A3447] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingAttendee(null)}
                  disabled={isSavingEdit}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white border border-slate-700"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="btn-primary px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 text-white shadow-md disabled:opacity-50"
                >
                  {isSavingEdit ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Guardar en Google Sheets</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
