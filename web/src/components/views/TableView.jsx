import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Search, Download, FileSpreadsheet, ChevronDown, ChevronUp, GraduationCap, Network, Filter } from 'lucide-react';
import { COFOG_COLORS, formatValue, formatRawNumber } from '../../utils/constants';

export default function TableView({
  year,
  sector,
  unit,
  ingresos,
  cofog,
  resumenFiscal,
  glosario,
  onOpenGlossaryWithCode
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'INGRESOS', 'COFOG_DIV', 'COFOG_GRP'
  const [sortField, setSortField] = useState('value'); // 'code', 'name', 'value', 'pct'
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  const totalGasto = useMemo(() => {
    return formatRawNumber(cofog?.TOTAL?.[unit.toLowerCase()] ?? cofog?.TOTAL?.mio_eur, unit) || 1;
  }, [cofog, unit]);

  const totalIngreso = useMemo(() => {
    return formatRawNumber(resumenFiscal?.TR?.[unit.toLowerCase()] ?? resumenFiscal?.TR?.mio_eur, unit) || 1;
  }, [resumenFiscal, unit]);

  // Recopilar todas las partidas
  const rawRows = useMemo(() => {
    const list = [];

    // 1. Ingresos
    if (ingresos) {
      Object.entries(ingresos).forEach(([code, data]) => {
        if (code === 'TR') return;
        const entry = glosario?.ingresos_y_saldos?.[code] || {};
        const val = formatRawNumber(data?.[unit.toLowerCase()] ?? data?.mio_eur, unit);
        const pct = (val / totalIngreso) * 100;
        list.push({
          code,
          name: entry.nombre_corto || code,
          category: 'Ingreso Público',
          categoryType: 'INGRESOS',
          value: val,
          pct: pct,
          pcGdp: data?.pc_gdp,
          eurHab: data?.eur_hab,
          explicacion: entry.explicacion_aula,
          definicion: entry.definicion_tecnica,
          consolidacion: entry.nota_consolidacion
        });
      });
    }

    // 2. Gastos COFOG Nivel 1 (10 Divisiones)
    if (cofog?.divisiones) {
      Object.entries(cofog.divisiones).forEach(([code, data]) => {
        const entry = glosario?.cofog_divisiones?.[code] || {};
        const val = formatRawNumber(data?.[unit.toLowerCase()] ?? data?.mio_eur, unit);
        const pct = (val / totalGasto) * 100;
        list.push({
          code,
          name: entry.nombre_corto || code,
          category: 'División COFOG (Nivel 1)',
          categoryType: 'COFOG_DIV',
          value: val,
          pct: pct,
          pcGdp: data?.pc_gdp,
          eurHab: data?.eur_hab,
          explicacion: entry.explicacion_aula,
          definicion: entry.definicion_tecnica,
          consolidacion: entry.nota_consolidacion
        });
      });
    }

    // 3. Gastos COFOG Nivel 2 (Subgrupos)
    if (cofog?.grupos) {
      Object.entries(cofog.grupos).forEach(([code, data]) => {
        const entry = glosario?.cofog_grupos?.[code] || {};
        const val = formatRawNumber(data?.[unit.toLowerCase()] ?? data?.mio_eur, unit);
        const pct = (val / totalGasto) * 100;
        list.push({
          code,
          name: entry.nombre_corto || code,
          category: 'Subgrupo COFOG (Nivel 2)',
          categoryType: 'COFOG_GRP',
          value: val,
          pct: pct,
          pcGdp: data?.pc_gdp,
          eurHab: data?.eur_hab,
          explicacion: entry.explicacion_aula,
          definicion: entry.definicion_tecnica,
          consolidacion: entry.nota_consolidacion
        });
      });
    }

    return list;
  }, [ingresos, cofog, resumenFiscal, glosario, unit, totalGasto, totalIngreso]);

  // Filtrado y Ordenación
  const filteredRows = useMemo(() => {
    return rawRows
      .filter((row) => {
        if (filterType !== 'ALL' && row.categoryType !== filterType) return false;
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
          row.code.toLowerCase().includes(q) ||
          row.name.toLowerCase().includes(q) ||
          (row.explicacion && row.explicacion.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'value') diff = a.value - b.value;
        else if (sortField === 'pct') diff = a.pct - b.pct;
        else if (sortField === 'code') diff = a.code.localeCompare(b.code);
        else if (sortField === 'name') diff = a.name.localeCompare(b.name);
        return sortAsc ? diff : -diff;
      });
  }, [rawRows, filterType, searchTerm, sortField, sortAsc]);

  const toggleExpand = (code) => {
    setExpandedRows((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Exportar a Excel (.xlsx) con SheetJS
  const exportToExcel = () => {
    const dataToExport = filteredRows.map((r) => ({
      'Código SEC/COFOG': r.code,
      'Denominación Oficial': r.name,
      'Clasificación': r.category,
      [`Importe (${unit})`]: r.value,
      '% sobre el Total': r.pct.toFixed(2) + ' %',
      '% del PIB': r.pcGdp ? r.pcGdp.toFixed(2) + ' %' : 'N/D',
      'Euros por Habitante (€/hab)': r.eurHab ? Math.round(r.eurHab) : 'N/D',
      'Explicación Didáctica Secundaria': r.explicacion || '',
      'Definición Técnica SEC-2010': r.definicion || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Cuentas_${sector}_${year}`);
    XLSX.writeFile(workbook, `Cuentas_Publicas_Espana_${sector}_${year}.xlsx`);
  };

  // Exportar a CSV
  const exportToCsv = () => {
    const dataToExport = filteredRows.map((r) => ({
      'Codigo': r.code,
      'Nombre': r.name,
      'Tipo': r.category,
      'Importe': r.value,
      'Porcentaje_Total': r.pct.toFixed(2),
      'PC_PIB': r.pcGdp || '',
      'EUR_HAB': r.eurHab || '',
      'Explicacion_Aula': (r.explicacion || '').replace(/"/g, '""')
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Cuentas_Publicas_Espana_${sector}_${year}.csv`;
    link.click();
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xs space-y-4">
      {/* Controles superiores: Búsqueda, Filtros y Exportación */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        
        {/* Barra de Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código (ej. GF1002, D2REC) o por texto (pensiones, IVA, becas)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-800/60/50"
          />
        </div>

        {/* Filtros de Categoría */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'INGRESOS', label: 'Ingresos' },
            { id: 'COFOG_DIV', label: 'Grandes Divisiones (Nivel 1)' },
            { id: 'COFOG_GRP', label: 'Subgrupos (Nivel 2)' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === f.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Botones de Exportación */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
            title="Descargar archivo Excel con todas las partidas y notas explicativas"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={exportToCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition"
            title="Descargar datos en formato CSV estándar"
          >
            <Download className="h-4 w-4" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Tabla de Datos */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-800 text-slate-200 font-bold border-b border-slate-800">
              <th className="py-3 px-3 w-8"></th>
              <th
                onClick={() => handleSort('code')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-700/70 transition w-28"
              >
                Código {sortField === 'code' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-700/70 transition"
              >
                Denominación de la Partida {sortField === 'name' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th className="py-3 px-3 w-36">Tipo</th>
              <th
                onClick={() => handleSort('value')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-700/70 transition w-36"
              >
                Importe ({unit}) {sortField === 'value' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th
                onClick={() => handleSort('pct')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-700/70 transition w-24"
              >
                % Total {sortField === 'pct' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th className="py-3 px-3 text-right w-24">% PIB</th>
              <th className="py-3 px-3 text-right w-28">€ / hab</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70">
            {filteredRows.length > 0 ? (
              filteredRows.map((row) => {
                const isExpanded = !!expandedRows[row.code];
                const isDivision = row.categoryType === 'COFOG_DIV';
                const divColor = isDivision ? COFOG_COLORS[row.code] : null;

                return (
                  <React.Fragment key={row.code}>
                    <tr
                      className={`hover:bg-blue-50/40 transition cursor-pointer ${
                        isExpanded ? 'bg-slate-800/60' : ''
                      }`}
                      onClick={() => toggleExpand(row.code)}
                    >
                      <td className="py-2.5 px-3 text-center text-slate-400">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">
                        <span className="flex items-center gap-1.5">
                          {divColor && (
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: divColor }}
                            />
                          )}
                          <span>{row.code}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-100">
                        {row.name}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            row.categoryType === 'INGRESOS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.categoryType === 'COFOG_DIV'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-800 text-slate-200'
                          }`}
                        >
                          {row.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-white">
                        {formatValue(row.value, unit)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-300">
                        {row.pct.toFixed(1).replace('.', ',')} %
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        {row.pcGdp ? `${row.pcGdp.toFixed(1).replace('.', ',')} %` : 'N/D'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        {row.eurHab ? `${Math.round(row.eurHab).toLocaleString('es-ES')} €` : 'N/D'}
                      </td>
                    </tr>

                    {/* Fila expandible con la explicación didáctica y de consolidación */}
                    {isExpanded && (
                      <tr className="bg-amber-50/40">
                        <td colSpan={8} className="p-4 border-t border-b border-amber-200/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="p-3 bg-white rounded-xl border border-amber-200/80 shadow-xs">
                              <span className="flex items-center gap-1.5 font-bold text-amber-900 mb-1.5">
                                <GraduationCap className="h-4 w-4 text-amber-600" />
                                Explicación para el Aula de Secundaria:
                              </span>
                              <p className="text-amber-950 leading-relaxed">
                                {row.explicacion || 'Información didáctica disponible en el glosario pedagógico.'}
                              </p>
                            </div>

                            <div className="p-3 bg-white rounded-xl border border-slate-800 shadow-xs flex flex-col justify-between">
                              <div>
                                <span className="flex items-center gap-1.5 font-bold text-slate-100 mb-1.5">
                                  <Network className="h-4 w-4 text-blue-600" />
                                  Nota de Consolidación Contable SEC-2010:
                                </span>
                                <p className="text-slate-300 leading-relaxed">
                                  {row.consolidacion || 'Flujo consolidado dentro del sector público.'}
                                </p>
                              </div>
                              <div className="pt-2 mt-2 border-t border-slate-800/80 flex justify-end">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenGlossaryWithCode(row.code);
                                  }}
                                  className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                                >
                                  Ver ficha completa en glosario →
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No se encontraron partidas que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
        <span>Mostrando {filteredRows.length} de {rawRows.length} conceptos.</span>
        <span>Haz clic en cualquier fila para desplegar su explicación didáctica.</span>
      </div>
    </div>
  );
}
