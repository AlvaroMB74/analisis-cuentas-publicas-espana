import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { ShieldCheck, HeartPulse, Briefcase, Users, AlertCircle, CheckCircle2, Scale, ArrowRight, Sparkles, Landmark, Building } from 'lucide-react';
import { COFOG_COLORS, REVENUE_COLORS, formatValue, formatRawNumber } from '../../utils/constants';

export default function SocialBalanceView({
  year,
  sector,
  unit,
  ingresos,
  cofog,
  resumenFiscal,
  sectorSeries,
  glosario,
  modoAula,
  onOpenGlossaryWithCode
}) {
  // Preset didáctico activo: 'desempleo', 'pensiones', 'sanidad', 'deuda', o 'custom'
  const [activePreset, setActivePreset] = useState('desempleo');

  // Estado para el Comparador Libre
  const [selectedIncomes, setSelectedIncomes] = useState(['COT_DESEMPLEO']);
  const [selectedExpenses, setSelectedExpenses] = useState(['GF1005']);

  const years = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => String(2000 + i));
  }, []);

  // Opciones de ingresos disponibles para comparar
  const availableIncomes = [
    { code: 'COT_COMUNES', label: 'Cotizaciones Comunes (Pensiones/Incapacidad)', category: 'Cotizaciones', color: '#8b5cf6' },
    { code: 'COT_DESEMPLEO', label: 'Cuota de Desempleo (SEPE)', category: 'Cotizaciones', color: '#06b6d4' },
    { code: 'COT_OTRAS', label: 'Otras Cotizaciones (AT, Formación, FOGASA)', category: 'Cotizaciones', color: '#10b981' },
    { code: 'D5REC', label: 'Impuestos Directos (IRPF y Sociedades)', category: 'Impuestos', color: '#6366f1' },
    { code: 'D2REC', label: 'Impuestos Indirectos (IVA y Especiales)', category: 'Impuestos', color: '#ec4899' },
    { code: 'D91REC', label: 'Impuestos sobre el Capital (Sucesiones)', category: 'Impuestos', color: '#84cc16' },
    { code: 'OTR_REC', label: 'Otros Ingresos (Tasas, Fondos UE, Rentas)', category: 'Otros', color: '#f59e0b' },
  ];

  // Opciones de gastos con granularidad de Nivel 2 explícita
  const availableExpenses = [
    // Subpartidas clave de Nivel 2
    { code: 'GF1005', label: 'GF1005 - Prestaciones y Subsidios por Desempleo', level: 'Nivel 2', color: '#0284c7' },
    { code: 'GF1002', label: 'GF1002 - Pensiones Contributivas de Jubilación', level: 'Nivel 2', color: '#0d9488' },
    { code: 'GF1001', label: 'GF1001 - Subsidios por Enfermedad e Incapacidad', level: 'Nivel 2', color: '#14b8a6' },
    { code: 'GF1003', label: 'GF1003 - Pensiones de Viudedad y Orfandad', level: 'Nivel 2', color: '#2dd4bf' },
    { code: 'GF0107', label: 'GF0107 - Intereses de la Deuda Pública', level: 'Nivel 2', color: '#94a3b8' },
    { code: 'GF0703', label: 'GF0703 - Servicios Hospitalarios (Sanidad)', level: 'Nivel 2', color: '#ef4444' },
    { code: 'GF0702', label: 'GF0702 - Atención Primaria y Centros de Salud', level: 'Nivel 2', color: '#f87171' },
    { code: 'GF0902', label: 'GF0902 - Educación Secundaria y Bachillerato', level: 'Nivel 2', color: '#2563eb' },
    { code: 'GF0901', label: 'GF0901 - Educación Preescolar y Primaria', level: 'Nivel 2', color: '#60a5fa' },
    // Grandes Divisiones Nivel 1
    { code: 'GF07', label: 'GF07 - Salud (Sanidad Pública Total)', level: 'Nivel 1', color: '#dc2626' },
    { code: 'GF09', label: 'GF09 - Educación (Gasto Total)', level: 'Nivel 1', color: '#1d4ed8' },
    { code: 'GF04', label: 'GF04 - Asuntos Económicos e Infraestructuras', level: 'Nivel 1', color: '#f59e0b' },
  ];

  // Manejadores de los presets con granularidad fina
  const handleSelectPreset = (presetKey) => {
    setActivePreset(presetKey);
    if (presetKey === 'desempleo') {
      setSelectedIncomes(['COT_DESEMPLEO']);
      setSelectedExpenses(['GF1005']);
    } else if (presetKey === 'pensiones') {
      setSelectedIncomes(['COT_COMUNES']);
      setSelectedExpenses(['GF1002', 'GF1001', 'GF1003']);
    } else if (presetKey === 'sanidad') {
      setSelectedIncomes(['D5REC', 'D2REC']);
      setSelectedExpenses(['GF0703', 'GF0702']);
    } else if (presetKey === 'deuda') {
      setSelectedIncomes(['D5REC']);
      setSelectedExpenses(['GF0107']);
    }
  };

  // Toggle en comparador libre
  const toggleIncome = (code) => {
    setActivePreset('custom');
    if (selectedIncomes.includes(code)) {
      if (selectedIncomes.length > 1) setSelectedIncomes(selectedIncomes.filter((c) => c !== code));
    } else {
      setSelectedIncomes([...selectedIncomes, code]);
    }
  };

  const toggleExpense = (code) => {
    setActivePreset('custom');
    if (selectedExpenses.includes(code)) {
      if (selectedExpenses.length > 1) setSelectedExpenses(selectedExpenses.filter((c) => c !== code));
    } else {
      setSelectedExpenses([...selectedExpenses, code]);
    }
  };

  // Cálculos del año seleccionado para el comparador activo
  const { totalIncomesVal, totalExpensesVal, balanceSaldo, coveragePct } = useMemo(() => {
    let inc = 0;
    selectedIncomes.forEach((code) => {
      const item = ingresos?.[code];
      inc += formatRawNumber(item?.[unit.toLowerCase()] ?? item?.mio_eur, unit);
    });

    let exp = 0;
    selectedExpenses.forEach((code) => {
      let item = cofog?.grupos?.[code] || cofog?.divisiones?.[code];
      exp += formatRawNumber(item?.[unit.toLowerCase()] ?? item?.mio_eur, unit);
    });

    const saldo = inc - exp;
    const cov = exp > 0 ? (inc / exp) * 100 : null;

    return {
      totalIncomesVal: inc,
      totalExpensesVal: exp,
      balanceSaldo: saldo,
      coveragePct: cov
    };
  }, [ingresos, cofog, selectedIncomes, selectedExpenses, unit]);

  // Serie temporal comparativa de la selección (2000-2024)
  const comparisonChartOption = useMemo(() => {
    if (!sectorSeries) return null;

    const incomeTime = [];
    const expenseTime = [];
    const balanceTime = [];

    years.forEach((y) => {
      let incYear = 0;
      const ingObj = sectorSeries.ingresos_desglose?.[y];
      selectedIncomes.forEach((code) => {
        const it = ingObj?.[code];
        incYear += formatRawNumber(it?.[unit.toLowerCase()] ?? it?.mio_eur, unit);
      });

      let expYear = 0;
      const cofObj = sectorSeries.gastos_cofog?.[y];
      selectedExpenses.forEach((code) => {
        const it = cofObj?.grupos?.[code] || cofObj?.divisiones?.[code];
        expYear += formatRawNumber(it?.[unit.toLowerCase()] ?? it?.mio_eur, unit);
      });

      incomeTime.push(incYear);
      expenseTime.push(expYear);
      balanceTime.push(incYear - expYear);
    });

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontSize: 13 },
        formatter: (params) => {
          let str = `<strong>Año ${params[0].name}</strong><br/>`;
          params.forEach((p) => {
            str += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:${p.color};"></span>
              ${p.seriesName}: <strong>${formatValue(p.value, unit)}</strong><br/>`;
          });
          const saldo = (params[0]?.value || 0) - (params[1]?.value || 0);
          str += `<div class="mt-1 pt-1 border-t border-slate-700 text-xs">
            Saldo de la Balanza: <strong class="${saldo >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${formatValue(saldo, unit)}</strong>
          </div>`;
          return str;
        }
      },
      legend: {
        data: ['Ingresos Seleccionados', 'Gastos Seleccionados', 'Saldo Neto (Superávit/Déficit)'],
        top: 0,
        textStyle: { color: '#334155', fontWeight: 600 }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '8%',
        top: '14%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: years,
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisLabel: { color: '#64748b', fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
        axisLabel: {
          color: '#64748b',
          formatter: (v) => formatValue(v, unit)
        }
      },
      series: [
        {
          name: 'Ingresos Seleccionados',
          type: 'line',
          smooth: true,
          data: incomeTime,
          itemStyle: { color: '#10b981' },
          lineStyle: { width: 3 },
          symbol: 'circle',
          symbolSize: 5
        },
        {
          name: 'Gastos Seleccionados',
          type: 'line',
          smooth: true,
          data: expenseTime,
          itemStyle: { color: '#2563eb' },
          lineStyle: { width: 3 },
          symbol: 'circle',
          symbolSize: 5
        },
        {
          name: 'Saldo Neto (Superávit/Déficit)',
          type: 'bar',
          data: balanceTime,
          itemStyle: {
            color: (params) => (params.value >= 0 ? '#059669' : '#f43f5e'),
            borderRadius: [4, 4, 0, 0]
          }
        }
      ]
    };
  }, [sectorSeries, years, selectedIncomes, selectedExpenses, unit]);

  return (
    <div className="space-y-6">
      
      {/* SECCIÓN 1: Presets Didácticos para el Aula con Granularidad Fina */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-4">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Scale className="h-5 w-5 text-indigo-600" />
              <span>Balanza de Servicios y Seguros Sociales ({year})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Descubre qué servicios se pagan con cotizaciones finalistas y cuáles se sostienen con los impuestos generales de todos.
            </p>
          </div>
        </div>

        {/* 4 Botones de Presets Didácticos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          
          {/* Preset 1: Desempleo */}
          <button
            onClick={() => handleSelectPreset('desempleo')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activePreset === 'desempleo'
                ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-slate-800/60/70 border-slate-800 hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-white text-xs mb-1">
              <Briefcase className="h-4 w-4 text-blue-600" />
              <span>1. Balanza del Desempleo</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Cuota de Desempleo vs <strong>GF1005 (Prestaciones SEPE)</strong>.
            </p>
          </button>

          {/* Preset 2: Pensiones */}
          <button
            onClick={() => handleSelectPreset('pensiones')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activePreset === 'pensiones'
                ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-500/20 shadow-xs'
                : 'bg-slate-800/60/70 border-slate-800 hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-white text-xs mb-1">
              <Users className="h-4 w-4 text-purple-600" />
              <span>2. Balanza de Pensiones</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Cot. Comunes vs <strong>GF1002 (Jubilación) + GF1001 + GF1003</strong>.
            </p>
          </button>

          {/* Preset 3: Sanidad Desmitificador */}
          <button
            onClick={() => handleSelectPreset('sanidad')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activePreset === 'sanidad'
                ? 'bg-rose-50/80 border-rose-400 ring-2 ring-rose-500/20 shadow-xs'
                : 'bg-slate-800/60/70 border-slate-800 hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-white text-xs mb-1">
              <HeartPulse className="h-4 w-4 text-rose-600" />
              <span>3. Sanidad: Hospitales y Primaria</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              <strong>GF0703 (Hospitales) + GF0702</strong> vs Impuestos (0€ cotizaciones).
            </p>
          </button>

          {/* Preset 4: Deuda Pública */}
          <button
            onClick={() => handleSelectPreset('deuda')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activePreset === 'deuda'
                ? 'bg-slate-800 border-slate-500 ring-2 ring-slate-400/20 shadow-xs'
                : 'bg-slate-800/60/70 border-slate-800 hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-white text-xs mb-1">
              <Landmark className="h-4 w-4 text-slate-200" />
              <span>4. Carga de la Deuda</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              <strong>GF0107 (Intereses Deuda)</strong> frente a la recaudación de IRPF/Soc.
            </p>
          </button>

        </div>

        {/* Banners Pedagógicos Contextuales */}
        {activePreset === 'desempleo' && (
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 text-xs space-y-2 mb-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-2 text-sm text-blue-900">
                <Briefcase className="h-4 w-4 text-blue-600" />
                Balanza Específica del Seguro de Desempleo (GF1005)
              </span>
              <button
                onClick={() => onOpenGlossaryWithCode('COT_DESEMPLEO')}
                className="text-blue-700 underline font-semibold text-[11px]"
              >
                Ver ficha técnica
              </button>
            </div>
            <p className="leading-relaxed">
              Enfrenta la cuota finalista de desempleo de las nóminas frente al gasto en <strong>GF1005 (Prestaciones y subsidios por desempleo del SEPE)</strong>. En {year}, la cobertura es del <strong>{coveragePct?.toFixed(1)}%</strong> generando un saldo de <strong>{formatValue(balanceSaldo, unit)}</strong>.
            </p>
          </div>
        )}

        {activePreset === 'pensiones' && (
          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-950 text-xs space-y-2 mb-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-2 text-sm text-purple-900">
                <Users className="h-4 w-4 text-purple-600" />
                La Brecha Contributiva de Jubilación (GF1002), Incapacidad (GF1001) y Supervivientes (GF1003)
              </span>
              <button
                onClick={() => onOpenGlossaryWithCode('COT_COMUNES')}
                className="text-purple-700 underline font-semibold text-[11px]"
              >
                Ver ficha técnica
              </button>
            </div>
            <p className="leading-relaxed">
              Las cotizaciones por contingencias comunes solo cubren el <strong>{coveragePct?.toFixed(1)}%</strong> del gasto real en pensiones contributivas de jubilación y supervivencia. La brecha (más de <strong>{formatValue(Math.abs(balanceSaldo), unit)}</strong>) la transfiere el Estado de los impuestos generales de todos.
            </p>
          </div>
        )}

        {activePreset === 'sanidad' && (
          <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-950 text-xs space-y-2 mb-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-2 text-sm text-rose-900">
                <HeartPulse className="h-4 w-4 text-rose-600" />
                Desmitificador para el Aula: Hospitales (GF0703) y Primaria (GF0702)
              </span>
              <button
                onClick={() => onOpenGlossaryWithCode('SEP_FUENTES')}
                className="text-rose-700 underline font-semibold text-[11px]"
              >
                Ver principio institucional
              </button>
            </div>
            <p className="leading-relaxed">
              <strong>Hecho contable demostrado:</strong> Los hospitales (GF0703) y centros de salud (GF0702) reciben <strong>0 euros de cotizaciones de nóminas</strong>. Se financian en su totalidad mediante los impuestos directos e indirectos (IRPF, IVA y tributos cedidos a las CC.AA.) desde la reforma de los Pactos de Toledo.
            </p>
          </div>
        )}

        {activePreset === 'deuda' && (
          <div className="p-4 rounded-xl bg-slate-800 border border-slate-300 text-white text-xs space-y-2 mb-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-2 text-sm text-slate-100">
                <Landmark className="h-4 w-4 text-slate-200" />
                Intereses de la Deuda Pública (GF0107)
              </span>
              <button
                onClick={() => onOpenGlossaryWithCode('GF0107')}
                className="text-blue-700 underline font-semibold text-[11px]"
              >
                Ver ficha técnica GF0107
              </button>
            </div>
            <p className="leading-relaxed">
              Cada año, España debe pagar miles de millones de euros exclusivamente en <strong>intereses netos (GF0107)</strong> a los tenedores de Bonos y Letras del Tesoro, absorbiendo una fracción sustancial de lo recaudado por el IRPF o el Impuesto sobre Sociedades.
            </p>
          </div>
        )}

        {/* Tarjetas de Métricas de la Balanza Activa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Ingresos Seleccionados
            </span>
            <div className="text-xl font-bold text-emerald-600 mono-num">
              {formatValue(totalIncomesVal, unit)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Gastos Seleccionados
            </span>
            <div className="text-xl font-bold text-blue-600 mono-num">
              {formatValue(totalExpensesVal, unit)}
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${
            balanceSaldo >= 0 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
          }`}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Saldo Neto de la Balanza
            </span>
            <div className={`text-xl font-bold mono-num ${
              balanceSaldo >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              {formatValue(balanceSaldo, unit)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Tasa de Cobertura
            </span>
            <div className="text-xl font-bold text-slate-100 mono-num">
              {coveragePct !== null ? `${coveragePct.toFixed(1).replace('.', ',')} %` : 'N/D'}
            </div>
          </div>

        </div>

      </div>

      {/* SECCIÓN 2: Comparador Enfrentado Libre con Granularidad de Nivel 2 */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xs space-y-4">
        
        <div className="pb-3 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Comparador Libre de Sostenibilidad (2000 - 2024)</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Selecciona subpartidas de Nivel 2 (ej. <strong>GF0107 Intereses Deuda</strong> o <strong>GF0703 Hospitales</strong>) para contrastarlas frente a fuentes de ingreso concretas.
            </p>
          </div>
        </div>

        {/* Dos Columnas de Checkboxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          {/* Columna Ingresos */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800">
            <strong className="block font-bold text-slate-100 mb-2 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Seleccionar Ingresos a Computar:
            </strong>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {availableIncomes.map((item) => {
                const isChecked = selectedIncomes.includes(item.code);
                return (
                  <label
                    key={item.code}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-700/50 cursor-pointer transition select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleIncome(item.code)}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="font-mono font-bold text-slate-200">{item.code}</span>
                    <span className="text-slate-300 truncate">{item.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Columna Gastos con Subpartidas Nivel 2 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800">
            <strong className="block font-bold text-slate-100 mb-2 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              Seleccionar Gastos a Computar (Nivel 1 y Nivel 2):
            </strong>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {availableExpenses.map((item) => {
                const isChecked = selectedExpenses.includes(item.code);
                const isL2 = item.level === 'Nivel 2';
                return (
                  <label
                    key={item.code}
                    className={`flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-700/50 cursor-pointer transition select-none ${
                      isL2 ? 'bg-slate-900/90 border border-slate-800/60' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleExpense(item.code)}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="font-mono font-bold text-slate-200">{item.code}</span>
                    <span className="text-slate-300 truncate flex-1">{item.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      isL2 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-200'
                    }`}>
                      {item.level}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

        </div>

        {/* Gráfico Comparativo Temporal de la Balanza */}
        <div className="h-[400px] w-full pt-2">
          {comparisonChartOption && (
            <ReactECharts
              option={comparisonChartOption}
              style={{ height: '100%', width: '100%' }}
              notMerge={true}
            />
          )}
        </div>

      </div>

    </div>
  );
}
