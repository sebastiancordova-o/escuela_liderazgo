'use client';

import React from 'react';
import { Database, MapPin } from 'lucide-react';

interface FooterProps {
  source?: 'google_sheets' | 'local_excel';
}

export function Footer({ source = 'local_excel' }: FooterProps) {
  const isGoogle = source === 'google_sheets';

  return (
    <footer className="w-full border-t border-[#1A3447] bg-[#07131B] text-slate-400 text-xs py-6 mt-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        {/* Logos section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-[#1A3447] text-center sm:text-left">
          
          {/* Logo 1 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-white/40 flex items-center justify-center p-1 bg-black/40 flex-shrink-0 rounded">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-white">
                <polygon points="12 2 2 22 22 22" />
                <polyline points="2 22 12 13 22 22" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-[11px] sm:text-xs tracking-wider leading-tight">LA CUMBRE GLOBAL</p>
              <p className="text-white font-bold text-[11px] sm:text-xs tracking-wider leading-tight">DE LIDERAZGO</p>
            </div>
          </div>

          {/* Center Address */}
          <div className="flex items-center gap-2 text-slate-300 text-xs">
            <MapPin className="w-4 h-4 text-[#EA580C] flex-shrink-0" />
            <span>Av. Vicuña Mackenna 9405, La Florida</span>
          </div>

          {/* Logo 2 */}
          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <p className="text-white font-bold text-xs sm:text-sm">Catedral <span className="text-[10px] text-slate-400 font-normal">de la</span></p>
              <p className="text-[#0284C7] font-bold text-xs sm:text-sm">Alabanza</p>
            </div>
            <div className="w-8 h-8 border border-[#0284C7]/50 rounded-full flex items-center justify-center text-[#0284C7] bg-[#0284C7]/10 font-bold flex-shrink-0">
              ✝
            </div>
          </div>

        </div>

        {/* System Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px] sm:text-xs text-center sm:text-left">
          <p>
            &copy; 2026 Cumbre Liderazgo Lab &bull; Plataforma Oficial de Acreditación
          </p>

          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium ${
              isGoogle 
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-400' 
                : 'bg-sky-950/80 border-sky-600 text-sky-400'
            }`}>
              <Database className="w-3 h-3" />
              <span>
                {isGoogle ? 'Google Sheets Conectado en Vivo' : 'Modo Demostración'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
