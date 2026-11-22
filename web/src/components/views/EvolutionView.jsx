import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { COFOG_COLORS, formatValue, formatRawNumber } from '../../utils/constants';
import { History, TrendingUp, BarChart3, LineChart, Sparkles, Filter } from 'lucide-react';

export default function EvolutionView({
  sector,
  sectorName,
  unit,
  seriesData,
  glosario,
  modoAula
}) {
  const [chartType, setChartType] = useState('lines'); // 'lines' o 'stack'
  const [selectedDivs, setSelectedDivs] = useState([
    'GF10', // Protección social
    'GF07', // Sanidad
    'GF09', // Educación
    'GF01', // Servicios públicos / deuda
    'GF04'  // Asuntos económicos
  ]);

  const years = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => String(2000 + i));
  }, []);

  const divNames = useMemo(() => {
    return glosario?.cofog_divisiones || {};
  }, [glosario]);

  // Gráfica 1: Ingresos (TR) vs Gastos (TE) y Saldo B9
  const fiscalOption = useMemo(() => {
    if (!seriesData?.resumen_fiscal) return null;

    const trSeries = [];
    const teSeries = [];
    const b9Series = [];

    years.forEach((y) => {
      const item = seriesData.resumen_fiscal[y];
      const trVal = formatRawNumber(item?.TR?.[unit.toLowerCase()] ?? item?.TR?.mio_eur, unit);
      const teVal = formatRawNumber(item?.TE?.[unit.toLowerCase()] ?? item?.TE?.mio_eur, unit);
      const b9Val = formatRawNumber(item?.B9?.[unit.toLowerCase()] ?? item?.B9?.mio_eur, unit);

      trSeries.push(trVal);
      teSeries.push(teVal);
      b9Series.push(b9Val);
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
            const color = p.color;
            str += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:${color};"></span>
              ${p.seriesName}: <strong>${formatValue(p.value, unit)}</strong><br/>`;
          });
          return str;
        }
      },
      legend: {
        data: ['Ingresos Totales (TR)', 'Gastos Totales (TE)', 'Déficit / Superávit (B9)'],
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
      yAxis: [
        {
          type: 'value',
          name: unit === 'PC_GDP' ? '% del PIB' : unit === 'EUR_HAB' ? '€ / hab' : 'Millones de €',
          axisLine: { show: false },
          splitLine: { lineStyle: { color: '#f1f5f9' } },
          axisLabel: {
            color: '#64748b',
            formatter: (v) => formatValue(v, unit)
          }
        }
      ],
      series: [
        {
          name: 'Ingresos Totales (TR)',
          type: 'line',
          smooth: true,
          data: trSeries,
          itemStyle: { color: '#10b981' },
          lineStyle: { width: 3 },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          name: 'Gastos Totales (TE)',
          type: 'line',
          smooth: true,
          data: teSeries,
          itemStyle: { color: '#2563eb' },
          lineStyle: { width: 3 },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          name: 'Déficit / Superávit (B9)',
          type: 'bar',
          data: b9Series,
          itemStyle: {
            color: (params) => (params.value >= 0 ? '#059669' : '#f43f5e'),
            borderRadius: [4, 4, 0, 0]
          }
        }
      ]
    };
  }, [seriesData, years, unit]);

  // Gráfica 2: Evolución de las políticas COFOG seleccionadas
  const cofogEvolutionOption = useMemo(() => {
    if (!seriesData?.gastos_cofog) return null;

    const allDivCodes = Object.keys(COFOG_COLORS);

    const series = allDivCodes
      .filter((code) => selectedDivs.includes(code))
      .map((code) => {
        const data = years.map((y) => {
          const divData = seriesData.gastos_cofog?.[y]?.divisiones?.[code];
          return formatRawNumber(divData?.[unit.toLowerCase()] ?? divData?.mio_eur, unit);
        });

        const name = `${code} ${divNames[code]?.nombre_corto || code}`;
        const color = COFOG_COLORS[code];

        if (chartType === 'stack') {
          return {
            name: name,
            type: 'line',
            stack: 'Total',
            areaStyle: { opacity: 0.75 },
            emphasis: { focus: 'series' },
            data: data,
            itemStyle: { color: color },
            smooth: true
          };
        }

        return {
          name: name,
          type: 'line',
          smooth: true,
          data: data,
          itemStyle: { color: color },
          lineStyle: { width: 3 },
          symbol: 'circle',
          symbolSize: 5
        };
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
          return str;
        }
      },
      legend: {
        type: 'scroll',
        top: 0,
        textStyle: { color: '#334155', fontSize: 11 }
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
      series: series
    };
  }, [seriesData, years, selectedDivs, chartType, unit, divNames]);

  const toggleDiv = (code) => {
    if (selectedDivs.includes(code)) {
      if (selectedDivs.length > 1) {
        setSelectedDivs(selectedDivs.filter((c) => c !== code));
      }
    } else {
      setSelectedDivs([...selectedDivs, code]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Evolución de Ingresos, Gastos y Déficit */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-4">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" />
              <span>Evolución Presupuestaria y Déficit Público (2000 - 2024)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Observa cómo se abre la tijera presupuestaria durante las crisis económicas y el impacto de los ciclos de consolidación fiscal.
            </p>
          </div>
        </div>

        <div className="h-[380px] w-full">
          {fiscalOption && (
            <ReactECharts
              option={fiscalOption}
              style={{ height: '100%', width: '100%' }}
              notMerge={true}
            />
          )}
        </div>

        {/* Hitos didácticos para el aula */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80">
            <strong className="block font-bold text-amber-950 mb-1">
              • 2008 - 2012: La Gran Crisis Financiera
            </strong>
            <p className="text-amber-900 leading-relaxed">
              El hundimiento de los ingresos tributarios y el rescate a cajas bancarias disparó el déficit público español hasta superar el 10% del PIB (el mayor agujero de la historia reciente).
            </p>
          </div>

          <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200/80">
            <strong className="block font-bold text-rose-950 mb-1">
              • 2020: Pandemia de la COVID-19
            </strong>
            <p className="text-rose-900 leading-relaxed">
              El gasto público en Sanidad, ERTEs y ayudas a empresas creció de forma abrupta para sostener el tejido productivo mientras la economía se paralizaba.
            </p>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/80">
            <strong className="block font-bold text-blue-950 mb-1">
              • 2021 - 2024: Recuperación e Inflación
            </strong>
            <p className="text-blue-900 leading-relaxed">
              Fuerte aumento de la recaudación por el efecto de la inflación en el IVA y el IRPF, reduciendo el déficit de vuelta hacia el entorno del 3% del PIB.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Evolución de las Políticas de Gasto COFOG */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-800/80 mb-4">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <span>Comparador de Políticas Públicas COFOG (2000 - 2024)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Compara el ritmo de crecimiento de las diferentes políticas del Estado del Bienestar.
            </p>
          </div>

          {/* Selector de visualización (Líneas vs Área Apilada) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setChartType('lines')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                  chartType === 'lines' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <LineChart className="h-3.5 w-3.5" />
                <span>Líneas Comparativas</span>
              </button>
              <button
                onClick={() => setChartType('stack')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                  chartType === 'stack' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Área Apilada (Composición)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Selector de Divisiones a Comparar */}
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Filtrar políticas:
          </span>
          {Object.keys(COFOG_COLORS).map((code) => {
            const isSelected = selectedDivs.includes(code);
            const color = COFOG_COLORS[code];
            const name = divNames[code]?.nombre_corto || code;
            return (
              <button
                key={code}
                onClick={() => toggleDiv(code)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-800/60 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span>{code} - {name}</span>
              </button>
            );
          })}
        </div>

        <div className="h-[420px] w-full">
          {cofogEvolutionOption && (
            <ReactECharts
              option={cofogEvolutionOption}
              style={{ height: '100%', width: '100%' }}
              notMerge={true}
            />
          )}
        </div>
      </div>

    </div>
  );
}
