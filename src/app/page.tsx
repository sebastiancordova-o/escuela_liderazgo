'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { RutSearch } from '@/components/RutSearch';
import { AttendeeCard } from '@/components/AttendeeCard';
import { NewAttendeeForm } from '@/components/NewAttendeeForm';
import { RecentCheckins } from '@/components/RecentCheckins';
import { Table2026View } from '@/components/Table2026View';
import { Footer } from '@/components/Footer';
import { Attendee, StatsData } from '@/types/attendee';
import { Sparkles, Search, UserCheck, Table as TableIcon } from 'lucide-react';

export default function AccreditationPage() {
  const [activeTab, setActiveTab] = useState<'search' | 'table2026'>('search');
  const [searchedRut, setSearchedRut] = useState('');
  const [currentAttendee, setCurrentAttendee] = useState<Attendee | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [dbSource, setDbSource] = useState<'google_sheets' | 'local_excel'>('local_excel');
  const [recentCheckins, setRecentCheckins] = useState<Attendee[]>([]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success && data.data) {
        setStats(data.data);
        if (data.source) setDbSource(data.source);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.65 },
        colors: ['#0284C7', '#38BDF8', '#16A34A', '#FFFFFF'],
      });
    } catch (e) {}
  };

  const handleSearch = async (rut: string) => {
    if (!rut.trim()) return;
    
    setIsSearching(true);
    setIsNotFound(false);
    setCurrentAttendee(null);
    setSearchedRut(rut);

    try {
      const res = await fetch(`/api/attendees?rut=${encodeURIComponent(rut)}`);
      const data = await res.json();

      if (data.source) setDbSource(data.source);

      if (res.status === 404 || !data.found) {
        setIsNotFound(true);
        toast.info('Participante no encontrado', {
          description: 'Puedes registrarlo y agregarlo a la tabla 2026 ahora mismo.',
        });
        return;
      }

      if (data.success && data.data) {
        setCurrentAttendee(data.data);
        if (data.data.asistio) {
          toast.info('Participante ya acreditado', {
            description: `${data.data.nombre} ya se encuentra registrado en sala.`,
          });
        }
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error('Error de conexión', {
        description: 'No se pudo consultar el participante. Revisa la conexión.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleMarkAttendance = async (
    attended: boolean, 
    precioPagado?: number, 
    plataforma?: string,
    pastorRed?: string
  ) => {
    if (!currentAttendee) return;

    setIsUpdating(true);
    try {
      const res = await fetch('/api/attendees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowIndex: currentAttendee.rowIndex,
          rut: currentAttendee.rut,
          attended,
          precioPagado,
          plataforma,
          pastorRed,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error al actualizar asistencia');
      }

      const updatedAttendee: Attendee = {
        ...currentAttendee,
        asistio: attended,
        asistencia: attended ? 'Sí' : 'No',
        precioPagado: precioPagado || currentAttendee.precioPagado,
        plataforma: plataforma || currentAttendee.plataforma,
        pastorRed: pastorRed !== undefined ? pastorRed : currentAttendee.pastorRed,
        pago: `Pagado ($${precioPagado || currentAttendee.precioPagado})`,
        acreditadoAt: attended ? new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : undefined,
      };

      setCurrentAttendee(updatedAttendee);

      if (attended) {
        triggerConfetti();
        toast.success('¡Acreditación Exitosa!', {
          description: `${currentAttendee.nombre} ${currentAttendee.apellido1} guardado en Google Sheets (Tabla 2026).`,
        });

        setRecentCheckins(prev => [
          updatedAttendee,
          ...prev.filter(a => a.rutClean !== updatedAttendee.rutClean).slice(0, 7)
        ]);
      } else {
        toast.warning('Asistencia desmarcada', {
          description: `Se desmarcó la acreditación de ${currentAttendee.nombre}.`,
        });

        setRecentCheckins(prev => prev.filter(a => a.rutClean !== updatedAttendee.rutClean));
      }

      fetchStats();
    } catch (error: any) {
      console.error('Attendance error:', error);
      toast.error('Error', {
        description: error.message || 'No se pudo actualizar la asistencia.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRegisterSuccess = (newAttendee: Attendee) => {
    const accredited = {
      ...newAttendee,
      asistio: true,
      acreditadoAt: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    };

    setCurrentAttendee(accredited);
    setIsNotFound(false);
    triggerConfetti();

    toast.success('¡Registrado y Acreditado!', {
      description: `${newAttendee.nombre} guardado en Google Sheets con éxito.`,
    });

    setRecentCheckins(prev => [
      accredited,
      ...prev.filter(a => a.rutClean !== accredited.rutClean).slice(0, 7)
    ]);

    fetchStats();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#07131B] relative overflow-x-hidden">
      
      {/* Header */}
      <Header stats={stats} isLoadingStats={isLoadingStats} />

      {/* Navigation View Switcher */}
      <div className="max-w-5xl w-full mx-auto px-4 pt-5 flex justify-center">
        <div className="inline-flex p-1 rounded-xl bg-[#091722] border border-[#1A3447]">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'search'
                ? 'btn-primary shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Buscador y Check-in</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('table2026')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'table2026'
                ? 'btn-primary shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>Tabla 2026 (Asistencias)</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-5 sm:py-7 flex flex-col items-center">
        
        {activeTab === 'search' ? (
          <>
            {/* Title */}
            <div className="text-center mb-5 sm:mb-7 space-y-1 sm:space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0284C7]/15 border border-[#0284C7]/30 text-[#38BDF8] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Control de Acceso</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Acreditación de Participantes
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto px-2">
                Ingresa el RUT, verifica el Pastor de Red y modalidad de pago, y confirma el ingreso.
              </p>
            </div>

            {/* RUT Search */}
            <RutSearch 
              onSearch={handleSearch} 
              isLoading={isSearching}
              initialRut={searchedRut}
            />

            {/* Results Area */}
            <div className="w-full mt-5 sm:mt-6">
              
              {currentAttendee && (
                <AttendeeCard
                  attendee={currentAttendee}
                  onMarkAttendance={handleMarkAttendance}
                  isUpdating={isUpdating}
                />
              )}

              {isNotFound && (
                <NewAttendeeForm
                  initialRut={searchedRut}
                  onRegisterSuccess={handleRegisterSuccess}
                  onCancel={() => {
                    setIsNotFound(false);
                    setCurrentAttendee(null);
                  }}
                />
              )}

              {!currentAttendee && !isNotFound && !isSearching && (
                <div className="text-center py-8 text-slate-500 space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-[#091722] border border-[#1A3447] flex items-center justify-center text-slate-400">
                    <Search className="w-6 h-6 text-[#0284C7]" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-400">
                    Esperando ingreso de RUT para buscar en la base de datos...
                  </p>
                </div>
              )}

            </div>

            {/* Recent Checkins */}
            <RecentCheckins 
              checkins={recentCheckins} 
              onSelectAttendee={(att) => {
                setCurrentAttendee(att);
                setIsNotFound(false);
              }} 
            />
          </>
        ) : (
          <Table2026View />
        )}

      </main>

      {/* Footer */}
      <Footer source={dbSource} />

    </div>
  );
}
