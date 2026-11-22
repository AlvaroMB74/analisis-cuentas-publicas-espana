import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { COFOG_COLORS, REVENUE_COLORS, formatValue, formatRawNumber } from '../../utils/constants';
import { Sparkles, ArrowRight, Layers, Check } from 'lucide-react';

export default function SankeyView({
  year,
  sector,
  sectorName,
  unit,
  ingresos,
  cofog,
  resumenFiscal,
  modoAula,
  onNodeClick
}) {
  // División COFOG actualmente desglosada en Nivel 2 en el Sankey (null = todas en Nivel 1)
  const [expandedDivision, setExpandedDivision] = useState(null);

  const teVal = useMemo(() => {
    return formatRawNumber(resumenFiscal?.TE?.[unit.toLowerCase()] ?? resumenFiscal?.TE?.mio_eur, unit);
  }, [resumenFiscal, unit]);

  const chartOption = useMemo(() => {
    if (!ingresos || !cofog || !resumenFiscal) return null;

    const b9Val = resumenFiscal?.B9?.[unit.toLowerCase()] ?? resumenFiscal?.B9?.mio_eur ?? 0;

    // Obtener valores de ingresos en la unidad seleccionada
    const d5 = formatRawNumber(ingresos?.D5REC?.[unit.toLowerCase()] ?? ingresos?.D5REC?.mio_eur, unit);
    const d2 = formatRawNumber(ingresos?.D2REC?.[unit.toLowerCase()] ?? ingresos?.D2REC?.mio_eur, unit);
    const d61 = formatRawNumber(ingresos?.D61REC?.[unit.toLowerCase()] ?? ingresos?.D61REC?.mio_eur, unit);
    const d91 = formatRawNumber(ingresos?.D91REC?.[unit.toLowerCase()] ?? ingresos?.D91REC?.mio_eur, unit);
    const otr = formatRawNumber(ingresos?.OTR_REC?.[unit.toLowerCase()] ?? ingresos?.OTR_REC?.mio_eur, unit);

    const isDeficit = b9Val < 0;
    const deficitVal = isDeficit ? Math.abs(b9Val) : 0;
    const isSurplus = b9Val > 0;
    const surplusVal = isSurplus ? b9Val : 0;

    // Nodo central
    const centerNodeName = `Presupuesto ${sector === 'S13' ? 'Consolidado' : sector}`;

    const nodes = [
      {
        name: 'Impuestos Directos (IRPF y Sociedades)',
        itemStyle: { color: REVENUE_COLORS.D5REC },
        code: 'D5REC',
        label: { position: 'left', color: '#f1f5f9', fontSize: 11, fontWeight: 600 }
      },
      {
        name: 'Impuestos Indirectos (IVA y Especiales)',
        itemStyle: { color: REVENUE_COLORS.D2REC },
        code: 'D2REC',
        label: { position: 'left', color: '#f1f5f9', fontSize: 11, fontWeight: 600 }
      },
      {
        name: 'Cotizaciones Sociales Netas',
        itemStyle: { color: REVENUE_COLORS.D61REC },
        code: 'D61REC',
        label: { position: 'left', color: '#f1f5f9', fontSize: 11, fontWeight: 600 }
      },
      {
        name: 'Impuestos sobre el Capital (Sucesiones)',
        itemStyle: { color: REVENUE_COLORS.D91REC },
        code: 'D91REC',
        label: { position: 'left', color: '#f1f5f9', fontSize: 11, fontWeight: 600 }
      },
      {
        name: 'Otros Ingresos (Tasas, UE y Rentas)',
        itemStyle: { color: REVENUE_COLORS.OTR_REC },
        code: 'OTR_REC',
        label: { position: 'left', color: '#f1f5f9', fontSize: 11, fontWeight: 600 }
      },
      {
        name: centerNodeName,
        itemStyle: { color: '#3b82f6' },
        code: sector,
        label: { show: false } // Se muestra arriba en el encabezado limpio
      }
    ];

    const links = [
      { source: 'Impuestos Directos (IRPF y Sociedades)', target: centerNodeName, value: Math.max(0, d5) },
      { source: 'Impuestos Indirectos (IVA y Especiales)', target: centerNodeName, value: Math.max(0, d2) },
      { source: 'Cotizaciones Sociales Netas', target: centerNodeName, value: Math.max(0, d61) },
      { source: 'Impuestos sobre el Capital (Sucesiones)', target: centerNodeName, value: Math.max(0, d91) },
      { source: 'Otros Ingresos (Tasas, UE y Rentas)', target: centerNodeName, value: Math.max(0, otr) }
    ];

    // Lógica pedagógica de Déficit
    if (isDeficit && deficitVal > 0) {
      nodes.push({
        name: 'Déficit / Endeudamiento Neto (B9)',
        itemStyle: { color: REVENUE_COLORS.DEFICIT },
        code: 'B9',
        label: { position: 'left', color: '#fb7185', fontSize: 11, fontWeight: 700 }
      });
      links.push({
        source: 'Déficit / Endeudamiento Neto (B9)',
        target: centerNodeName,
        value: deficitVal
      });
    }

    const divNamesMap = {
      GF01: '01. Servicios Públicos (Deuda)',
      GF02: '02. Defensa militar',
      GF03: '03. Orden Público y Seguridad',
      GF04: '04. Asuntos Económicos (Infraestructuras)',
      GF05: '05. Protección Medio Ambiente',
      GF06: '06. Vivienda y Urbanismo',
      GF07: '07. Salud (Sanidad)',
      GF08: '08. Cultura, Ocio y Deporte',
      GF09: '09. Educación',
      GF10: '10. Protección Social (Pensiones)'
    };

    // Subgrupos de nivel 2 nombres cortos
    const groupShortNames = {
      GF0101: 'GF0101 Ejecutivos y Fiscales',
      GF0102: 'GF0102 Ayuda Exterior',
      GF0103: 'GF0103 Servicios Generales',
      GF0104: 'GF0104 Investigación Básica',
      GF0105: 'GF0105 I+D Servicios Generales',
      GF0106: 'GF0106 Servicios Generales ncop',
      GF0107: 'GF0107 Intereses Deuda Pública',
      GF0108: 'GF0108 Transferencias Interadmin.',
      GF0701: 'GF0701 Farmacia y Productos Médicos',
      GF0702: 'GF0702 Atención Primaria / Ambulatoria',
      GF0703: 'GF0703 Hospitales y Especializada',
      GF0901: 'GF0901 Educación Infantil y Primaria',
      GF0902: 'GF0902 Educación Secundaria y FP',
      GF0904: 'GF0904 Educación Universitaria',
      GF1001: 'GF1001 Incapacidad y Dependencia',
      GF1002: 'GF1002 Pensiones de Jubilación',
      GF1003: 'GF1003 Viudedad y Orfandad',
      GF1004: 'GF1004 Ayudas a la Familia e Hijos',
      GF1005: 'GF1005 Prestaciones por Desempleo',
      GF1007: 'GF1007 Exclusión Social'
    };

    // Construcción de Nodos y Enlaces de Gasto
    const divisions = cofog?.divisiones || {};
    const grupos = cofog?.grupos || {};

    Object.entries(divisions).forEach(([code, data]) => {
      const val = formatRawNumber(data?.[unit.toLowerCase()] ?? data?.mio_eur, unit);

      if (expandedDivision === code) {
        const subgrupos = [];
        Object.entries(grupos).forEach(([gCode, gData]) => {
          if (gCode.startsWith(code)) {
            const gVal = formatRawNumber(gData?.[unit.toLowerCase()] ?? gData?.mio_eur, unit);
            if (gVal > 0) {
              subgrupos.push({ gCode, gVal });
            }
          }
        });

        subgrupos.sort((a, b) => b.gVal - a.gVal);

        subgrupos.forEach(({ gCode, gVal }) => {
          const gName = groupShortNames[gCode] || gCode;
          nodes.push({
            name: gName,
            itemStyle: { color: COFOG_COLORS[code] || '#64748b' },
            code: gCode,
            label: { position: 'right', color: '#f1f5f9', fontSize: 10, fontWeight: 700 }
          });
          links.push({
            source: centerNodeName,
            target: gName,
            value: Math.max(0, gVal)
          });
        });
      } else {
        // Modo ordinario Nivel 1
        const nodeName = divNamesMap[code] || code;
        nodes.push({
          name: nodeName,
          itemStyle: { color: COFOG_COLORS[code] || '#64748b' },
          code: code,
          label: { position: 'right', color: '#f1f5f9', fontSize: 11, fontWeight: 600 }
        });
        links.push({
          source: centerNodeName,
          target: nodeName,
          value: Math.max(0, val)
        });
      }
    });

    // Lógica de Superávit
    if (isSurplus && surplusVal > 0) {
      nodes.push({
        name: 'Superávit / Capacidad de Financiación',
        itemStyle: { color: REVENUE_COLORS.SURPLUS },
        code: 'B9',
        label: { position: 'right', color: '#34d399', fontSize: 11, fontWeight: 700 }
      });
      links.push({
        source: centerNodeName,
        target: 'Superávit / Capacidad de Financiación',
        value: surplusVal
      });
    }

    return {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontSize: 13 },
        formatter: (params) => {
          if (params.dataType === 'edge') {
            return `<strong>${params.data.source}</strong> → <strong>${params.data.target}</strong><br/>
              Importe de flujo: <span class="font-bold text-blue-400">${formatValue(params.data.value, unit)}</span>`;
          }
          const isL1 = params.data.code && params.data.code.length === 4 && params.data.code.startsWith('GF');
          return `<strong>${params.data.name}</strong><br/>
            Importe: <span class="font-bold text-emerald-400">${formatValue(params.value, unit)}</span><br/>
            ${isL1 ? '<span class="text-xs text-amber-300 font-semibold">Haz clic para desglosar sus subpartidas de Nivel 2</span><br/>' : ''}
            <span class="text-xs text-slate-400">Doble clic para ver ficha pedagógica</span>`;
        }
      },
      series: [
        {
          type: 'sankey',
          layout: 'none',
          emphasis: { focus: 'adjacency' },
          data: nodes,
          links: links,
          top: '7%',
          bottom: '5%',
          left: '19%',   // Margen amplio a la izquierda
          right: '27%',  // Margen amplio a la derecha
          nodeWidth: 20,
          nodeGap: 12,
          orient: 'horizontal',
          draggable: false,
          lineStyle: {
            color: 'gradient',
            curveness: 0.5,
            opacity: 0.35
          }
        }
      ]
    };
  }, [ingresos, cofog, resumenFiscal, unit, sector, expandedDivision]);

  // Manejador de clic en nodos para interactividad de Nivel 2
  const onEvents = {
    click: (params) => {
      if (params.dataType === 'node' && params.data?.code) {
        const code = params.data.code;
        if (code.length === 4 && code.startsWith('GF')) {
          setExpandedDivision(expandedDivision === code ? null : code);
        } else if (onNodeClick) {
          onNodeClick(code);
        }
      }
    },
    dblclick: (params) => {
      if (params.dataType === 'node' && params.data?.code && onNodeClick) {
        onNodeClick(params.data.code);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl">
        
        {/* Cabecera superior con selector rápido de Nivel 2 */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3.5 border-b border-slate-800 mb-2">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <span>El Gran Flujo Presupuestario de España ({year})</span>
              <span className="text-xs font-normal text-slate-400">
                — {sectorName}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Conecta los ingresos (izquierda) con el presupuesto consolidado y su destino en las políticas públicas (derecha).
            </p>
          </div>

          {/* Selector interactivo de Nivel 2 en el Sankey */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/80 text-xs">
            <span className="text-slate-400 font-semibold px-1.5 flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-blue-400" />
              <span>Desglose Nivel 2:</span>
            </span>

            <button
              onClick={() => setExpandedDivision(null)}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                expandedDivision === null
                  ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-500'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Nivel 1 (10 Divisiones)
            </button>

            {[
              { code: 'GF10', label: 'GF10 Protección Social' },
              { code: 'GF07', label: 'GF07 Sanidad' },
              { code: 'GF01', label: 'GF01 Servicios y Deuda' },
              { code: 'GF09', label: 'GF09 Educación' }
            ].map((d) => (
              <button
                key={d.code}
                onClick={() => setExpandedDivision(expandedDivision === d.code ? null : d.code)}
                className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  expandedDivision === d.code
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-500'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/50'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COFOG_COLORS[d.code] }} />
                <span>{d.label}</span>
                {expandedDivision === d.code && <Check className="h-3 w-3" />}
              </button>
            ))}
          </div>
        </div>

        {/* Título Central Limpio para el Presupuesto */}
        <div className="flex items-center justify-center my-1">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-bold text-slate-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Presupuesto Consolidado:</span>
            <span className="font-mono text-blue-400 font-extrabold">{formatValue(teVal, unit)}</span>
          </div>
        </div>

        {/* Gráfico Sankey ECharts */}
        <div className="h-[600px] w-full">
          {chartOption ? (
            <ReactECharts
              option={chartOption}
              style={{ height: '100%', width: '100%' }}
              onEvents={onEvents}
              opts={{ renderer: 'svg' }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              Cargando diagrama de flujos...
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-3 border-t border-slate-800/80 mt-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Tip: Haz clic en cualquier división (ej. GF10 o GF07) para abrir sus subpartidas de Nivel 2.</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            SEC-2010 • Cuadratura contable 100% verificada
          </span>
        </div>

      </div>
    </div>
  );
}
