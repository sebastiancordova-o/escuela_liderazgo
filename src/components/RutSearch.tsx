'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, CreditCard, Sparkles, CornerDownLeft } from 'lucide-react';
import { formatRut, cleanRut, validateRut } from '@/lib/rut';

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearch();
    }
  };

  const executeSearch = () => {
    const clean = cleanRut(rutInput);
    if (!clean) return;
    onSearch(clean);
  };

  const handleClear = () => {
    setRutInput('');
    inputRef.current?.focus();
  };

  const isValid = rutInput.length > 7 ? validateRut(rutInput) : true;

  return (
    <div className="w-full max-w-3xl mx-auto px-1 sm:px-0">
      <div className="relative">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-[#0B1C28] rounded-2xl border-2 border-[#1A3447] focus-within:border-[#0284C7] p-2 sm:p-2.5 transition-colors gap-2 sm:gap-0">
          
          <div className="flex items-center flex-1">
            <div className="pl-3 pr-2 text-[#0284C7] flex items-center justify-center">
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
              placeholder="Ingresa RUT (ej: 18.570.949-3)"
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
              className="btn-primary w-full sm:w-auto min-h-[48px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-base sm:text-lg tracking-wide disabled:opacity-40 disabled:pointer-events-none select-none active:scale-98 transition-all"
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

      <div className="mt-2.5 flex flex-wrap items-center justify-between text-xs text-slate-400 px-2 gap-2">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
          <span>Escribe con o sin puntos y presiona <strong>Buscar</strong> o <strong>Enter</strong></span>
        </span>

        {!isValid && rutInput.length > 7 && (
          <span className="text-[#EA580C] font-semibold">
            ⚠ Formato de RUT preliminar
          </span>
        )}
      </div>
    </div>
  );
}
