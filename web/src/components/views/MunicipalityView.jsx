import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import rawAyuntamientosData from '../../data/cuentas_ayuntamientos_consolidadas.json';
import { formatValue } from '../../utils/constants';
import { 
  Building2, 
  Search, 
  MapPin, 
  Users, 
  Wallet, 
  PiggyBank, 
  ArrowRight, 
  Scale, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  HelpCircle, 
  ArrowUpDown, 
  Flame, 
  Lightbulb, 
  Trash2, 
  Home, 
  Car, 
  Landmark, 
  CheckCircle2, 
  Compass, 
  Filter,
  BarChart3,
  Layers
} from 'lucide-react';

export default function MunicipalityView({
  year,
  modoAula,
  onNavigateToLevel,
  onOpenGlossaryWithCode
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIne, setSelectedIne] = useState('28079'); // Default Madrid
  const [compareIne, setCompareIne] = useState('08019');  // Default Barcelona para comparar
  const [localUnit, setLocalUnit] = useState('EUR_HAB'); // 'EUR_HAB' | 'MIO_EUR' | 'MIO_EUR_CONST'
  
  // Filtros en cascada
  const [filterCcaa, setFilterCcaa] = useState('TODAS');
  const [filterTipo, setFilterTipo] = useState('TODOS');

  // Catálogo completo de municipios
  const allMunicipios = useMemo(() => {
    if (!rawAyuntamientosData?.municipios) return [];
    return Object.values(rawAyuntamientosData.municipios).map((m) => m.info);
  }, []);

  // Lista de CC.AA. para el filtro en cascada
  const ccaaList = useMemo(() => {
    const setCcaa = new Set(allMunicipios.map((m) => m.ccaa_nombre));
    return ['TODAS', ...Array.from(setCcaa).sort()];
  }, [allMunicipios]);

  // Municipios filtrados por búsqueda y selectores
  const filteredMunicipios = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allMunicipios.filter((m) => {
      const matchQuery = 
        !query ||
        m.nombre.toLowerCase().includes(query) ||
        m.codigo_postal.includes(query) ||
        m.codigo_ine.includes(query) ||
        m.provincia_nombre.toLowerCase().includes(query);

      const matchCcaa = filterCcaa === 'TODAS' || m.ccaa_nombre === filterCcaa;
      const matchTipo = filterTipo === 'TODOS' || 
        (filterTipo === 'gran_ciudad' && m.tipo_municipio === 'gran_ciudad') ||
        (filterTipo === 'turistico' && m.es_turistico) ||
        (filterTipo === 'pequeno' && m.tipo_municipio === 'municipio_pequeno');

      return matchQuery && matchCcaa && matchTipo;
    });
  }, [allMunicipios, searchQuery, filterCcaa, filterTipo]);

  // Municipio activo
  const currentMunData = useMemo(() => {
    return rawAyuntamientosData?.municipios?.[selectedIne] || null;
  }, [selectedIne]);

  // Municipio de comparación
  const compareMunData = useMemo(() => {
    return rawAyuntamientosData?.municipios?.[compareIne] || null;
  }, [compareIne]);

  // Medias nacionales del año
  const mediasNacionales = useMemo(() => {
    return rawAyuntamientosData?.medias_referencia?.[year] || {
      gasto_medio_hab: 1425.8,
      ingreso_medio_hab: 1465.1,
      ibi_medio_hab: 521.6,
      limpieza_media_hab: 251.5,
      deuda_media_hab: 349.6,
      autonomia_fiscal_media_pct: 61.5
    };
  }, [year]);

  // Helper para extraer la métrica según la unidad activa
  const getMetric = (pack, fallback = 0) => {
    if (!pack) return fallback;
    if (localUnit === 'EUR_HAB') return pack.eur_hab ?? fallback;
    if (localUnit === 'MIO_EUR_CONST') return pack.mio_eur_const ?? fallback;
    return pack.mio_eur ?? fallback;
  };

  // Series del año seleccionado para el municipio activo
  const sYear = useMemo(() => {
    return currentMunData?.series?.[year] || {};
  }, [currentMunData, year]);

  const sCompare = useMemo(() => {
    return compareMunData?.series?.[year] || {};
  }, [compareMunData, year]);

  const info = currentMunData?.info || {};
  const rf = sYear.resumen_fiscal || {};
  const inc = sYear.ingresos_capitulos || {};
  const exp = sYear.gastos_capitulos || {};
  const salud = sYear.salud_financiera || {};

  const curTR = getMetric(rf.TR);
  const curTE = getMetric(rf.TE);
  const curB9 = getMetric(rf.B9);
  const curCoverage = rf.tasa_cobertura_pct || 100.0;
  const curTipoSaldo = rf.tipo_saldo || 'SUPERÁVIT';

  const curDeuda = getMetric(salud.deuda_viva_bancaria);
  const curDeudaRatio = salud.ratio_deuda_sobre_ingresos_pct || 0;
  const curRemanente = getMetric(salud.remanente_tesoreria_gastos_generales);

  // ==========================================
  // GRÁFICO 1: Cuenta de Resultados - Origen de Ingresos (Donut ECharts)
  // ==========================================
  const ingresosDonutOption = useMemo(() => {
    const det = inc.detalle_tributario || {};
    return {
      title: {
        text: `Estructura de Ingresos: ${info.nombre || 'Municipio'}`,
        subtext: `Autonomía fiscal: ${inc.autonomia_fiscal_pct || 65}% de ingresos propios`,
        left: 'center',
        top: 0,
        textStyle: { fontSize: 14, fontWeight: '700', color: '#f8fafc' },
        subtextStyle: { fontSize: 11, color: '#94a3b8' }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          return `
            <div class="font-bold border-b border-slate-700 pb-1 mb-1">${params.name}</div>
            <div class="text-xs text-slate-300">
              <p>Importe en ${localUnit}: <strong class="text-amber-400 font-mono">${formatValue(params.value, localUnit)}</strong></p>
              <p>Porcentaje sobre total: <strong>${params.percent}%</strong></p>
            </div>
          `;
        }
      },
      legend: { bottom: 0, icon: 'circle' },
      series: [
        {
          name: 'Ingresos',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, formatter: '{b}: {d}%', fontSize: 10 },
          data: [
            { value: getMetric(det.ibi_urbana), name: 'IBI (Urbana)', itemStyle: { color: '#3b82f6' } },
            { value: getMetric(det.ivtm_vehiculos), name: 'IVTM (Coche)', itemStyle: { color: '#6366f1' } },
            { value: getMetric(det.plusvalia_iivtnu), name: 'Plusvalía / IAE', itemStyle: { color: '#8b5cf6' } },
            { value: getMetric(det.tasa_basuras_rsu), name: 'Tasa Basuras RSU', itemStyle: { color: '#10b981' } },
            { value: getMetric(det.tasa_vados_terrazas), name: 'Vados y Terrazas', itemStyle: { color: '#14b8a6' } },
            { value: getMetric(det.pte_participacion_estado), name: 'PTE (Estado PIE)', itemStyle: { color: '#f59e0b' } },
            { value: getMetric(det.subvenciones_ccaa), name: 'Subvenciones CCAA', itemStyle: { color: '#ec4899' } }
          ]
        }
      ]
    };
  }, [info, inc, localUnit]);

  // ==========================================
  // GRÁFICO 2: Cuenta de Resultados - Destino del Gasto (Barras ECharts)
  // ==========================================
  const gastosBarrasOption = useMemo(() => {
    const detServ = exp.detalle_servicios || {};
    return {
      title: {
        text: `¿En qué gasta el Ayuntamiento de ${info.nombre || 'Municipio'}?`,
        subtext: `Gasto operativo, servicios y obras públicas (${year})`,
        left: 'center',
        top: 0,
        textStyle: { fontSize: 14, fontWeight: '700', color: '#f8fafc' },
        subtextStyle: { fontSize: 11, color: '#94a3b8' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#0f172a',
        textStyle: { color: '#f8fafc', fontSize: 12 },
        formatter: (params) => {
          return `
            <div class="font-bold border-b border-slate-700 pb-1 mb-1">${params[0].name}</div>
            <p class="text-xs">Importe en ${localUnit}: <strong class="text-amber-400 font-mono">${formatValue(params[0].value, localUnit)}</strong></p>
          `;
        }
      },
      grid: { top: 60, left: '3%', right: '5%', bottom: 30, containLabel: true },
      xAxis: {
        type: 'category',
        data: ['Personal / Policía', 'Limpieza y Basuras', 'Alumbrado y Luz', 'Parques y Vías', 'Inversiones (Obras)', 'Colegios (Mant.)', 'Gastos Financieros'],
        axisLabel: { interval: 0, rotate: 15, fontSize: 10, color: '#334155' }
      },
      yAxis: { type: 'value', splitLine: { lineStyle: { stroke: '#e2e8f0', type: 'dashed' } } },
      series: [
        {
          name: 'Gasto Municipal',
          type: 'bar',
          barMaxWidth: 38,
          itemStyle: { borderRadius: [5, 5, 0, 0] },
          data: [
            { value: getMetric(exp.cap1_personal), itemStyle: { color: '#2563eb' } },
            { value: getMetric(detServ.limpieza_recogida_basuras), itemStyle: { color: '#10b981' } },
            { value: getMetric(detServ.alumbrado_electricidad), itemStyle: { color: '#f59e0b' } },
            { value: getMetric(detServ.parques_vias_publicas), itemStyle: { color: '#14b8a6' } },
            { value: getMetric(exp.cap6_inversiones_reales), itemStyle: { color: '#8b5cf6' } },
            { value: getMetric(detServ.mantenimiento_colegios), itemStyle: { color: '#06b6d4' } },
            { value: getMetric(exp.cap3_gastos_financieros), itemStyle: { color: '#ef4444' } }
          ]
        }
      ]
    };
  }, [info, exp, year, localUnit]);

  // ==========================================
  // GRÁFICO 3: Comparador Municipal (€/hab)
  // ==========================================
  const comparadorOption = useMemo(() => {
    const compName = compareMunData?.info?.nombre || 'Comparativa';
    const compDetInc = sCompare?.ingresos_capitulos?.detalle_tributario || {};
    const compDetExp = sCompare?.gastos_capitulos?.detalle_servicios || {};
    const curDetInc = inc?.detalle_tributario || {};
    const curDetExp = exp?.detalle_servicios || {};

    const categories = ['Gasto Total', 'IBI (Urbana)', 'Limpieza / Basuras', 'Personal', 'Inversiones (Obras)', 'Deuda Bancaria'];
    
    // Valores en €/hab
    const curValues = [
      rf.TE?.eur_hab || 0,
      curDetInc.ibi_urbana?.eur_hab || 0,
      curDetExp.limpieza_recogida_basuras?.eur_hab || 0,
      exp.cap1_personal?.eur_hab || 0,
      exp.cap6_inversiones_reales?.eur_hab || 0,
      salud.deuda_viva_bancaria?.eur_hab || 0
    ];

    const compValues = [
      sCompare?.resumen_fiscal?.TE?.eur_hab || 0,
      compDetInc.ibi_urbana?.eur_hab || 0,
      compDetExp.limpieza_recogida_basuras?.eur_hab || 0,
      sCompare?.gastos_capitulos?.cap1_personal?.eur_hab || 0,
      sCompare?.gastos_capitulos?.cap6_inversiones_reales?.eur_hab || 0,
      sCompare?.salud_financiera?.deuda_viva_bancaria?.eur_hab || 0
    ];

    const mediaValues = [
      mediasNacionales.gasto_medio_hab,
      mediasNacionales.ibi_medio_hab,
      mediasNacionales.limpieza_media_hab,
      510.0, // Media personal
      220.0, // Media inversiones
      mediasNacionales.deuda_media_hab
    ];

    return {
      title: {
        text: `Duelo Municipal en Euros por Habitante (€/hab)`,
        subtext: `${info.nombre} vs ${compName} vs Media Nacional (${year})`,
        left: 'center',
        top: 0,
        textStyle: { fontSize: 14, fontWeight: '700', color: '#f8fafc' },
        subtextStyle: { fontSize: 11, color: '#94a3b8' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#0f172a',
        textStyle: { color: '#f8fafc', fontSize: 12 },
        formatter: (params) => {
          let str = `<div class="font-bold border-b border-slate-700 pb-1 mb-1">${params[0].name}</div>`;
          params.forEach((p) => {
            str += `
              <div class="flex items-center justify-between gap-4 py-0.5 text-xs">
                <span style="color:${p.color}">● ${p.seriesName}:</span>
                <strong class="font-mono">${p.value} €/hab</strong>
              </div>
            `;
          });
          return str;
        }
      },
      legend: { bottom: 0, icon: 'roundRect' },
      grid: { top: 60, left: '3%', right: '4%', bottom: 35, containLabel: true },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { interval: 0, rotate: 12, fontSize: 10, color: '#334155' }
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: '{value} €' },
        splitLine: { lineStyle: { stroke: '#e2e8f0', type: 'dashed' } }
      },
      series: [
        {
          name: info.nombre,
          type: 'bar',
          data: curValues,
          itemStyle: { color: '#2563eb', borderRadius: [4, 4, 0, 0] }
        },
        {
          name: compName,
          type: 'bar',
          data: compValues,
          itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] }
        },
        {
          name: 'Media Nacional Ayuntamientos',
          type: 'bar',
          data: mediaValues,
          itemStyle: { color: '#94a3b8', borderRadius: [4, 4, 0, 0] }
        }
      ]
    };
  }, [info, compareMunData, sCompare, inc, exp, rf, salud, mediasNacionales, year]);

  return (
    <div className="space-y-6">
      {/* 1. Barra de Búsqueda Inteligente y Filtros en Cascada */}
      <div className="bg-slate-900/90 p-4.5 rounded-2xl border border-slate-800 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Input Buscador con Autocompletado */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por municipio, código postal o INE..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-100 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-hidden transition"
            />
          </div>

          {/* Filtros en Cascada (CC.AA. y Tipología) */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={filterCcaa}
                onChange={(e) => setFilterCcaa(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-hidden"
              >
                {ccaaList.map((c) => (
                  <option key={c} value={c}>{c === 'TODAS' ? 'Todas las CC.AA.' : c}</option>
                ))}
              </select>
            </div>

            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-hidden"
            >
              <option value="TODOS">Todos los tamaños</option>
              <option value="gran_ciudad">Grandes ciudades (más de 100k)</option>
              <option value="turistico">Municipios turísticos</option>
              <option value="pequeno">Municipios pequeños (menos de 20k)</option>
            </select>

            {/* Selector de Unidad */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-800">
              {['EUR_HAB', 'MIO_EUR'].map((u) => (
                <button
                  key={u}
                  onClick={() => setLocalUnit(u)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                    localUnit === u ? 'bg-white text-white shadow-xs' : 'text-slate-300'
                  }`}
                >
                  {u === 'EUR_HAB' ? '€/hab' : 'M€'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista horizontal scrolleable de municipios filtrados */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Sugerencias:</span>
          {filteredMunicipios.slice(0, 12).map((m) => {
            const isSelected = m.codigo_ine === selectedIne;
            return (
              <button
                key={m.codigo_ine}
                onClick={() => {
                  setSelectedIne(m.codigo_ine);
                  setSearchQuery('');
                }}
                className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                <span>{m.nombre}</span>
                <span className={`text-[10px] ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                  ({m.provincia_nombre})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Cabecera y Ficha del Municipio Seleccionado con Breadcrumbs */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
        {/* Breadcrumb de Jerarquía Territorial */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-400">España (S.13)</span>
            <span>/</span>
            <button
              onClick={() => onNavigateToLevel && onNavigateToLevel('ccaa', info.ccaa_code)}
              className="hover:text-blue-600 font-semibold transition flex items-center gap-1"
            >
              <Compass className="h-3 w-3 text-amber-500" />
              <span>{info.ccaa_nombre} (Nivel 2)</span>
            </button>
            <span>/</span>
            <button
              onClick={() => onNavigateToLevel && onNavigateToLevel('diputaciones', info.provincia_code)}
              className="hover:text-blue-600 font-semibold transition flex items-center gap-1"
            >
              <Landmark className="h-3 w-3 text-blue-500" />
              <span>Diputación de {info.provincia_nombre} (Nivel 3)</span>
            </button>
            <span>/</span>
            <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded-md">
              Ayuntamiento de {info.nombre} (Nivel 4)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">INE: {info.codigo_ine}</span>
            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">CP: {info.codigo_postal}</span>
            <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded">
              {info.es_turistico ? '🏝️ Municipio Turístico' : (info.tipo_municipio === 'gran_ciudad' ? '🏙️ Gran Ciudad' : '🏡 Ciudad Mediana')}
            </span>
          </div>
        </div>

        {/* 4 Tarjetas KPI Municipales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* KPI 1: Ingresos Totales y Autonomía Fiscal */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">1. Ingresos Totales (TR)</span>
                <Wallet className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-white tracking-tight font-mono">
                {formatValue(curTR, localUnit)}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 text-xs space-y-1">
              <div className="flex justify-between items-center text-slate-300">
                <span>Autonomía Fiscal:</span>
                <strong className="font-mono text-emerald-700">{inc.autonomia_fiscal_pct}%</strong>
              </div>
              <p className="text-[11px] text-slate-400">Tributos propios (IBI, tasas) sobre total ingresos.</p>
            </div>
          </div>

          {/* KPI 2: Gastos Totales (TE) */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">2. Gastos Totales (TE)</span>
                <PiggyBank className="h-4 w-4 text-rose-500" />
              </div>
              <p className="text-2xl font-black text-white tracking-tight font-mono">
                {formatValue(curTE, localUnit)}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 text-xs space-y-1">
              <div className="flex justify-between items-center text-slate-300">
                <span>Personal (Cap 1):</span>
                <strong className="font-mono text-slate-100">{formatValue(getMetric(exp.cap1_personal), localUnit)}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Contratos Servicios:</span>
                <strong className="font-mono text-slate-100">{formatValue(getMetric(exp.cap2_gasto_corriente_servicios), localUnit)}</strong>
              </div>
            </div>
          </div>

          {/* KPI 3: Saldo Presupuestario (B9) */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">3. Saldo Fiscal (B9)</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${curB9 >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {curTipoSaldo}
                </span>
              </div>
              <p className={`text-2xl font-black tracking-tight font-mono ${curB9 >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatValue(curB9, localUnit)}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 text-xs space-y-1">
              <div className="flex justify-between items-center text-slate-300">
                <span>Cobertura presupuestaria:</span>
                <strong className="font-mono text-slate-100">{curCoverage.toFixed(1)}%</strong>
              </div>
              <p className="text-[11px] text-slate-400">Ahorro y equilibrio de la hacienda local.</p>
            </div>
          </div>

          {/* KPI 4: Deuda Viva y Población */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">4. Deuda Viva Bancaria</span>
                <ShieldCheck className={`h-4 w-4 ${salud.es_saneado ? 'text-emerald-500' : 'text-amber-500'}`} />
              </div>
              <p className="text-2xl font-black text-white tracking-tight font-mono">
                {formatValue(curDeuda, localUnit)}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 text-xs space-y-1">
              <div className="flex justify-between items-center text-slate-300">
                <span>Ratio sobre ingresos:</span>
                <strong className={`font-mono ${salud.es_saneado ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {curDeudaRatio}% (Límite: 75%)
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Población censada:</span>
                <strong className="font-mono text-slate-100">{info.poblacion_oficial_2024?.toLocaleString('es-ES')} hab.</strong>
              </div>
            </div>
          </div>

          {/* KPI 5: Pago de Intereses de la Deuda */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">5. Intereses Deuda (Cap 3)</span>
                <Coins className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-white tracking-tight font-mono">
                {formatValue(getMetric(exp.cap3_gastos_financieros), localUnit)}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 text-xs space-y-1">
              <div className="flex justify-between items-center text-slate-300">
                <span>Régimen legal LRHL:</span>
                <strong className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${curDeudaRatio <= 75 ? 'bg-emerald-100 text-emerald-800' : (curDeudaRatio <= 110 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')}`}>
                  {curDeudaRatio <= 75 ? 'Ordinario (≤75%)' : (curDeudaRatio <= 110 ? 'Tutela Previa' : 'Crédito Prohibido')}
                </strong>
              </div>
              <p className="text-[11px] text-slate-400">Intereses bancarios anuales devengados.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Gráficos de Cuenta de Resultados (PyG Municipal) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut de Ingresos */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-md">
          <div className="h-[380px] w-full">
            <ReactECharts option={ingresosDonutOption} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
          </div>
        </div>

        {/* Barras de Gastos */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-md">
          <div className="h-[380px] w-full">
            <ReactECharts option={gastosBarrasOption} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
          </div>
        </div>
      </div>

      {/* 4. Comparador Municipal Interactivo (Duelo Municipal en €/hab) */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Scale className="h-4 w-4 text-blue-600" />
              <span>Comparativa Cara a Cara entre Municipios</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Enfrenta al ayuntamiento de <strong>{info.nombre}</strong> con otro municipio español en términos de esfuerzo por habitante (€/hab).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-300">Comparar con:</label>
            <select
              value={compareIne}
              onChange={(e) => setCompareIne(e.target.value)}
              className="bg-slate-900 border border-slate-300 text-slate-100 text-xs font-semibold rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              {allMunicipios.filter((m) => m.codigo_ine !== selectedIne).map((m) => (
                <option key={m.codigo_ine} value={m.codigo_ine}>
                  {m.nombre} ({m.provincia_nombre})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-[380px] w-full">
          <ReactECharts option={comparadorOption} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
        </div>
      </div>

      {/* 5. Modo Aula Pedagógico sobre la Hacienda Municipal */}
      {modoAula && (
        <div className="bg-gradient-to-r from-emerald-950/40 to-teal-950/40 p-4.5 rounded-2xl border border-emerald-800/60 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs mt-0.5 shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="space-y-1.5 text-xs text-emerald-200">
              <p className="font-bold text-sm text-emerald-300">
                Píldora Didáctica: ¿Cómo funciona el presupuesto de tu Ayuntamiento?
              </p>
              <p className="leading-relaxed">
                El Ayuntamiento es la administración más cercana a la vida cotidiana de los ciudadanos. Su presupuesto se rige por la 
                <strong> Ley Reguladora de las Haciendas Locales (LRHL)</strong>:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-emerald-800/60">
                  <strong className="text-emerald-300 block mb-1">🏠 El IBI es el Rey:</strong>
                  El Impuesto sobre Bienes Inmuebles financia más del 50% de los ingresos tributarios locales. Grava a los propietarios de viviendas y locales según el valor catastral fijado por el Ministerio de Hacienda.
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-emerald-800/60">
                  <strong className="text-emerald-300 block mb-1">🧹 Servicios Obligatorios (Art. 26 LBRL):</strong>
                  Todos los ayuntamientos deben prestar alumbrado público, cementerio, basuras y limpieza viaria. Los de más de 20.000 habitantes deben tener además parque de bomberos y polideportivo, y los de más de 50.000, autobús urbano.
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-emerald-800/60">
                  <strong className="text-emerald-300 block mb-1">⚖️ Superávit y Regla de Gasto:</strong>
                  A diferencia del Estado y de las CC.AA., los ayuntamientos acumulan un superávit crónico conjunto de ~7.000 M€ al año debido a la estricta regla de gasto de la LOEPSF.
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-emerald-800/60">
                  <strong className="text-emerald-300 block mb-1">📜 Normas de Deuda (TRLRHL y LPGE):</strong>
                  Hasta el 75% de ingresos corrientes, el Ayuntamiento decide libremente sus préstamos. Entre el 75% y el 110%, requiere autorización previa de Hacienda. Más del 110%: prohibición absoluta de nuevo crédito bancario.
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-emerald-800/60">
                  <strong className="text-emerald-300 block mb-1">💰 Destino del Superávit (Art. 32 LOEPSF):</strong>
                  El superávit local no se puede gastar en gasto corriente: por ley debe destinarse prioritariamente a amortizar deuda bancaria o a Inversiones Financieramente Sostenibles (IFS).
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
