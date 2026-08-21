'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, CreditCard, Sparkles, CornerDownLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatRut, cleanRut, validateRut, calculateExpectedDv } from '@/lib/rut';
import { toast } from 'sonner';

interface RutSearchProps {
  onSearch: (rut: string) => void;
  isLoading: boolean;
  initialRut?: string;
}

export function RutSearch({ onSearch, isLoading, initialRut = '' }: RutSearchProps) {
  const [rutInput, setRutInput] = useState(initialRut);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialRut) {
      setRutInput(formatRut(initialRut));
    }
  }, [initialRut]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      inputRef.current?.focus();
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const clean = cleanRut(rawVal);
    
    if (clean.length <= 9) {
      setRutInput(formatRut(clean));
    }
  };

  const clean = cleanRut(rutInput);
  const isComplete = clean.length >= 7;
  const isValid = isComplete ? validateRut(clean) : true;
  const expectedDv = isComplete && !isValid ? calculateExpectedDv(clean) : '';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearch();
    }
  };

  const executeSearch = () => {
    const targetClean = cleanRut(rutInput);
    if (!targetClean) return;

    // Strict Chilean RUT check
    if (!validateRut(targetClean)) {
      toast.error('RUT Erróneo', {
        description: `El RUT ${formatRut(targetClean)} no es válido según la norma chilena (Módulo 11). Revisa el dígito verificador.`,
      });
      return;
    }

    onSearch(targetClean);
  };

  const handleClear = () => {
    setRutInput('');
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-1 sm:px-0">
      <div className="relative">
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center rounded-2xl border-2 p-2 sm:p-2.5 transition-all gap-2 sm:gap-0 ${
          isComplete && !isValid
            ? 'bg-rose-950/30 border-rose-600 focus-within:border-rose-500'
            : isComplete && isValid
              ? 'bg-[#0B1C28] border-emerald-600/80 focus-within:border-emerald-500'
              : 'bg-[#0B1C28] border-[#1A3447] focus-within:border-[#0284C7]'
        }`}>
          
          <div className="flex items-center flex-1">
            <div className={`pl-3 pr-2 flex items-center justify-center ${
              isComplete && !isValid 
                ? 'text-rose-400' 
                : isComplete && isValid 
                  ? 'text-emerald-400' 
                  : 'text-[#0284C7]'
            }`}>
              <CreditCard className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>

            <input
              ref={inputRef}
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              value={rutInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ingresa RUT (ej: 16.519.617-1)"
              className="w-full bg-transparent text-white placeholder-slate-400 text-lg sm:text-2xl md:text-3xl font-mono font-bold tracking-wider px-2 py-2.5 sm:py-2 outline-none disabled:opacity-50 min-h-[48px]"
              autoComplete="off"
              spellCheck="false"
            />

            {rutInput && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 mr-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                title="Limpiar"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={executeSearch}
              disabled={isLoading || !rutInput.trim()}
              className={`w-full sm:w-auto min-h-[48px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-base sm:text-lg tracking-wide select-none active:scale-98 transition-all ${
                isComplete && !isValid
                  ? 'bg-rose-700 hover:bg-rose-600 border border-rose-500'
                  : 'btn-primary'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Buscar</span>
                  <CornerDownLeft className="w-4 h-4 opacity-70 hidden md:inline" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Validation Feedback Banner */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between text-xs px-2 gap-2">
        
        {isComplete && !isValid ? (
          <div className="flex items-center gap-2 text-rose-400 font-bold bg-rose-950/60 px-3 py-1.5 rounded-lg border border-rose-600/80 animate-in fade-in w-full sm:w-auto">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>
              RUT Erróneo: Dígito verificador no corresponde según la norma chilena {expectedDv ? `(debería ser ${expectedDv})` : ''}.
            </span>
          </div>
        ) : isComplete && isValid ? (
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>RUT Válido según norma chilena</span>
          </div>
        ) : (
          <span className="flex items-center gap-1.5 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Escribe con o sin puntos y presiona <strong>Buscar</strong> o <strong>Enter</strong></span>
          </span>
        )}

      </div>
    </div>
  );
}
