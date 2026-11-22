import React from 'react';
import { Calendar, Building2, Scale, Info, Layers, Sparkles } from 'lucide-react';
import { SECTORS, UNITS } from '../utils/constants';

export default function ControlBar({
  year,
  setYear,
  sector,
  setSector,
  unit,
  setUnit,
  modoAula,
  availableYears,
  onOpenGlossaryWithCode
}) {
  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Selector de Año: Dropdown y Slider */}
          <div className="flex items-center gap-3 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 pl-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>Año:</span>
            </div>

            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-white text-slate-800 text-sm font-bold py-1 px-3 rounded-lg border border-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y} {y === '2024' ? '★ (Último oficial)' : ''}
                </option>
              ))}
            </select>

            <div className="hidden lg:flex items-center gap-2 px-2">
              <input
                type="range"
                min={availableYears[0]}
                max={availableYears[availableYears.length - 1]}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-28 accent-blue-600 cursor-pointer h-1.5 bg-slate-300 rounded-lg"
              />
              <span className="text-xs font-mono font-bold text-blue-700">{year}</span>
            </div>
          </div>

          {/* Selector de Subsector Institucional */}
          <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80 flex-1 min-w-[280px]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 pl-2 shrink-0">
              <Building2 className="h-4 w-4 text-indigo-600" />
              <span>Ámbito:</span>
            </div>

            <div className="relative w-full">
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full bg-white text-slate-800 text-sm font-semibold py-1 px-3 rounded-lg border border-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer truncate"
              >
                {SECTORS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => onOpenGlossaryWithCode(sector)}
              className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-white transition"
              title="Ver definición técnica y de aula de este subsector"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>

          {/* Selector de Unidad de Medida */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80 shrink-0">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 pl-1.5 pr-1 shrink-0">
              <Scale className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Unidad:</span>
            </div>

            <div className="flex items-center gap-1">
              {UNITS.map((u) => {
                const isActive = unit === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => setUnit(u.id)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 ring-1 ring-blue-600'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                    title={u.label}
                  >
                    {u.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Banner contextual si Modo Aula está activado */}
        {modoAula && (
          <div className="mt-2.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600 shrink-0 animate-pulse" />
              <div>
                <strong className="font-semibold text-amber-950">Guía para el aula de Secundaria:</strong>{' '}
                <span>
                  {sector === 'S13' && 'Estás viendo el Total Nacional Consolidado. Se han eliminado las transferencias internas entre Estado, CC.AA. y Seguridad Social para no contar dos veces el dinero de los ciudadanos.'}
                  {sector === 'S1311' && 'Viendo la Administración Central (Gobierno de España, Ministerios, Ejército, Policía Nacional y Deuda Pública).'}
                  {sector === 'S1312' && 'Viendo las Comunidades Autónomas (gestoras de casi toda la Sanidad y los colegios/institutos públicos de Secundaria).'}
                  {sector === 'S1313' && 'Viendo los Ayuntamientos y Diputaciones (encargados de basuras, alumbrado público, agua y parques).'}
                  {sector === 'S1314' && 'Viendo los Fondos de la Seguridad Social (pago mensual de las pensiones de jubilación, viudedad y bajas laborales).'}
                </span>
              </div>
            </div>
            <button
              onClick={() => onOpenGlossaryWithCode(sector)}
              className="px-2 py-1 bg-amber-200/80 hover:bg-amber-300 text-amber-950 rounded-md font-medium text-[11px] shrink-0 transition"
            >
              Ficha didáctica
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
