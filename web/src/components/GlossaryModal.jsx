import React from 'react';
import { X, BookOpen, GraduationCap, Network, Check, ExternalLink } from 'lucide-react';

export default function GlossaryModal({ isOpen, onClose, item, glosario }) {
  if (!isOpen || !item) return null;

  // Buscar en el glosario completo
  const code = item.codigo || item.id || item;
  let entry = null;

  if (glosario) {
    if (glosario.subsectores && glosario.subsectores[code]) entry = glosario.subsectores[code];
    else if (glosario.ingresos_y_saldos && glosario.ingresos_y_saldos[code]) entry = glosario.ingresos_y_saldos[code];
    else if (glosario.cofog_divisiones && glosario.cofog_divisiones[code]) entry = glosario.cofog_divisiones[code];
    else if (glosario.cofog_grupos && glosario.cofog_grupos[code]) entry = glosario.cofog_grupos[code];
  }

  // Fallback si no está directamente
  if (!entry) {
    entry = {
      codigo: code,
      nombre_corto: item.nombre_corto || item.name || code,
      definicion_tecnica: item.definicion_tecnica || 'Definición oficial SEC-2010 registrada en la contabilidad nacional.',
      explicacion_aula: item.explicacion_aula || 'Partida de gasto o ingreso de las administraciones públicas.',
      nota_consolidacion: item.nota_consolidacion || 'Flujo consolidado dentro del sector de Administraciones Públicas.'
    };
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="bg-slate-900/90 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-800 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-lg">
              {entry.codigo}
            </span>
            <h3 className="font-bold text-lg text-white">
              {entry.nombre_corto}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido Didáctico */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Explicación de Aula (Destacada en primer lugar para Secundaria) */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-2">
              <GraduationCap className="h-5 w-5 text-amber-600" />
              <span>¿Qué significa esto para ti? (Explicación para el Aula)</span>
            </div>
            <p className="text-amber-950 text-sm leading-relaxed">
              {entry.explicacion_aula}
            </p>
          </div>

          {/* Definición Técnica Oficial SEC-2010 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-100 font-bold text-sm mb-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span>Definición Técnica Oficial (Manual SEC-2010 / IGAE)</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed font-normal">
              {entry.definicion_tecnica}
            </p>
          </div>

          {/* Nota de Consolidación Contable */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-2">
              <Network className="h-4 w-4 text-blue-600" />
              <span>¿Por qué este dato está consolidado? (Sin doble cómputo)</span>
            </div>
            <p className="text-blue-950 text-xs leading-relaxed">
              {entry.nota_consolidacion}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-800/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Fuente: Eurostat / IGAE • Sistema Europeo de Cuentas Nacionales</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
