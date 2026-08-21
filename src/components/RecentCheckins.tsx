'use client';

import React from 'react';
import { History, CheckCircle2, UserCheck, Clock } from 'lucide-react';
import { Attendee } from '@/types/attendee';

interface RecentCheckinsProps {
  checkins: Attendee[];
  onSelectAttendee: (attendee: Attendee) => void;
}

export function RecentCheckins({ checkins, onSelectAttendee }: RecentCheckinsProps) {
  if (!checkins || checkins.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-10">
      <div className="flex items-center gap-2 mb-3 px-2 text-slate-300">
        <History className="w-4 h-4 text-lab-cyan" />
        <h3 className="text-xs font-bold uppercase tracking-wider">
          Acreditaciones Recientes ({checkins.length})
        </h3>
      </div>

      <div className="glass-panel rounded-2xl p-3 divide-y divide-lab-border/40 border border-lab-border/60">
        {checkins.map((item, idx) => (
          <div
            key={`${item.rutClean}-${idx}`}
            onClick={() => onSelectAttendee(item)}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-lab-cardHover/60 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-white text-sm group-hover:text-lab-cyan transition-colors">
                  {item.nombre} {item.apellido1} {item.apellido2 || ''}
                </p>
                <p className="text-xs font-mono text-slate-400">
                  {item.rut} &bull; <span className="text-slate-300">{item.tipoAsistente}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5 text-lab-cyan" />
              <span>{item.acreditadoAt || 'Recién'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
