import React from 'react';
import { 
  Landmark, 
  Calendar, 
  Scale, 
  Building2, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  Info,
  MapPin,
  Sparkles
} from 'lucide-react';
import { SECTORS, UNITS } from '../utils/constants';

export default function Sidebar({
  tabs,
  activeTab,
  setActiveTab,
  year,
  setYear,
  availableYears,
  sector,
  setSector,
  unit,
  setUnit,
  modoAula,
  setModoAula,
  onOpenGlossary,
  onOpenGlossaryWithCode
}) {
  return (
    <aside className="w-72 xl:w-80 shrink-0 h-screen bg-slate-900 border-r border-slate-800 flex flex-col justify-between text-slate-100 z-30 select-none shadow-2xl">
      
      {/* 1. Header Superior del Sidebar / Branding */}
      <div className="p-4.5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25 text-white shrink-0">
            <Landmark className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm tracking-tight text-white truncate">
                Cuentas Públicas
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                SEC-2010
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              España • Fuentes Oficiales IGAE / Eurostat
            </p>
          </div>
        </div>
      </div>

      {/* 2. Cuerpo Scrollable: Pestañas + Controles */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-5">
        
        {/* Sección: Navegación de Pestañas */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2.5 mb-1.5 block">
            Módulos de Análisis
          </span>
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold ring-1 ring-blue-500'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                  title={tab.desc}
                >
                  <Icon className={`h-4 w-4 shrink-0 transition-transform ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sección: Controles Globales Permanentes */}
        <div className="pt-2 border-t border-slate-800/80 space-y-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2.5 block">
            Controles Globales
          </span>

          {/* Control 1: Año con selector y slider */}
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-400" />
                <span>Ejercicio Fiscal:</span>
              </div>
              <span className="font-mono font-bold text-blue-400 text-sm">{year}</span>
            </div>

            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs font-bold py-1.5 px-2.5 rounded-lg shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {availableYears.map((y) => (
                <option key={y} value={y} className="bg-slate-900 text-slate-100">
                  {y} {y === '2024' ? '★ (Cierre Oficial)' : ''}
                </option>
              ))}
            </select>

            <div className="pt-1 flex items-center gap-2">
              <input
                type="range"
                min={availableYears[0]}
                max={availableYears[availableYears.length - 1]}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
            </div>
          </div>

          {/* Control 2: Unidades de Magnitud */}
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-emerald-400" />
                <span>Unidad de Medida:</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {UNITS.map((u) => {
                const isActive = unit === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => setUnit(u.id)}
                    className={`px-2 py-1.5 text-xs font-semibold rounded-lg transition-all text-center truncate ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm font-bold ring-1 ring-blue-500'
                        : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-700/60 border border-slate-700/50'
                    }`}
                    title={u.label}
                  >
                    {u.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Control 3: Ámbito Institucional (SENSIBLE AL CONTEXTO: Solo en Pestañas 1 a 5) */}
          {activeTab !== 'territory' ? (
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Ámbito Institucional:</span>
                </div>
                <button
                  onClick={() => onOpenGlossaryWithCode(sector)}
                  className="text-slate-400 hover:text-blue-400 transition"
                  title="Ver detalles de este subsector"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </div>

              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs font-semibold py-1.5 px-2.5 rounded-lg shadow-inner focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer truncate"
              >
                {SECTORS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="bg-slate-800/30 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1 animate-fadeIn">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <MapPin className="h-3.5 w-3.5" />
                <span>Modo Territorial Activo</span>
              </div>
              <p className="leading-tight text-slate-400">
                Los selectores territoriales (CC.AA., Diputaciones y Municipios) se gestionan directamente en la vista central.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* 3. Footer Fijo del Sidebar: Modo Aula & Glosario */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/90 space-y-2">
        {/* Toggle Modo Aula Didáctico (OFF por defecto) */}
        <button
          onClick={() => setModoAula(!modoAula)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
            modoAula
              ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-200 border-amber-500/40 shadow-sm'
              : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Activar o desactivar notas y explicaciones adaptadas a Educación Secundaria"
        >
          <div className="flex items-center gap-2">
            <GraduationCap className={`h-4 w-4 ${modoAula ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>Modo Aula Didáctico</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            modoAula 
              ? 'bg-amber-400 text-slate-950 font-black' 
              : 'bg-slate-700 text-slate-400'
          }`}>
            {modoAula ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Botón Glosario Pedagógico */}
        <button
          onClick={onOpenGlossary}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 transition"
        >
          <BookOpen className="h-3.5 w-3.5 text-blue-400" />
          <span>Glosario Pedagógico</span>
        </button>

        <div className="pt-1 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-mono">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          <span>Auditado SEC-2010 • Eurostat / IGAE</span>
        </div>
      </div>

    </aside>
  );
}
