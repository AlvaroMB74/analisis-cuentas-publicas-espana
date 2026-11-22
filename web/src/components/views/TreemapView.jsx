import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { COFOG_COLORS, formatValue, formatRawNumber } from '../../utils/constants';
import { ChevronRight, ArrowLeft, ZoomIn, BookOpen, Layers, Sparkles, Filter } from 'lucide-react';

// Generador de tonos armónicos dentro de la misma gama cromática para las teselas de Nivel 2
function getHarmoniousTint(hex, index, total) {
  let c = (hex || '#64748b').replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  let r = num >> 16;
  let g = (num >> 8) & 0x00ff;
  let b = num & 0x0000ff;

  const step = total > 1 ? index / (total - 1) : 0.5;
  // Variación elegante de luminosidad entre 0.80 y 1.15
  const factor = 0.78 + step * 0.38;
  r = Math.min(255, Math.max(0, Math.round(r * factor)));
  g = Math.min(255, Math.max(0, Math.round(g * factor)));
  b = Math.min(255, Math.max(0, Math.round(b * factor)));

  return `rgb(${r}, ${g}, ${b})`;
}

export default function TreemapView({
  year,
  sector,
  unit,
  cofog,
  glosario,
  modoAula,
  onOpenGlossaryWithCode
}) {
  // Foco opcional en una sola división (null = visión completa de las 10 divisiones con sus teselas anidadas)
  const [focusedDivision, setFocusedDivision] = useState(null);
  const [inspectedCode, setInspectedCode] = useState('GF0107'); // Seleccionado por defecto para mostrar deuda

  const divNames = useMemo(() => {
    return glosario?.cofog_divisiones || {};
  }, [glosario]);

  const groupNames = useMemo(() => {
    return glosario?.cofog_grupos || {};
  }, [glosario]);

  const totalGasto = useMemo(() => {
    if (!cofog?.TOTAL) return 1;
    return formatRawNumber(cofog.TOTAL?.[unit.toLowerCase()] ?? cofog.TOTAL?.mio_eur, unit) || 1;
  }, [cofog, unit]);

  // Estructura jerárquica con teselas internas de Nivel 2 dentro de cada Nivel 1
  const hierarchicalData = useMemo(() => {
    if (!cofog?.divisiones) return [];

    const divisionsToInclude = focusedDivision
      ? [focusedDivision]
      : Object.keys(cofog.divisiones).sort();

    const data = divisionsToInclude.map((divCode) => {
      const divItem = cofog.divisiones[divCode];
      const divVal = formatRawNumber(divItem?.[unit.toLowerCase()] ?? divItem?.mio_eur, unit);
      const divName = divNames[divCode]?.nombre_corto || divCode;
      const baseColor = COFOG_COLORS[divCode] || '#64748b';

      // Obtener todos los subgrupos de Nivel 2 pertenecientes a esta división
      const subgrupos = Object.entries(cofog.grupos || {})
        .filter(([gCode]) => gCode.startsWith(divCode))
        .map(([gCode, gData]) => {
          const gVal = formatRawNumber(gData?.[unit.toLowerCase()] ?? gData?.mio_eur, unit);
          const gName = groupNames[gCode]?.nombre_corto || gCode;
          return { gCode, gVal, gName };
        })
        .filter((item) => item.gVal > 0);

      // Ordenar subgrupos de mayor a menor importe
      subgrupos.sort((a, b) => b.gVal - a.gVal);

      // Crear teselas internas con tonalidades armónicas de la gama de la división
      const children = subgrupos.map((sub, idx) => {
        const tint = getHarmoniousTint(baseColor, idx, subgrupos.length);
        const pctDiv = divVal > 0 ? (sub.gVal / divVal) * 100 : 0;
        const pctTotal = (sub.gVal / totalGasto) * 100;

        return {
          name: `${sub.gCode} ${sub.gName}`,
          code: sub.gCode,
          value: sub.gVal,
          pctDiv: pctDiv,
          pctTotal: pctTotal,
          parentDiv: divCode,
          itemStyle: {
            color: tint,
            borderColor: '#020617',
            borderWidth: 1.5,
            gapWidth: 1.5
          }
        };
      });

      return {
        name: `${divCode} - ${divName}`,
        code: divCode,
        value: divVal,
        pct: (divVal / totalGasto) * 100,
        itemStyle: {
          color: baseColor,
          borderColor: '#020617',
          borderWidth: 3,
          gapWidth: 4
        },
        children: children.length > 0 ? children : undefined
      };
    });

    data.sort((a, b) => b.value - a.value);
    return data;
  }, [cofog, focusedDivision, unit, divNames, groupNames, totalGasto]);

  const chartOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontSize: 13 },
        formatter: (params) => {
          const d = params.data;
          if (!d) return '';
          const isL2 = d.code && d.code.length === 6;
          if (isL2) {
            return `<strong>${d.name}</strong><br/>
              Importe: <span class="font-bold text-amber-400">${formatValue(d.value, unit)}</span><br/>
              Peso en su división: <strong>${d.pctDiv?.toFixed(1).replace('.', ',')}%</strong><br/>
              Peso sobre el Gasto Total: <strong>${d.pctTotal?.toFixed(2).replace('.', ',')}%</strong><br/>
              <span class="text-xs text-slate-400">Haz clic para ver su ficha didáctica</span>`;
          }
          return `<strong>${d.name}</strong><br/>
            Importe división: <span class="font-bold text-blue-400">${formatValue(d.value, unit)}</span><br/>
            Peso sobre el Gasto Total: <span class="font-bold text-emerald-400">${d.pct?.toFixed(1).replace('.', ',')}%</span><br/>
            <span class="text-xs text-slate-400">Contiene ${d.children?.length || 0} subgrupos de Nivel 2</span>`;
        }
      },
      series: [
        {
          type: 'treemap',
          data: hierarchicalData,
          roam: false,
          nodeClick: false, // Manejamos el clic mediante eventos para sincronizar ficha
          width: '100%',
          height: '100%',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          levels: [
            {
              itemStyle: {
                borderColor: '#020617',
                borderWidth: 3,
                gapWidth: 3
              },
              upperLabel: {
                show: true,
                height: 24,
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: 11,
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                formatter: '{b}'
              }
            },
            {
              itemStyle: {
                borderColor: '#0f172a',
                borderWidth: 1,
                gapWidth: 1
              },
              label: {
                show: true,
                position: 'inside',
                formatter: (params) => {
                  const d = params.data;
                  if (!d) return '';
                  // Nombre recortado y conciso para que no sature la tesela
                  const short = d.name.replace(d.code + ' ', '');
                  return `{code|${d.code}}\n{name|${short.length > 22 ? short.slice(0, 20) + '...' : short}}\n{val|${formatValue(d.value, unit)}}`;
                },
                rich: {
                  code: { fontSize: 10, fontWeight: 'bold', color: '#ffffff', lineHeight: 13 },
                  name: { fontSize: 9, color: '#f1f5f9', lineHeight: 12 },
                  val: { fontSize: 10, fontWeight: 'bold', color: '#fef08a', lineHeight: 15 }
                }
              }
            }
          ]
        }
      ]
    };
  }, [hierarchicalData, unit]);

  const onChartClick = (params) => {
    if (params.data && params.data.code) {
      setInspectedCode(params.data.code);
    }
  };

  // Obtener ficha del concepto inspeccionado para la tarjeta lateral
  const activeFicha = useMemo(() => {
    if (!inspectedCode) return null;
    if (glosario?.cofog_grupos && glosario.cofog_grupos[inspectedCode]) {
      return glosario.cofog_grupos[inspectedCode];
    }
    if (glosario?.cofog_divisiones && glosario.cofog_divisiones[inspectedCode]) {
      return glosario.cofog_divisiones[inspectedCode];
    }
    return null;
  }, [inspectedCode, glosario]);

  return (
    <div className="space-y-4">
      {/* Barra de Filtro y Foco por División */}
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-bold text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Foco en división:
          </span>

          <button
            onClick={() => setFocusedDivision(null)}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              !focusedDivision
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-800 text-slate-600 hover:bg-slate-700'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Todas las 10 Divisiones Jerárquicas</span>
          </button>

          {[
            { code: 'GF10', label: 'GF10 Protección Social' },
            { code: 'GF07', label: 'GF07 Sanidad' },
            { code: 'GF01', label: 'GF01 Servicios Públicos y Deuda' },
            { code: 'GF09', label: 'GF09 Educación' },
            { code: 'GF04', label: 'GF04 Asuntos Económicos' }
          ].map((item) => (
            <button
              key={item.code}
              onClick={() => setFocusedDivision(focusedDivision === item.code ? null : item.code)}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 border ${
                focusedDivision === item.code
                  ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                  : 'bg-white text-slate-200 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COFOG_COLORS[item.code] }} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {focusedDivision && (
          <button
            onClick={() => setFocusedDivision(null)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Ver las 10 Divisiones</span>
          </button>
        )}
      </div>

      {/* Panel Principal: Treemap Jerárquico + Ficha Maestra-Detalle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Treemap Jerárquico con teselas anidadas */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <ZoomIn className="h-4 w-4 text-blue-600" />
                <span>
                  {focusedDivision
                    ? `Teselas de Nivel 2 en ${focusedDivision} - ${divNames[focusedDivision]?.nombre_corto}`
                    : 'Treemap Jerárquico: 10 Divisiones COFOG con Teselas Internas de Nivel 2'}
                </span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Cada gran bloque contiene sus subgrupos proporcionales. Observa cómo <strong>GF0107 (Intereses Deuda)</strong> destaca dentro de GF01, o <strong>GF1002 (Jubilación)</strong> dentro de GF10.
              </p>
            </div>
          </div>

          <div className="h-[520px] w-full rounded-xl overflow-hidden border border-slate-800">
            <ReactECharts
              option={chartOption}
              style={{ height: '100%', width: '100%' }}
              onEvents={{ click: onChartClick }}
              notMerge={true}
            />
          </div>
        </div>

        {/* Ficha Pedagógica de la Tesela Seleccionada */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-amber-500" />
                Ficha Didáctica de la Tesela
              </span>
              <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-bold bg-slate-900 text-white">
                {inspectedCode}
              </span>
            </div>

            {activeFicha ? (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <h3 className="font-bold text-white text-base leading-snug">
                    {activeFicha.nombre_corto}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                      {inspectedCode.length === 6 ? 'Subgrupo de Nivel 2' : 'División de Nivel 1'}
                    </span>
                  </div>
                </div>

                {/* Explicación para el aula de secundaria */}
                <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-900/60 text-amber-300 text-xs leading-relaxed space-y-1">
                  <strong className="block text-amber-900 font-bold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    ¿Qué se financia exactamente aquí?
                  </strong>
                  <p>{activeFicha.explicacion_aula}</p>
                </div>

                {/* Definición técnica SEC-2010 */}
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800 text-slate-200 text-xs leading-relaxed space-y-1">
                  <strong className="block text-slate-800 font-bold">Definición Técnica Oficial:</strong>
                  <p>{activeFicha.definicion_tecnica}</p>
                </div>

                {/* Nota de consolidación */}
                {activeFicha.nota_consolidacion && (
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-900/60/70 text-blue-950 text-xs leading-relaxed space-y-1">
                    <strong className="block text-blue-300 font-bold">Nota de Consolidación Contable:</strong>
                    <p>{activeFicha.nota_consolidacion}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs">
                Haz clic en cualquier tesela del Treemap para ver su explicación pedagógica y datos detallados.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4">
            <button
              onClick={() => onOpenGlossaryWithCode(inspectedCode)}
              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <span>Abrir Ficha en el Glosario Completo</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
