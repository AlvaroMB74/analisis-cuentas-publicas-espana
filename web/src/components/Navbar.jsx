import React from 'react';
import { Landmark, GraduationCap, BookOpen, ShieldCheck, Download, Sparkles } from 'lucide-react';

export default function Navbar({ modoAula, setModoAula, onOpenGlossary }) {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
                Cuentas Públicas de España
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                SEC-2010
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Datos oficiales Eurostat / IGAE • Ingresos y Gastos Públicos Consolidados
            </p>
          </div>
        </div>

        {/* Actions & Modo Aula toggle */}
        <div className="flex items-center gap-3">
          {/* Switch Modo Aula */}
          <button
            onClick={() => setModoAula(!modoAula)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm ${
              modoAula
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-amber-500/25 ring-2 ring-amber-400/50'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
            title="Activar explicaciones claras adaptadas a Educación Secundaria con ejemplos cotidianos"
          >
            <GraduationCap className={`h-4 w-4 ${modoAula ? 'animate-bounce' : ''}`} />
            <span>Modo Aula {modoAula ? 'ACTIVADO' : 'Didáctico'}</span>
            <span className={`w-2 h-2 rounded-full ${modoAula ? 'bg-slate-950 animate-ping' : 'bg-slate-500'}`} />
          </button>

          {/* Glosario botón */}
          <button
            onClick={onOpenGlossary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition"
          >
            <BookOpen className="h-3.5 w-3.5 text-blue-400" />
            <span>Glosario Pedagógico</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[11px] font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Auditado 100% SEC-2010</span>
          </div>
        </div>
      </div>
    </header>
  );
}
