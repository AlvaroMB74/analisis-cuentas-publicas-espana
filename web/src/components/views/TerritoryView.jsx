import React, { useState, useMemo, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import rawCcaaData from '../../data/cuentas_ccaa_consolidadas.json';
import rawDiputacionesData from '../../data/cuentas_diputaciones_consolidadas.json';
import MunicipalityView from './MunicipalityView';
import { COFOG_COLORS, formatValue } from '../../utils/constants';
import { 
  MapPin, 
  Users, 
  Building2, 
  HeartPulse, 
  GraduationCap, 
  TrendingUp, 
  ArrowUpDown, 
  Sparkles,
  BarChart2,
  Sliders,
  Scale,
  Landmark,
  Coins,
  ShieldCheck,
  Building,
  PieChart as PieIcon,
  Compass,
  Truck,
  Flame,
  TreePine,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

const COFOG_LABELS = {
  TOTAL: 'Gasto Autonómico Total Consolidado',
  GF07: 'Sanidad / Salud Pública',
  GF09: 'Educación y Universidad',
  GF10: 'Protección Social y Dependencia',
  GF01: 'Servicios Generales y Deuda Pública',
  GF04: 'Asuntos Económicos y Transportes',
  GF03: 'Orden Público y Seguridad (Policía Autonómica)',
  GF06: 'Vivienda y Servicios Comunitarios',
  GF08: 'Cultura, Deporte y Ocio',
  GF05: 'Medio Ambiente y Recursos Naturales'
};

const COFOG_DESCRIPTIONS = {
  TOTAL: 'Suma consolidada de todas las políticas y servicios públicos gestionados por la Comunidad Autónoma.',
  GF07: 'Hospitales, centros de salud (atención primaria), personal médico y recetas de farmacia. Competencia 100% autonómica.',
  GF09: 'Colegios públicos, institutos de secundaria, formación profesional (FP) y universidades públicas autonómicas.',
  GF10: 'Atención a la dependencia, residencias públicas de mayores, centros de acogida y rentas de inserción social.',
  GF01: 'Administración de la Junta/Gobierno regional, parlamento autonómico y pago de intereses de la deuda pública.',
  GF04: 'Infraestructuras de transporte (metro, autobús interurbano), carreteras autonómicas, industria y agricultura.',
  GF03: 'Policía autonómica propia (Mossos en Cataluña, Ertzaintza en País Vasco, Policía Foral en Navarra) y extinción de incendios.',
  GF06: 'Vivienda pública, urbanismo, abastecimiento de aguas y ordenación del territorio.',
  GF08: 'Museos, teatros públicos, televisiones y radios autonómicas, y promoción del deporte base.',
  GF05: 'Gestión forestal, parques naturales, prevención de incendios y conservación de la biodiversidad.'
};

export default function TerritoryView({
  year,
  unit: globalUnit,
  modoAula,
  onOpenGlossaryWithCode
}) {
  // Selector de Nivel Territorial: 'ccaa' (Nivel 2: CC.AA.) | 'diputaciones' (Nivel 3: Diputaciones y Cabildos)
  const [territorialLevel, setTerritorialLevel] = useState('ccaa');

  // Selector de sub-vista para CC.AA.: 'detail' | 'ranking'
  const [subView, setSubView] = useState('detail');

  // Selector de sub-vista para Diputaciones: 'detail_dip' | 'ranking_dip'
  const [dipSubView, setDipSubView] = useState('detail_dip');

  // Selector de unidad dinámico territorial
  const [territoryUnit, setTerritoryUnit] = useState('EUR_HAB'); // 'EUR_HAB' | 'MIO_EUR' | 'PC_GDP' | 'MIO_EUR_CONST'
  
  // Comunidad autónoma activa (Nivel 2)
  const [selectedGeo, setSelectedGeo] = useState('ES30'); // Default Madrid
  const [compareGeo, setCompareGeo] = useState('ES61');   // Default Andalucía
  const [selectedFunction, setSelectedFunction] = useState('GF07'); // Default Sanidad
  const [sortBy, setSortBy] = useState('desc'); // 'desc' | 'asc'

  // Diputación / Entidad supramunicipal activa (Nivel 3)
  const [selectedDip, setSelectedDip] = useState('ES618'); // Default Diputación de Sevilla
  const [dipFunction, setDipFunction] = useState('TOTAL'); // 'TOTAL', 'cooperacion', 'carreteras', 'bomberos'
  const [dipSortBy, setDipSortBy] = useState('desc');

    // Sincronizar unidad global de la barra lateral con la vista territorial
  useEffect(() => {
    if (globalUnit) {
      setTerritoryUnit(globalUnit);
    }
  }, [globalUnit]);

  const unitKey = useMemo(() => territoryUnit.toLowerCase(), [territoryUnit]);

  // ==========================================
  // METADATOS Y SERIES NIVEL 2: CC.AA.
  // ==========================================
  const comunidades = useMemo(() => {
    if (!rawCcaaData?.metadata?.comunidades) return [];
    return Object.entries(rawCcaaData.metadata.comunidades).map(([code, info]) => ({
      code,
      name: info.nombre,
      foral: info.foral,
      policia: info.policia_autonoma
    }));
  }, []);

  const yearData = useMemo(() => {
    const coms = {};
    if (rawCcaaData?.comunidades) {
      Object.entries(rawCcaaData.comunidades).forEach(([code, c]) => {
        coms[code] = {
          info: c.info,
          series: c.series[year] || {}
        };
      });
    }
    const media = rawCcaaData?.media_nacional_ccaa?.[year] || {};
    return { coms, media };
  }, [year]);

  const currentRegion = useMemo(() => {
    if (selectedGeo === 'MEDIA') {
      return {
        code: 'MEDIA',
        name: 'Media Nacional CC.AA.',
        isMedia: true,
        data: yearData.media
      };
    }
    const c = yearData.coms[selectedGeo];
    return {
      code: selectedGeo,
      name: c?.info?.nombre || selectedGeo,
      isMedia: false,
      info: c?.info,
      data: c?.series || {}
    };
  }, [selectedGeo, yearData]);

  const getItemMetric = (itemData, fallback = 0) => {
    if (!itemData) return fallback;
    return itemData[unitKey] ?? itemData.mio_eur ?? fallback;
  };

  const curRf = currentRegion.data?.resumen_fiscal || {};
  const curRev = currentRegion.data?.ingresos_desglose || {};
  const curExp = currentRegion.data?.gastos_cofog || {};

  const curTR = getItemMetric(curRf.TR);
  const curTE = getItemMetric(curRf.TE);
  const curB9 = getItemMetric(curRf.B9);
  const curCoverage = curRf.tasa_cobertura_pct || 100.0;
  const curTipoSaldo = curRf.tipo_saldo || (curB9 >= 0 ? 'SUPERÁVIT' : 'DÉFICIT');

  const curD5 = getItemMetric(curRev.D5REC);
  const curD2 = getItemMetric(curRev.D2REC);
  const curOTR = getItemMetric(curRev.OTR_REC);

    // Variables de Deuda e Intereses Autonómicos
  const curDebt = currentRegion.seriesYear?.deuda_publica?.deuda_total;
  const curInterest = currentRegion.seriesYear?.deuda_publica?.intereses_anuales;
  const curTipoInt = currentRegion.seriesYear?.deuda_publica?.tipo_interes_implicito_pct;
  const curFlaPct = currentRegion.seriesYear?.deuda_publica?.deuda_con_estado_fla_pct;
  const curSost = currentRegion.seriesYear?.deuda_publica?.clasificacion_sostenibilidad;

  const curHealth = getItemMetric(curExp.divisiones?.GF07);
  const curEdu = getItemMetric(curExp.divisiones?.GF09);
  const curSocial = getItemMetric(curExp.divisiones?.GF10);

  const medRf = yearData.media?.resumen_fiscal || {};
  const medExp = yearData.media?.gastos_cofog || {};
  const medTE = getItemMetric(medRf.TE);
  const medHealth = getItemMetric(medExp.divisiones?.GF07);
  const medEdu = getItemMetric(medExp.divisiones?.GF09);

  const popVal = currentRegion.data?.poblacion || yearData.media?.poblacion_total_ccaa || 1;
  const gdpVal = currentRegion.data?.pib_nominal_mio_eur || yearData.media?.pib_total_ccaa_mio || 1;
  const gdpPerCapita = currentRegion.data?.pib_per_capita_eur || Math.round((gdpVal * 1_000_000) / popVal);

  const teDiffPct = medTE > 0 ? ((curTE - medTE) / medTE) * 100 : 0;

  // ==========================================
  // METADATOS Y SERIES NIVEL 3: DIPUTACIONES Y CABILDOS
  // ==========================================
  const diputacionesList = useMemo(() => {
    if (!rawDiputacionesData?.entidades) return [];
    return Object.entries(rawDiputacionesData.entidades).map(([code, ent]) => ({
      code,
      name: ent.info.nombre,
      tipo: ent.info.tipo,
      ccaa: ent.info.ccaa,
      ccaa_code: ent.info.ccaa_code,
      municipios: ent.info.municipios_count
    }));
  }, []);

  const currentDip = useMemo(() => {
    if (selectedDip === 'MEDIA_DIP') {
      return {
        code: 'MEDIA_DIP',
        name: 'Media de las 38 Diputaciones de Régimen Común',
        tipo: 'media',
        municipios: 150,
        isMedia: true,
        data: rawDiputacionesData?.media_diputaciones_comunes?.[year] || {}
      };
    }
    const ent = rawDiputacionesData?.entidades?.[selectedDip];
    return {
      code: selectedDip,
      name: ent?.info?.nombre || selectedDip,
      tipo: ent?.info?.tipo,
      ccaa: ent?.info?.ccaa,
      municipios: ent?.info?.municipios_count || 100,
      isMedia: false,
      info: ent?.info,
      seriesYear: ent?.series?.[year] || {}
    };
  }, [selectedDip, year]);

  const dipMetric = (metricPack, fallback = 0) => {
    if (!metricPack) return fallback;
    if (territoryUnit === 'EUR_HAB') return metricPack.eur_hab ?? fallback;
    if (territoryUnit === 'MIO_EUR_CONST') return metricPack.mio_eur_const ?? fallback;
    return metricPack.mio_eur ?? fallback;
  };

  // Métricas de la Diputación Activa
  const dipSeries = currentDip.seriesYear || {};
  const dipRf = dipSeries.resumen_fiscal || {};
  const dipRev = dipSeries.ingresos_origen || {};
  const dipExp = dipSeries.gastos_funciones || {};

  const dipTR = dipMetric(dipRf.TR);
  const dipTE = dipMetric(dipRf.TE);
  const dipB9 = dipMetric(dipRf.B9);
  const dipCoverage = dipRf.tasa_cobertura_pct || 100.0;
  const dipTipoSaldo = dipRf.tipo_saldo || 'SUPERÁVIT';

  const dipPieVal = dipMetric(dipRev.transferencias_estado_pie);
  const dipCcaaVal = dipMetric(dipRev.transferencias_ccaa);
  const dipPropiosVal = dipMetric(dipRev.tributos_propios_tasas);

    // Variables de Deuda e Intereses Supramunicipales
  const dipDebt = dipSeries?.deuda_publica?.deuda_total;
  const dipInterest = dipSeries?.deuda_publica?.intereses_anuales;
  const dipRatioIngresos = dipSeries?.deuda_publica?.ratio_deuda_sobre_ingresos_pct;
  const dipSituacion = dipSeries?.deuda_publica?.situacion_endeudamiento;

  const dipCoopVal = dipMetric(dipExp.cooperacion_planes_obras_pos);
  const dipCarrVal = dipMetric(dipExp.carreteras_red_viaria);
  const dipBombVal = dipMetric(dipExp.bomberos_proteccion_civil);

  const dipPop = dipSeries.poblacion || 1;

  // Media de las 38 Diputaciones Comunes en el año activo
  const dipComunesMed = rawDiputacionesData?.media_diputaciones_comunes?.[year] || {
    gasto_medio_por_habitante: 283.0,
    ingreso_medio_por_habitante: 298.5
  };

  // ==========================================
  // GRÁFICOS NIVEL 2: CC.AA.
  // ==========================================
  const balanceDualOption = useMemo(() => {
    return {
      title: {
        text: `Balanza Presupuestaria: ${currentRegion.name} (${year})`,
        subtext: `Ingresos (${formatValue(curTR, territoryUnit)}) vs Gastos (${formatValue(curTE, territoryUnit)})`,
        left: 'center',
        top: 0,
        textStyle: { fontSize: 15, fontWeight: '700', color: '#f8fafc' },
        subtextStyle: { fontSize: 12, color: '#94a3b8' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontSize: 12 },
        formatter: (params) => {
          let str = `<div class="font-bold border-b border-slate-700 pb-1 mb-1.5">${params[0].name}</div>`;
          params.forEach((p) => {
            str += `
              <div class="flex items-center justify-between gap-4 py-0.5 text-xs">
                <span style="color:${p.color}">● ${p.seriesName}:</span>
                <strong class="font-mono">${formatValue(p.value, territoryUnit)}</strong>
              </div>
            `;
          });
          return str;
        }
      },
      legend: { bottom: 0, icon: 'roundRect' },
      grid: { top: 65, left: '4%', right: '4%', bottom: 40, containLabel: true },
      xAxis: {
        type: 'category',
        data: ['Estructura de Ingresos', 'Estructura de Gastos'],
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisLabel: { fontWeight: 'bold', fontSize: 12, color: '#1e293b' }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { stroke: '#334155', type: 'dashed' } }
      },
      series: [
        { name: 'Tributos Directos (IRPF / Patrim.)', type: 'bar', stack: 'ingresos', data: [curD5, null], itemStyle: { color: '#6366f1' }, barMaxWidth: 65 },
        { name: 'Tributos Indirectos (IVA / ITP)', type: 'bar', stack: 'ingresos', data: [curD2, null], itemStyle: { color: '#ec4899' }, barMaxWidth: 65 },
        { name: 'Transferencias del Estado (SFA / Fondos)', type: 'bar', stack: 'ingresos', data: [curOTR, null], itemStyle: { color: '#06b6d4' }, barMaxWidth: 65 },
        { name: 'Sanidad (GF07)', type: 'bar', stack: 'gastos', data: [null, curHealth], itemStyle: { color: '#ef4444' }, barMaxWidth: 65 },
        { name: 'Educación (GF09)', type: 'bar', stack: 'gastos', data: [null, curEdu], itemStyle: { color: '#2563eb' }, barMaxWidth: 65 },
        { name: 'Protección Social (GF10)', type: 'bar', stack: 'gastos', data: [null, curSocial], itemStyle: { color: '#0d9488' }, barMaxWidth: 65 },
        { name: 'Otros Gastos (Servicios, Deuda, Transp.)', type: 'bar', stack: 'gastos', data: [null, Math.max(0, curTE - (curHealth + curEdu + curSocial))], itemStyle: { color: '#94a3b8' }, barMaxWidth: 65 }
      ]
    };
  }, [currentRegion, year, curTR, curTE, curD5, curD2, curOTR, curHealth, curEdu, curSocial, territoryUnit]);

  const rankingOption = useMemo(() => {
    const list = [];
    const extractVal = (seriesObj) => {
      if (!seriesObj) return 0;
      if (selectedFunction === 'TOTAL') return getItemMetric(seriesObj.resumen_fiscal?.TE ?? seriesObj.TOTAL);
      if (selectedFunction === 'TR') return getItemMetric(seriesObj.resumen_fiscal?.TR);
      if (selectedFunction === 'B9') return getItemMetric(seriesObj.resumen_fiscal?.B9);
      return getItemMetric(seriesObj.gastos_cofog?.divisiones?.[selectedFunction] ?? seriesObj.divisiones?.[selectedFunction]);
    };

    const mediaVal = extractVal(yearData.media);

    Object.entries(yearData.coms).forEach(([code, c]) => {
      const val = extractVal(c.series);
      list.push({
        code,
        name: c.info.nombre,
        value: val,
        poblacion: c.series?.poblacion || 1,
        pib: c.series?.pib_nominal_mio_eur || 1,
        isSelected: code === selectedGeo,
        diffMedia: mediaVal !== 0 ? ((val - mediaVal) / Math.abs(mediaVal)) * 100 : 0
      });
    });

    list.sort((a, b) => (sortBy === 'desc' ? a.value - b.value : b.value - a.value));

    const yAxisData = list.map((item) => item.name);
    const seriesData = list.map((item) => {
      const isCurrent = item.code === selectedGeo;
      const baseColor = COFOG_COLORS[selectedFunction] || '#3b82f6';
      return {
        value: item.value,
        itemStyle: {
          color: isCurrent ? '#f59e0b' : (item.value >= 0 ? baseColor : '#f43f5e'),
          borderRadius: [0, 6, 6, 0]
        },
        raw: item
      };
    });

    return {
      title: {
        text: `Ranking Autonómico: ${COFOG_LABELS[selectedFunction] || selectedFunction} (${year})`,
        subtext: `Unidad: ${territoryUnit} • Haz clic en una barra para ver su detalle`,
        left: 'center',
        top: 0,
        textStyle: { fontSize: 15, fontWeight: '700', color: '#f8fafc' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#0f172a',
        textStyle: { color: '#f8fafc', fontSize: 12 },
        formatter: (params) => {
          const raw = params[0].data.raw;
          const sign = raw.diffMedia >= 0 ? '+' : '';
          return `
            <div class="font-bold border-b border-slate-700 pb-1 mb-1">${raw.name} (${raw.code})</div>
            <div class="text-xs text-slate-300">
              <p>Valor: <strong class="text-amber-400 font-mono">${formatValue(raw.value, territoryUnit)}</strong> (${sign}${raw.diffMedia.toFixed(1)}% vs media)</p>
              <p>Población: <strong>${raw.poblacion.toLocaleString('es-ES')} hab.</strong></p>
            </div>
          `;
        }
      },
      grid: { top: 65, left: '3%', right: '8%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', splitLine: { lineStyle: { stroke: '#334155', type: 'dashed' } } },
      yAxis: { type: 'category', data: yAxisData, axisLabel: { color: '#cbd5e1' } },
      series: [
        {
          type: 'bar',
          data: seriesData,
          barMaxWidth: 22,
          markLine: {
            symbol: 'none',
            lineStyle: { color: '#ef4444', type: 'dashed', width: 2 },
            data: [{ xAxis: mediaVal, label: { formatter: `Media: ${formatValue(mediaVal, territoryUnit)}`, position: 'end', color: '#dc2626', fontWeight: 'bold' } }]
          }
        }
      ]
    };
  }, [yearData, selectedGeo, selectedFunction, sortBy, territoryUnit, year]);

  // ==========================================
  // GRÁFICOS NIVEL 3: DIPUTACIONES Y CABILDOS
  // ==========================================
  // Gráfico 1: Flujos de Financiación de la Diputación (Donut de Origen de Fondos)
  const dipFundingOption = useMemo(() => {
    const piePct = dipRev.pct_estado_pie || 71.5;
    const ccaaPct = dipRev.pct_ccaa || 12.0;
    const propiosPct = dipRev.pct_propios || 13.0;
    const uePct = Math.max(0, 100 - (piePct + ccaaPct + propiosPct));

    return {
      title: {
        text: `¿De Dónde Recibe Fondos la ${currentDip.name}?`,
        subtext: `Desglose de transferencias interadministrativas (${year})`,
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
            <div class="text-xs">
              <p>Porcentaje: <strong class="text-amber-400 font-mono">${params.value}%</strong></p>
              <p>Importe en ${territoryUnit}: <strong class="font-mono">${formatValue(params.data.rawVal, territoryUnit)}</strong></p>
            </div>
          `;
        }
      },
      legend: { bottom: 0, icon: 'circle' },
      series: [
        {
          name: 'Financiación',
          type: 'pie',
          radius: ['42%', '70%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, formatter: '{b}: {c}%', fontSize: 11 },
          data: [
            { value: piePct, name: 'Estado Central (PIE)', itemStyle: { color: '#3b82f6' }, rawVal: dipPieVal },
            { value: ccaaPct, name: 'Comunidad Autónoma', itemStyle: { color: '#10b981' }, rawVal: dipCcaaVal },
            { value: propiosPct, name: 'Tributos Propios y Tasas', itemStyle: { color: '#f59e0b' }, rawVal: dipPropiosVal },
            { value: Number(uePct.toFixed(1)), name: 'Fondos Europeos / Capital', itemStyle: { color: '#8b5cf6' }, rawVal: dipMetric(dipRev.fondos_capital_ue) }
          ]
        }
      ]
    };
  }, [currentDip, year, dipRev, dipPieVal, dipCcaaVal, dipPropiosVal, territoryUnit]);

  // Gráfico 2: Balanza Funcional de la Diputación
  const dipFunctionsOption = useMemo(() => {
    return {
      title: {
        text: `Misiones y Destino del Gasto Provincial`,
        subtext: `Presupuesto asignado a carreteras, cooperación y emergencias (${year})`,
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
            <p class="text-xs">Importe: <strong class="text-amber-400 font-mono">${formatValue(params[0].value, territoryUnit)}</strong></p>
          `;
        }
      },
      grid: { top: 60, left: '3%', right: '5%', bottom: 25, containLabel: true },
      xAxis: {
        type: 'category',
        data: ['Cooperación (POS)', 'Carreteras', 'Bomberos', 'Servicios Sociales', 'Cultura y Deportes', 'Medio Ambiente'],
        axisLabel: { interval: 0, fontSize: 11, color: '#cbd5e1' }
      },
      yAxis: { type: 'value', splitLine: { lineStyle: { stroke: '#334155', type: 'dashed' } } },
      series: [
        {
          name: 'Gasto por Función',
          type: 'bar',
          data: [
            { value: dipCoopVal, itemStyle: { color: '#f59e0b' } },
            { value: dipCarrVal, itemStyle: { color: '#3b82f6' } },
            { value: dipBombVal, itemStyle: { color: '#ef4444' } },
            { value: dipMetric(dipExp.servicios_sociales_residencias), itemStyle: { color: '#0d9488' } },
            { value: dipMetric(dipExp.cultura_deporte_patrimonio), itemStyle: { color: '#8b5cf6' } },
            { value: dipMetric(dipExp.medio_ambiente_residuos), itemStyle: { color: '#10b981' } }
          ],
          barMaxWidth: 45,
          itemStyle: { borderRadius: [6, 6, 0, 0] }
        }
      ]
    };
  }, [currentDip, year, dipCoopVal, dipCarrVal, dipBombVal, dipExp, territoryUnit]);

  // Gráfico 3: Ranking de las 38 Diputaciones de Régimen Común en €/hab
  const dipRankingOption = useMemo(() => {
    const list = [];
    const entidades = rawDiputacionesData?.entidades || {};

    Object.entries(entidades).forEach(([code, ent]) => {
      // Filtrar solo régimen común para comparativas justas entre iguales
      if (ent.info.tipo === 'regimen_comun') {
        const sYear = ent.series[year] || {};
        let val = 0;
        if (dipFunction === 'TOTAL') val = dipMetric(sYear.resumen_fiscal?.TE);
        else if (dipFunction === 'carreteras') val = dipMetric(sYear.gastos_funciones?.carreteras_red_viaria);
        else if (dipFunction === 'cooperacion') val = dipMetric(sYear.gastos_funciones?.cooperacion_planes_obras_pos);
        else if (dipFunction === 'bomberos') val = dipMetric(sYear.gastos_funciones?.bomberos_proteccion_civil);

        list.push({
          code,
          name: ent.info.nombre.replace('Diputación Provincial de ', 'Dip. ').replace('Diputació de ', 'Dip. ').replace('Deputación de ', 'Dip. ').replace('Deputación da ', 'Dip. '),
          fullName: ent.info.nombre,
          value: val,
          poblacion: sYear.poblacion || 1,
          municipios: ent.info.municipios_count
        });
      }
    });

    list.sort((a, b) => (dipSortBy === 'desc' ? a.value - b.value : b.value - a.value));

    const yData = list.map((i) => i.name);
    const sData = list.map((i) => ({
      value: i.value,
      itemStyle: {
        color: i.code === selectedDip ? '#f59e0b' : '#3b82f6',
        borderRadius: [0, 5, 5, 0]
      },
      raw: i
    }));

    const fnName = dipFunction === 'TOTAL' ? 'Gasto Total' : (dipFunction === 'carreteras' ? 'Carreteras Provinciales' : 'Cooperación Municipal (POS)');

    return {
      title: {
        text: `Ranking de las 38 Diputaciones Provinciales: ${fnName} (${year})`,
        subtext: `Unidad: ${territoryUnit} • Haz clic en cualquier barra para ver el detalle de esa Diputación`,
        left: 'center',
        top: 0,
        textStyle: { fontSize: 14, fontWeight: '700', color: '#f8fafc' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#0f172a',
        textStyle: { color: '#f8fafc', fontSize: 12 },
        formatter: (params) => {
          const raw = params[0].data.raw;
          return `
            <div class="font-bold border-b border-slate-700 pb-1 mb-1">${raw.fullName}</div>
            <div class="text-xs text-slate-300">
              <p>Importe: <strong class="text-amber-400 font-mono">${formatValue(raw.value, territoryUnit)}</strong></p>
              <p>Población: <strong>${raw.poblacion.toLocaleString('es-ES')} hab.</strong></p>
              <p>Municipios que atiende: <strong>${raw.municipios} ayuntamientos</strong></p>
            </div>
          `;
        }
      },
      grid: { top: 65, left: '3%', right: '8%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', splitLine: { lineStyle: { stroke: '#334155', type: 'dashed' } } },
      yAxis: { type: 'category', data: yData, axisLabel: { fontSize: 10, color: '#cbd5e1' } },
      series: [
        {
          type: 'bar',
          data: sData,
          barMaxWidth: 18,
          markLine: {
            symbol: 'none',
            lineStyle: { color: '#ef4444', type: 'dashed', width: 2 },
            data: [{ xAxis: dipComunesMed.gasto_medio_por_habitante, label: { formatter: `Media: ${formatValue(dipComunesMed.gasto_medio_por_habitante, territoryUnit)}`, position: 'end', color: '#dc2626', fontWeight: 'bold' } }]
          }
        }
      ]
    };
  }, [year, dipFunction, dipSortBy, selectedDip, territoryUnit, dipComunesMed]);

  return (
    <div className="space-y-6">
      {/* 1. Header Global de Navegación Territorial: Nivel 2 (CC.AA.) vs Nivel 3 (Diputaciones) */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Selector de Nivel Territorial */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setTerritorialLevel('ccaa')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              territorialLevel === 'ccaa'
                ? 'bg-blue-600 text-white shadow-xs ring-1 ring-slate-900/10'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Landmark className="h-4 w-4 text-amber-500" />
            <span>Nivel 2: Comunidades Autónomas (17 CC.AA.)</span>
          </button>

          <button
            onClick={() => setTerritorialLevel('diputaciones')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              territorialLevel === 'diputaciones'
                ? 'bg-blue-600 text-white shadow-xs ring-1 ring-slate-900/10'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Building className="h-4 w-4 text-blue-600" />
            <span>Nivel 3: Diputaciones y Cabildos (Supramunicipal)</span>
          </button>

          <button
            onClick={() => setTerritorialLevel('ayuntamientos')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              territorialLevel === 'ayuntamientos'
                ? 'bg-blue-600 text-white shadow-xs ring-1 ring-slate-900/10'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Building2 className="h-4 w-4 text-emerald-600" />
            <span>Nivel 4: Ayuntamientos (Municipal)</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">PyG Local</span>
          </button>
        </div>

        {/* Selector de Unidad Territorial Dinámico */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 px-1">Unidad:</span>
          {[
            { id: 'EUR_HAB', label: '€ / hab', tip: 'Euros por habitante' },
            { id: 'MIO_EUR', label: 'Millones €', tip: 'Millones de euros corrientes' },
            { id: 'PC_GDP', label: '% PIB', tip: 'Porcentaje del PIB' },
            { id: 'MIO_EUR_CONST', label: 'M€ const (2024)', tip: 'Ajustados a inflación base 2024' }
          ].map((u) => (
            <button
              key={u.id}
              onClick={() => setTerritoryUnit(u.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                territoryUnit === u.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
              title={u.tip}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          CONTENIDO NIVEL 2: COMUNIDADES AUTÓNOMAS (17 CC.AA.)
          ========================================================================= */}
      {territorialLevel === 'ccaa' && (
        <div className="space-y-6">
          {/* Barra de Sub-Navegación CC.AA. */}
          <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setSubView('detail')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    subView === 'detail' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300'
                  }`}
                >
                  Detalle por Comunidad
                </button>
                <button
                  onClick={() => setSubView('ranking')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    subView === 'ranking' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300'
                  }`}
                >
                  Ranking Comparativo
                </button>
              </div>

              {/* Selector de Comunidad */}
              <select
                value={selectedGeo}
                onChange={(e) => setSelectedGeo(e.target.value)}
                className="bg-slate-900 border border-slate-300 text-slate-100 text-xs font-semibold rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="MEDIA">⭐ Media Nacional CC.AA. (Consolidado)</option>
                <optgroup label="17 Comunidades Autónomas">
                  {comunidades.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} {c.foral ? '🏛️ (Foral)' : ''}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-200">{currentRegion.name}</span>
              <span>•</span>
              <span>Ejercicio {year}</span>
            </div>
          </div>

          {/* Tarjetas KPI de Balanza Autonómica */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Ingresos Totales (TR) */}
            <div className="bg-slate-900/90 p-4.5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">1. Ingresos Autonómicos</span>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold font-mono">TR</span>
                </div>
                <p className="text-2xl font-black text-white tracking-tight font-mono">{formatValue(curTR, territoryUnit)}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Directos (IRPF):</span>
                  <strong className="font-mono text-slate-100">{formatValue(curD5, territoryUnit)}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-500"></span> Indirectos (IVA):</span>
                  <strong className="font-mono text-slate-100">{formatValue(curD2, territoryUnit)}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> Transf. Estado (SFA):</span>
                  <strong className="font-mono text-slate-100">{formatValue(curOTR, territoryUnit)}</strong>
                </div>
              </div>
            </div>

            {/* KPI 2: Gastos Totales (TE) */}
            <div className="bg-slate-900/90 p-4.5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">2. Gastos Autonómicos</span>
                  <span className="text-[11px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md font-bold font-mono">TE</span>
                </div>
                <p className="text-2xl font-black text-white tracking-tight font-mono">{formatValue(curTE, territoryUnit)}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5 text-rose-700"><HeartPulse className="h-3.5 w-3.5" /> Sanidad (GF07):</span>
                  <strong className="font-mono text-rose-800">{formatValue(curHealth, territoryUnit)}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5 text-blue-700"><GraduationCap className="h-3.5 w-3.5" /> Educación (GF09):</span>
                  <strong className="font-mono text-blue-800">{formatValue(curEdu, territoryUnit)}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Desviación vs media CC.AA.:</span>
                  <span className={`font-semibold ${teDiffPct >= 0 ? 'text-amber-600' : 'text-blue-600'}`}>{teDiffPct >= 0 ? '+' : ''}{teDiffPct.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* KPI 3: Saldo Presupuestario (B9) */}
            <div className="bg-slate-900/90 p-4.5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">3. Saldo Fiscal (B9)</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${curB9 >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{curTipoSaldo}</span>
                </div>
                <p className={`text-2xl font-black tracking-tight font-mono ${curB9 >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatValue(curB9, territoryUnit)}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Tasa de cobertura:</span>
                  <strong className="font-mono text-white">{curCoverage.toFixed(1)}%</strong>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Saldo en % del PIB:</span>
                  <span className="font-mono font-semibold text-slate-200">{currentRegion.data?.resumen_fiscal?.B9?.pc_gdp ?? 0}% PIB</span>
                </div>
              </div>
            </div>

            {/* KPI 4: Población y Demografía */}
            <div className="bg-slate-900/90 p-4.5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">4. Población Censada</span>
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-2xl font-black text-white tracking-tight font-mono">{popVal.toLocaleString('es-ES')}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>PIB per cápita regional:</span>
                  <strong className="font-mono text-white">{gdpPerCapita.toLocaleString('es-ES')} €/hab</strong>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Gasto medio CC.AA.:</span>
                  <span className="font-mono">{formatValue(medTE, territoryUnit)}</span>
                </div>
              </div>
            </div>

            {/* KPI 5: Deuda Autonómica PDE */}
            <div className="bg-slate-900/90 p-4.5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">5. Deuda Autonómica (PDE)</span>
                  <Landmark className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-2xl font-black text-white tracking-tight font-mono">
                  {formatValue(dipMetric(curDebt), territoryUnit)}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Peso sobre PIB regional:</span>
                  <strong className="font-mono text-purple-800">{curDebt?.pc_gdp ?? 0}% PIB</strong>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Dependencia del FLA (Estado):</span>
                  <span className="font-mono font-semibold text-slate-200">{curFlaPct ?? 50}%</span>
                </div>
              </div>
            </div>

            {/* KPI 6: Pago Anual de Intereses */}
            <div className="bg-slate-900/90 p-4.5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">6. Intereses de la Deuda</span>
                  <Coins className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-2xl font-black text-white tracking-tight font-mono">
                  {formatValue(dipMetric(curInterest), territoryUnit)}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Tipo de interés implícito:</span>
                  <strong className="font-mono text-amber-800">{curTipoInt ? `${curTipoInt.toFixed(2)}%` : '1.8%'}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Sostenibilidad fiscal:</span>
                  <span className="font-semibold text-slate-200">{curSost || 'Moderada'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Guía Pedagógica: Marco Normativo Fiscal Autonómico */}
          <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl border border-slate-800 shadow-sm space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm border-b border-slate-800 pb-2">
              <Scale className="h-4 w-4" />
              <span>Reglas Fiscales y Normativa de Déficit y Deuda Autonómica (CPFF y LOEPSF)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-slate-300">
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <strong className="text-slate-100 block mb-1">1. Límite de Deuda (13% del PIB regional)</strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Fijado por la Disposición Transitoria Primera de la LOEPSF 2/2012 y los acuerdos del Consejo de Política Fiscal y Financiera (CPFF). 
                  Las CC.AA. con ratios superiores al 30% del PIB (como Comunitat Valenciana, Murcia, Castilla-La Mancha o Cataluña) requieren supervisión reforzada.
                </p>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <strong className="text-slate-100 block mb-1">2. Mecanismos de Liquidez (FLA y Facilidad Financiera)</strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Creado en 2012, el Fondo de Liquidez Autonómico (FLA) permite al Estado prestar fondos baratos a las comunidades para pagar vencimientos e intereses de deuda a cambio de estricta condicionalidad fiscal y rendición mensual de cuentas a la IGAE.
                </p>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <strong className="text-slate-100 block mb-1">3. Consecuencias del Incumplimiento (Plan PEF)</strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Si una comunidad autónoma incumple el objetivo de déficit, de deuda o la regla de gasto, está obligada legalmente a presentar un Plan Económico-Financiero (PEF) que detalle ajustes y medidas correctoras en un plazo máximo de dos años.
                </p>
              </div>
            </div>
          </div>

          {/* Vistas Nivel 2 */}
          {subView === 'detail' ? (
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
              <div className="h-[420px] w-full">
                <ReactECharts option={balanceDualOption} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300">Partida:</span>
                  {['GF07', 'GF09', 'TOTAL', 'TR', 'B9'].map((fn) => (
                    <button
                      key={fn}
                      onClick={() => setSelectedFunction(fn)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${selectedFunction === fn ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'}`}
                    >
                      {fn}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setSortBy(sortBy === 'desc' ? 'asc' : 'desc')}
                  className="flex items-center gap-1 px-3 py-1 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200"
                >
                  <ArrowUpDown className="h-3.5 w-3.5" /> {sortBy === 'desc' ? 'Mayor a menor' : 'Menor a mayor'}
                </button>
              </div>
              <div className="h-[520px] w-full">
                <ReactECharts option={rankingOption} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          CONTENIDO NIVEL 3: DIPUTACIONES PROVINCIALES, CABILDOS Y CONSELLS
          ========================================================================= */}
      {territorialLevel === 'diputaciones' && (
        <div className="space-y-6">
          {/* Barra de Sub-Navegación Supramunicipal */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Selector de Sub-vista Diputación */}
              <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setDipSubView('detail_dip')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    dipSubView === 'detail_dip' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300'
                  }`}
                >
                  Balanza y Financiación
                </button>
                <button
                  onClick={() => setDipSubView('ranking_dip')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    dipSubView === 'ranking_dip' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300'
                  }`}
                >
                  Ranking de las 38 Diputaciones
                </button>
              </div>

              {/* Selector de Diputación / Cabildo */}
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-blue-600" />
                <label className="text-xs font-bold text-slate-200">Entidad Supramunicipal:</label>
                <select
                  value={selectedDip}
                  onChange={(e) => setSelectedDip(e.target.value)}
                  className="bg-slate-900 border border-slate-300 text-slate-100 text-xs font-semibold rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden max-w-sm"
                >
                  <option value="MEDIA_DIP">⭐ Media de las 38 Diputaciones de Régimen Común</option>
                  
                  <optgroup label="Diputaciones Provinciales de Régimen Común (38)">
                    {diputacionesList.filter((d) => d.tipo === 'regimen_comun').map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name} ({d.ccaa})
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="Diputaciones Forales de Euskadi (3)">
                    {diputacionesList.filter((d) => d.tipo === 'regimen_foral').map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name} 🏛️ (Foral)
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="Cabildos Insulares de Canarias (7)">
                    {diputacionesList.filter((d) => d.tipo === 'insular' && d.ccaa_code === 'ES70').map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name} 🏝️
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="Consejos Insulares de Baleares (4)">
                    {diputacionesList.filter((d) => d.tipo === 'insular' && d.ccaa_code === 'ES53').map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name} 🏝️
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="CC.AA. Uniprovinciales (Régimen Integrado)">
                    {diputacionesList.filter((d) => d.tipo === 'uniprovincial_integrada').map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name} ℹ️ (Sin Diputación separada)
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg font-bold font-mono">
                {currentDip.tipo === 'regimen_comun' ? 'Régimen Común' : (currentDip.tipo === 'regimen_foral' ? 'Concierto Foral' : (currentDip.tipo === 'insular' ? 'Régimen Insular' : 'Integrada en CC.AA.'))}
              </span>
              <span>•</span>
              <span>{currentDip.municipios} municipios</span>
              <button
                onClick={() => setTerritorialLevel('ayuntamientos')}
                className="ml-2 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold border border-emerald-200 transition"
                title="Explorar cuentas municipales de los ayuntamientos de esta provincia"
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Ver Ayuntamientos</span>
              </button>
            </div>
          </div>

          {/* Aviso especial para CC.AA. Uniprovinciales */}
          {currentDip.tipo === 'uniprovincial_integrada' ? (
            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <HelpCircle className="h-5 w-5 text-amber-600" />
                <span>¿Por qué no hay Diputación Provincial en {currentDip.ccaa}?</span>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed">
                En las <strong>7 Comunidades Autónomas Uniprovinciales</strong> (Madrid, Asturias, Cantabria, La Rioja, Murcia, Navarra, además de Ceuta y Melilla),
                la Diputación Provincial quedó extinguida en 1982-1983 por mandato de la Constitución y sus Estatutos de Autonomía.
                Sus competencias (carreteras provinciales, bomberos, cooperación municipal) y sus recursos fueron asumidos directamente por el 
                <strong> Gobierno Autonómico</strong> para evitar duplicidades de cargos y parlamentos.
              </p>
            </div>
          ) : (
            <>
              {/* Tarjetas KPI de la Entidad Supramunicipal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI 1: Ingresos Totales de la Diputación */}
                <div className="bg-slate-900/90 p-4.5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-slate-400 mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">1. Ingresos Totales</span>
                      <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold font-mono">TR</span>
                    </div>
                    <p className="text-2xl font-black text-white tracking-tight font-mono">{formatValue(dipTR, territoryUnit)}</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Estado (PIE):</span>
                      <strong className="font-mono text-slate-100">{formatValue(dipPieVal, territoryUnit)} ({dipRev.pct_estado_pie}%)</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Comunidad Autónoma:</span>
                      <strong className="font-mono text-slate-100">{formatValue(dipCcaaVal, territoryUnit)} ({dipRev.pct_ccaa}%)</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Propios y Tasas:</span>
                      <strong className="font-mono text-slate-100">{formatValue(dipPropiosVal, territoryUnit)} ({dipRev.pct_propios}%)</strong>
                    </div>
                  </div>
                </div>

                {/* KPI 2: Gastos Totales de la Diputación */}
                <div className="bg-slate-900/90 p-4.5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-slate-400 mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">2. Gastos Totales</span>
                      <span className="text-[11px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md font-bold font-mono">TE</span>
                    </div>
                    <p className="text-2xl font-black text-white tracking-tight font-mono">{formatValue(dipTE, territoryUnit)}</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center gap-1.5 text-amber-700"><Building2 className="h-3.5 w-3.5" /> Cooperación POS:</span>
                      <strong className="font-mono text-slate-100">{formatValue(dipCoopVal, territoryUnit)}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center gap-1.5 text-blue-700"><Truck className="h-3.5 w-3.5" /> Carreteras Red Viaria:</span>
                      <strong className="font-mono text-slate-100">{formatValue(dipCarrVal, territoryUnit)}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center gap-1.5 text-rose-700"><Flame className="h-3.5 w-3.5" /> Bomberos y CEIS:</span>
                      <strong className="font-mono text-slate-100">{formatValue(dipBombVal, territoryUnit)}</strong>
                    </div>
                  </div>
                </div>

                {/* KPI 3: Saldo Presupuestario (Superávit B9) */}
                <div className="bg-slate-900/90 p-4.5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-slate-400 mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">3. Saldo Fiscal (B9)</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${dipB9 >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{dipTipoSaldo}</span>
                    </div>
                    <p className={`text-2xl font-black tracking-tight font-mono ${dipB9 >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatValue(dipB9, territoryUnit)}</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Tasa de cobertura:</span>
                      <strong className="font-mono text-white">{dipCoverage.toFixed(1)}%</strong>
                    </div>
                    <p className="text-[11px] text-slate-400">Superávit estructural y ahorro neto provincial.</p>
                  </div>
                </div>

                {/* KPI 4: Población y Municipios */}
                <div className="bg-slate-900/90 p-4.5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-slate-400 mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">4. Ámbito de Actuación</span>
                      <Users className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="text-2xl font-black text-white tracking-tight font-mono">{dipPop.toLocaleString('es-ES')}</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Municipios atendidos:</span>
                      <strong className="font-mono text-white">{currentDip.municipios} pueblos</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 text-[11px]">
                      <span>Gasto medio provincial:</span>
                      <span className="font-mono">{formatValue(dipComunesMed.gasto_medio_por_habitante, territoryUnit)}</span>
                    </div>
                  </div>
                </div>

                {/* KPI 5: Deuda Viva de la Diputación */}
                <div className="bg-slate-900/90 p-4.5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-slate-400 mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">5. Deuda Viva Bancaria</span>
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-black text-white tracking-tight font-mono">
                      {formatValue(dipMetric(dipDebt), territoryUnit)}
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Ratio sobre ingresos:</span>
                      <strong className="font-mono text-slate-100">{dipRatioIngresos ?? 0}% (Límite: 75%)</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 text-[11px]">
                      <span>Situación legal:</span>
                      <span className="font-semibold text-emerald-700">{dipSituacion || 'Saneada'}</span>
                    </div>
                  </div>
                </div>

                {/* KPI 6: Pago de Intereses de la Deuda */}
                <div className="bg-slate-900/90 p-4.5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-slate-400 mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">6. Intereses Deuda (Cap 3)</span>
                      <Coins className="h-4 w-4 text-amber-500" />
                    </div>
                    <p className="text-2xl font-black text-white tracking-tight font-mono">
                      {formatValue(dipMetric(dipInterest), territoryUnit)}
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Carga financiera:</span>
                      <strong className="font-mono text-amber-800">&lt; 1% del presupuesto</strong>
                    </div>
                    <p className="text-[11px] text-slate-400">Las diputaciones de régimen común tienen un endeudamiento residual.</p>
                  </div>
                </div>
              </div>

              {/* Guía Pedagógica: Normativa Fiscal Supramunicipal y Local */}
              <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl border border-slate-800 shadow-sm space-y-2 text-xs">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm border-b border-slate-800 pb-2">
                  <Scale className="h-4 w-4" />
                  <span>Reglas Fiscales y Límites de Endeudamiento Local (TRLRHL y art. 32 LOEPSF)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-slate-300">
                  <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                    <strong className="text-slate-100 block mb-1">1. Límite de Endeudamiento Ordinario (&le; 75%)</strong>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      El art. 53 del TRLRHL y la LPGE permiten concertar créditos bancarios a largo plazo por acuerdo del Pleno sin tutela administrativa si la deuda viva no supera el 75% de los ingresos corrientes liquidados.
                    </p>
                  </div>
                  <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                    <strong className="text-slate-100 block mb-1">2. Tutela Previa (75% a 110%) y Prohibición (&gt; 110%)</strong>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Entre el 75% y el 110% de ingresos se requiere autorización preceptiva del Ministerio de Hacienda. Por encima del 110% está terminantemente prohibido concertar nuevas operaciones de crédito a largo plazo para obras.
                    </p>
                  </div>
                  <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                    <strong className="text-slate-100 block mb-1">3. Destino Forzoso del Superávit (art. 32 LOEPSF)</strong>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      El superávit y remanente de tesorería positivo debe destinarse obligatoriamente a amortizar préstamos bancarios de forma anticipada o a Inversiones Financieramente Sostenibles (IFS) si se cumplen las reglas de estabilidad.
                    </p>
                  </div>
                </div>
              </div>

              {/* Vistas Nivel 3 */}
              {dipSubView === 'detail_dip' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico 1: Origen de Fondos (Financiación Interadministrativa) */}
                  <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-md">
                    <div className="h-[360px] w-full">
                      <ReactECharts option={dipFundingOption} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
                    </div>
                  </div>

                  {/* Gráfico 2: Misiones y Gasto Funcional */}
                  <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-md">
                    <div className="h-[360px] w-full">
                      <ReactECharts option={dipFunctionsOption} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
                    </div>
                  </div>
                </div>
              ) : (
                /* Ranking de las 38 Diputaciones de Régimen Común */
                <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300">Ordenar por:</span>
                      {[
                        { id: 'TOTAL', label: '🎯 Gasto Total' },
                        { id: 'carreteras', label: '🚗 Carreteras Provinciales' },
                        { id: 'cooperacion', label: '🏛️ Cooperación POS' },
                        { id: 'bomberos', label: '🚒 Bomberos' }
                      ].map((fn) => (
                        <button
                          key={fn.id}
                          onClick={() => setDipFunction(fn.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            dipFunction === fn.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'
                          }`}
                        >
                          {fn.label}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setDipSortBy(dipSortBy === 'desc' ? 'asc' : 'desc')}
                      className="flex items-center gap-1.5 px-3 py-1 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200"
                    >
                      <ArrowUpDown className="h-3.5 w-3.5" /> {dipSortBy === 'desc' ? 'Mayor a menor' : 'Menor a mayor'}
                    </button>
                  </div>

                  <div className="h-[620px] w-full">
                    <ReactECharts
                      option={dipRankingOption}
                      onEvents={{
                        click: (params) => {
                          if (params.data?.raw?.code) {
                            setSelectedDip(params.data.raw.code);
                            setDipSubView('detail_dip');
                          }
                        }
                      }}
                      style={{ height: '100%', width: '100%' }}
                      opts={{ renderer: 'svg' }}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Modo Aula Pedagógico para Diputaciones */}
          {modoAula && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4.5 rounded-2xl border border-blue-200 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs mt-0.5 shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="space-y-1.5 text-xs text-blue-950">
                  <p className="font-bold text-sm text-blue-900">
                    Píldora Didáctica: ¿Para qué sirve una Diputación Provincial en España?
                  </p>
                  <p className="leading-relaxed">
                    A diferencia del Estado (que gestiona Defensa o Seguridad Social) y de las CC.AA. (que gestionan hospitales y colegios),
                    la <strong>Diputación Provincial</strong> no tiene competencias exclusivas sobre los ciudadanos individuales, sino sobre los 
                    <strong> pequeños municipios (de menos de 20.000 habitantes)</strong>:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                    <div className="bg-white/80 p-2.5 rounded-lg border border-blue-200">
                      <strong className="text-blue-900 block mb-1">🏗️ Obras y Carreteras:</strong>
                      Asfaltan y mantienen miles de kilómetros de la red viaria comarcal que conecta aldeas y pueblos que un ayuntamiento pequeño nunca podría costear.
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-lg border border-blue-200">
                      <strong className="text-blue-900 block mb-1">🚒 Bomberos y Basuras:</strong>
                      Crean y financian consorcios de bomberos y plantas comarcales de tratamiento de residuos sólidos para decenas de pueblos agrupados.
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-lg border border-blue-200">
                      <strong className="text-blue-900 block mb-1">💸 Financiación (PIE):</strong>
                      No cobran IRPF ni IVA directo: más del <strong>70% de su presupuesto</strong> viene directamente de la Participación en los Ingresos del Estado (transferencia del Ministerio de Hacienda).
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          CONTENIDO NIVEL 4: AYUNTAMIENTOS (MUNICIPAL)
          ========================================================================= */}
      {territorialLevel === 'ayuntamientos' && (
        <MunicipalityView
          year={year}
          modoAula={modoAula}
          onNavigateToLevel={(lvl, code) => {
            if (lvl === 'ccaa') {
              setSelectedGeo(code);
              setTerritorialLevel('ccaa');
            } else if (lvl === 'diputaciones') {
              setSelectedDip(code);
              setTerritorialLevel('diputaciones');
            }
          }}
          onOpenGlossaryWithCode={onOpenGlossaryWithCode}
        />
      )}
    </div>
  );
}
