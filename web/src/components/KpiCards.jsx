import React, { useState } from 'react';
import { TrendingDown, TrendingUp, HelpCircle, Scale, ChevronDown, ChevronUp, Landmark, Coins } from 'lucide-react';
import { formatValue } from '../utils/constants';

export default function KpiCards({
  year,
  sector,
  unit,
  resumenFiscal,
  deudaPublica,
  marcoNormativo,
  macro,
  onOpenGlossaryWithCode
}) {
  const [showLegalRules, setShowLegalRules] = useState(false);

  const tr = resumenFiscal?.TR;
  const te = resumenFiscal?.TE;
  const b9 = resumenFiscal?.B9;
  const deuda = deudaPublica?.deuda_total;
  const intereses = deudaPublica?.intereses_anuales;
  const tipoInteres = deudaPublica?.tipo_interes_implicito_pct;

  const isDeficit = (b9?.mio_eur || 0) < 0;

  // Selector del valor según la unidad activa
  const getVal = (item) => {
    if (!item) return null;
    switch (unit) {
      case 'MIO_EUR': return item.mio_eur;
      case 'MIO_EUR_CONST': return item.mio_eur_const;
      case 'EUR_HAB': return item.eur_hab;
      case 'PC_GDP': return item.pc_gdp;
      default: return item.mio_eur;
    }
  };

  return (
    <div className="space-y-3 mb-2">
      {/* Grid de 5 Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* 1. Ingresos Totales (TR) */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-lg hover:border-slate-700 transition-all relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-300">1. Ingresos Totales (TR)</span>
            </div>
            <button
              onClick={() => onOpenGlossaryWithCode('TR')}
              className="text-slate-500 hover:text-blue-400 transition"
              title="Ver definición técnica y didáctica de Ingresos Totales"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="text-2xl font-black text-white mono-num tracking-tight mb-2">
            {formatValue(getVal(tr), unit)}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="font-mono text-emerald-400">{tr?.pc_gdp ? `${tr.pc_gdp.toFixed(1).replace('.', ',')} % PIB` : ''}</span>
            <span className="font-mono">{tr?.eur_hab ? `${Math.round(tr.eur_hab).toLocaleString('es-ES')} €/hab` : ''}</span>
          </div>
        </div>

        {/* 2. Gastos Totales (TE) */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-lg hover:border-slate-700 transition-all relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-500" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-slate-300">2. Gastos Totales (TE)</span>
            </div>
            <button
              onClick={() => onOpenGlossaryWithCode('TE')}
              className="text-slate-500 hover:text-blue-400 transition"
              title="Ver definición técnica y didáctica de Gastos Totales"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="text-2xl font-black text-white mono-num tracking-tight mb-2">
            {formatValue(getVal(te), unit)}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="font-mono text-blue-400">{te?.pc_gdp ? `${te.pc_gdp.toFixed(1).replace('.', ',')} % PIB` : ''}</span>
            <span className="font-mono">{te?.eur_hab ? `${Math.round(te.eur_hab).toLocaleString('es-ES')} €/hab` : ''}</span>
          </div>
        </div>

        {/* 3. Saldo Fiscal (B9 - Déficit / Superávit) */}
        <div className={`rounded-2xl p-4 border shadow-lg transition-all relative overflow-hidden group ${
          isDeficit
            ? 'bg-rose-950/30 border-rose-900/50 hover:border-rose-800'
            : 'bg-emerald-950/30 border-emerald-900/50 hover:border-emerald-800'
        }`}>
          <div className={`absolute top-0 left-0 right-0 h-1 ${
            isDeficit ? 'bg-gradient-to-r from-rose-500 to-red-600' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
          }`} />
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1.5">
            <div className="flex items-center gap-1.5">
              {isDeficit ? (
                <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              )}
              <span className={isDeficit ? 'text-rose-300 font-bold' : 'text-emerald-300 font-bold'}>
                {isDeficit ? '3. Déficit (B9)' : '3. Superávit (B9)'}
              </span>
            </div>
            <button
              onClick={() => onOpenGlossaryWithCode('B9')}
              className="text-slate-500 hover:text-blue-400 transition"
              title="Ver definición técnica de Saldo B.9"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className={`text-2xl font-black mono-num tracking-tight mb-2 ${
            isDeficit ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {formatValue(getVal(b9), unit)}
          </div>

          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
            <span className={isDeficit ? 'font-mono font-bold text-rose-400' : 'font-mono font-bold text-emerald-400'}>
              {b9?.pc_gdp ? `${b9.pc_gdp.toFixed(1).replace('.', ',')} % PIB` : ''}
            </span>
            <span className="font-mono text-slate-400">
              {isDeficit ? 'Necesidad fin.' : 'Capacidad fin.'}
            </span>
          </div>
        </div>

        {/* 4. Deuda Total PDE (Maastricht) */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-lg hover:border-slate-700 transition-all relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1.5">
            <div className="flex items-center gap-1.5">
              <Landmark className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-slate-300">4. Deuda Total (PDE)</span>
            </div>
            <button
              onClick={() => onOpenGlossaryWithCode('DEUDA_PDE_MAASTRICHT')}
              className="text-slate-500 hover:text-blue-400 transition"
              title="Ver definición de Deuda de Maastricht"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="text-2xl font-black text-white mono-num tracking-tight mb-2">
            {formatValue(getVal(deuda), unit)}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="font-mono font-bold text-purple-400">
              {deuda?.pc_gdp ? `${deuda.pc_gdp.toFixed(1).replace('.', ',')} % PIB` : ''}
            </span>
            <span className="font-mono">{deuda?.eur_hab ? `${Math.round(deuda.eur_hab).toLocaleString('es-ES')} €/hab` : ''}</span>
          </div>
        </div>

        {/* 5. Pago Anual de Intereses (GF0107) */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-lg hover:border-slate-700 transition-all relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1.5">
            <div className="flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-slate-300">5. Intereses Deuda</span>
            </div>
            <button
              onClick={() => onOpenGlossaryWithCode('INTERESES_DEUDA')}
              className="text-slate-500 hover:text-blue-400 transition"
              title="Ver coste financiero de los intereses de la deuda pública"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="text-2xl font-black text-white mono-num tracking-tight mb-2">
            {formatValue(getVal(intereses), unit)}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="font-mono text-amber-400 font-bold">
              {tipoInteres ? `Tipo: ${tipoInteres.toFixed(2)} %` : (intereses?.pc_gdp ? `${intereses.pc_gdp.toFixed(1)}% PIB` : 'Coste deuda')}
            </span>
            <span className="font-mono">{intereses?.eur_hab ? `${Math.round(intereses.eur_hab).toLocaleString('es-ES')} €/hab` : ''}</span>
          </div>
        </div>

      </div>

      {/* Banner Desplegable: Reglas Fiscales y Normativa Legal */}
      {marcoNormativo && (
        <div className="bg-slate-900 text-slate-200 rounded-xl px-4 py-2.5 text-xs border border-slate-800 shadow-md transition-all">
          <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setShowLegalRules(!showLegalRules)}>
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="font-bold text-slate-200">
                Reglas Fiscales y Marco Legal aplicable al sector ({sector}):
              </span>
              <span className="text-slate-400 hidden sm:inline">
                {marcoNormativo.ley_nacional || marcoNormativo.marco_legal || marcoNormativo.marco_constitucional || 'Normativa de Estabilidad'}
              </span>
            </div>
            <button className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-semibold ml-2">
              <span>{showLegalRules ? 'Ocultar reglas' : 'Ver límites legales de déficit y deuda'}</span>
              {showLegalRules ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

          {showLegalRules && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300 animate-fadeIn">
              <div className="space-y-1 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Objetivo de Deuda</span>
                <p className="font-bold text-white text-xs">
                  {marcoNormativo.limite_deuda_referencia_pct_pib 
                    ? `Límite: ${marcoNormativo.limite_deuda_referencia_pct_pib}% del PIB`
                    : (marcoNormativo.limite_deuda_ordinario_pct_ingresos 
                        ? `Límite Ordinario: ${marcoNormativo.limite_deuda_ordinario_pct_ingresos}% de ingresos`
                        : 'Equilibrio y Sostenibilidad Financiera')}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {marcoNormativo.marco_europeo || marcoNormativo.marco_legal || 'Criterios de Maastricht y Protocolo PDE'}
                </p>
              </div>

              <div className="space-y-1 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">Objetivo de Déficit</span>
                <p className="font-bold text-white text-xs">
                  {marcoNormativo.limite_deficit_referencia_pct_pib 
                    ? `Máximo: ${marcoNormativo.limite_deficit_referencia_pct_pib}% del PIB (PEC)`
                    : (marcoNormativo.regla_equilibrio || 'Equilibrio Presupuestario Obligatorio')}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {marcoNormativo.marco_constitucional || marcoNormativo.organo_coordinador || 'Art. 135 Constitución Española'}
                </p>
              </div>

              <div className="space-y-1 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Regla Operativa Vinculante</span>
                <p className="font-bold text-white text-xs leading-snug">
                  {marcoNormativo.regla_operativa || marcoNormativo.regla_superavit || 'Regla de gasto vinculada al PIB potencial'}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {marcoNormativo.mecanismos_liquidez || 'Control tutelado por Ministerio de Hacienda'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
