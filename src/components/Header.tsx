'use client';

import React from 'react';
import { Calendar, Clock, MapPin, Users, Sparkles } from 'lucide-react';
import { StatsData } from '@/types/attendee';

interface HeaderProps {
  stats?: StatsData | null;
  isLoadingStats?: boolean;
}

export function Header({ stats, isLoadingStats }: HeaderProps) {
  return (
    <header className="relative w-full border-b border-[#1A3447] bg-[#0A1822] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-6">
          
          {/* Logo & Title */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#0D2433] border border-[#0284C7]/50 flex items-center justify-center text-[#0284C7] font-bold">
                <Sparkles className="w-5 h-5 text-[#0284C7]" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-wider text-white">
                    LIDERAZGO <span className="text-[#0284C7]">LAB</span>
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-md bg-[#0284C7]/20 text-[#38BDF8] border border-[#0284C7]/40">
                    Acreditación
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-300">
                  Diseña tu futuro
                </p>
              </div>
            </div>

            {/* Mobile Stats Chip */}
            <div className="md:hidden flex items-center gap-2 bg-[#0E2433] px-3 py-1.5 rounded-xl border border-[#1A3447]">
              <Users className="w-4 h-4 text-[#0284C7]" />
              <div className="text-right leading-tight">
                <span className="text-sm font-bold text-white">
                  {isLoadingStats ? '...' : (stats?.acreditados ?? 0)}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">/{stats?.total ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Event Details Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto py-1 scrollbar-none justify-start md:justify-center text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E2433] border border-[#1A3447] text-slate-200 whitespace-nowrap font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#0284C7] flex-shrink-0" />
              <span className="font-bold text-white">29 AGOSTO 2026</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E2433] border border-[#1A3447] text-slate-200 whitespace-nowrap font-medium">
              <Clock className="w-3.5 h-3.5 text-[#0284C7] flex-shrink-0" />
              <span>09:00 a 13:30</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E2433] border border-[#1A3447] text-slate-200 whitespace-nowrap font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#EA580C] flex-shrink-0" />
              <span>Av. Vicuña Mackenna 9405</span>
            </div>
          </div>

          {/* Desktop Live Attendance Counter */}
          <div className="hidden md:flex items-center gap-3 bg-[#0E2433] px-4 py-2 rounded-xl border border-[#1A3447]">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-[#0284C7]" />
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400">Acreditados</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white">
                    {isLoadingStats ? '...' : (stats?.acreditados ?? 0)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    / {isLoadingStats ? '...' : (stats?.total ?? 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-7 w-[1px] bg-[#1A3447]" />

            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">% Asistencia</span>
              <span className="text-base font-bold text-[#38BDF8]">
                {isLoadingStats ? '...' : `${stats?.porcentaje ?? 0}%`}
              </span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
