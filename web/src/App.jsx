import React, { useState, useMemo } from 'react';
import rawData from './data/cuentas_espana_consolidadas.json';
import rawGlosario from './data/glosario_pedagogico.json';

import Sidebar from './components/Sidebar';
import KpiCards from './components/KpiCards';
import GlossaryModal from './components/GlossaryModal';

import SankeyView from './components/views/SankeyView';
import TreemapView from './components/views/TreemapView';
import EvolutionView from './components/views/EvolutionView';
import TableView from './components/views/TableView';
import SocialBalanceView from './components/views/SocialBalanceView';
import TerritoryView from './components/views/TerritoryView';

import { GitCommit, LayoutGrid, History, Table as TableIcon, Scale, MapPin, Sparkles, HelpCircle } from 'lucide-react';
import { SECTORS, UNITS } from './utils/constants';

export default function App() {
  const [year, setYear] = useState('2024');
  const [sector, setSector] = useState('S13');
  const [unit, setUnit] = useState('MIO_EUR');
  
  // 4. Modo Aula en OFF por defecto
  const [modoAula, setModoAula] = useState(false);
  const [activeTab, setActiveTab] = useState('sankey');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalItemCode, setModalItemCode] = useState('S13');

  // Metadatos y años disponibles
  const availableYears = useMemo(() => {
    if (!rawData?.macro) return ['2024'];
    return Object.keys(rawData.macro).sort();
  }, []);

  const sectorObj = useMemo(() => {
    return SECTORS.find((item) => item.id === sector) || { id: sector, label: sector };
  }, [sector]);

  const unitObj = useMemo(() => {
    return UNITS.find((item) => item.id === unit) || { id: unit, label: unit, shortLabel: unit };
  }, [unit]);

  // Datos del año y sector seleccionados
  const macroYear = useMemo(() => {
    return rawData?.macro?.[year] || {};
  }, [year]);

  const sectorSeries = useMemo(() => {
    return rawData?.sectores?.[sector] || {};
  }, [sector]);

  const resumenFiscalYear = useMemo(() => {
    return sectorSeries?.resumen_fiscal?.[year] || {};
  }, [sectorSeries, year]);

  const ingresosYear = useMemo(() => {
    return sectorSeries?.ingresos_desglose?.[year] || {};
  }, [sectorSeries, year]);

  const cofogYear = useMemo(() => {
    return sectorSeries?.gastos_cofog?.[year] || {};
  }, [sectorSeries, year]);

  const handleOpenGlossaryWithCode = (code) => {
    setModalItemCode(code);
    setModalOpen(true);
  };

  const tabs = [
    { id: 'sankey', label: '1. El Gran Flujo (Sankey)', icon: GitCommit, desc: 'Origen y destino del dinero público' },
    { id: 'treemap', label: '2. Mapa del Gasto (Treemap)', icon: LayoutGrid, desc: 'Desglose proporcional con zoom a Nivel 2' },
    { id: 'social_balance', label: '3. Balanza de Servicios y Seguros', icon: Scale, desc: 'Seguros sociales vs prestaciones y desmitificador de sanidad' },
    { id: 'evolution', label: '4. Túnel del Tiempo (2000-2024)', icon: History, desc: 'Evolución histórica y ciclos fiscales' },
    { id: 'table', label: '5. Explorador de Tablas y Exportación', icon: TableIcon, desc: 'Búsqueda, detalles didácticos y descarga Excel' },
    { id: 'territory', label: '6. Territorio (CC.AA., Provincias, Ayuntamientos)', icon: MapPin, desc: 'Exploración multinivel: 17 CC.AA., 50 Diputaciones y Ayuntamientos' },
  ];

  const activeTabObj = useMemo(() => {
    return tabs.find((t) => t.id === activeTab) || tabs[0];
  }, [activeTab]);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-slate-950 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. Barra Lateral a la Izquierda (Sidebar 16:10 Desktop) */}
      <Sidebar
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        year={year}
        setYear={setYear}
        availableYears={availableYears}
        sector={sector}
        setSector={setSector}
        unit={unit}
        setUnit={setUnit}
        modoAula={modoAula}
        setModoAula={setModoAula}
        onOpenGlossary={() => handleOpenGlossaryWithCode('S13')}
        onOpenGlossaryWithCode={handleOpenGlossaryWithCode}
      />

      {/* 2. Área de Visualización Principal Panorámica */}
      <main className="flex-1 h-screen overflow-y-auto p-5 xl:p-6 space-y-4 bg-slate-950">
        
        {/* Barra Superior Contextual del Módulo Activo */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <activeTabObj.icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                {activeTabObj.label}
              </h2>
              <p className="text-[11px] text-slate-400">
                {activeTabObj.desc}
              </p>
            </div>
          </div>

          {/* Badges de Estado Activo */}
          <div className="flex items-center gap-2 text-xs">
            {activeTab !== 'territory' && (
              <span className="bg-slate-800 text-indigo-300 border border-indigo-900/60 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                {sectorObj.label}
              </span>
            )}
            <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg font-mono font-semibold">
              {year}
            </span>
            <span className="bg-slate-800 text-emerald-300 border border-emerald-900/60 px-2.5 py-1 rounded-lg font-mono font-semibold">
              {unitObj.shortLabel}
            </span>
          </div>
        </div>

        {/* Banner Pedagógico Contextual de Aula (Solo si modoAula está en ON) */}
        {modoAula && (
          <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-md animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0 animate-pulse" />
              <div>
                <strong className="text-amber-300 font-bold">Guía para el aula de Secundaria:</strong>{' '}
                <span className="text-slate-300">
                  {activeTab === 'sankey' && 'Observa cómo los impuestos de familias y empresas entran por la izquierda, se consolidan en el centro y se reparten a las 10 divisiones de gasto por la derecha.'}
                  {activeTab === 'treemap' && 'El tamaño de cada recuadro representa exactamente su peso en el presupuesto. Haz clic en las áreas mayores para descubrir sus subpartidas de Nivel 2.'}
                  {activeTab === 'social_balance' && 'Analiza la balanza de desempleo y pensiones: descubre por qué las cotizaciones pagan las pensiones, pero los impuestos financian la sanidad.'}
                  {activeTab === 'evolution' && 'Viaja en el tiempo para ver cómo cambiaron los ingresos y gastos durante la crisis de 2008, la pandemia de 2020 y los años recientes.'}
                  {activeTab === 'table' && 'Consulta las cifras oficiales en una matriz estructurada y exporta a Excel para realizar tus propios ejercicios prácticos.'}
                  {activeTab === 'territory' && 'Compara qué comunidad o ayuntamiento invierte más en sanidad, educación o limpieza viaria por cada habitante (€/hab).'}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleOpenGlossaryWithCode(sector)}
              className="px-2.5 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 rounded-lg font-bold text-[11px] shrink-0 transition"
            >
              Ficha del nivel
            </button>
          </div>
        )}

        {/* 3. Tarjetas KPI Superiores (Sensibles al Contexto: Solo visibles en Pestañas 1 a 5) */}
        {activeTab !== 'territory' && (
          <KpiCards
            year={year}
            sector={sector}
            unit={unit}
            resumenFiscal={resumenFiscalYear}
            deudaPublica={rawData?.sectores?.[sector]?.deuda_publica?.[year]}
            marcoNormativo={rawData?.sectores?.[sector]?.marco_normativo_fiscal}
            macro={macroYear}
            onOpenGlossaryWithCode={handleOpenGlossaryWithCode}
          />
        )}

        {/* 4. Renderizado del Módulo Activo */}
        <div className="animate-fadeIn">
          {activeTab === 'sankey' && (
            <SankeyView
              year={year}
              sector={sector}
              sectorName={sectorObj.label}
              unit={unit}
              ingresos={ingresosYear}
              cofog={cofogYear}
              resumenFiscal={resumenFiscalYear}
              modoAula={modoAula}
              onNodeClick={handleOpenGlossaryWithCode}
            />
          )}

          {activeTab === 'treemap' && (
            <TreemapView
              year={year}
              sector={sector}
              unit={unit}
              cofog={cofogYear}
              glosario={rawGlosario}
              modoAula={modoAula}
              onOpenGlossaryWithCode={handleOpenGlossaryWithCode}
            />
          )}

          {activeTab === 'social_balance' && (
            <SocialBalanceView
              year={year}
              sector={sector}
              unit={unit}
              balanzas={sectorSeries?.balanzas_sociales?.[year] || {}}
              modoAula={modoAula}
              onOpenGlossaryWithCode={handleOpenGlossaryWithCode}
            />
          )}

          {activeTab === 'evolution' && (
            <EvolutionView
              sector={sector}
              sectorName={sectorObj.label}
              unit={unit}
              seriesSector={sectorSeries}
              macroData={rawData?.macro || {}}
              modoAula={modoAula}
            />
          )}

          {activeTab === 'table' && (
            <TableView
              year={year}
              sector={sector}
              sectorName={sectorObj.label}
              unit={unit}
              rawData={rawData}
              glosario={rawGlosario}
              onOpenGlossaryWithCode={handleOpenGlossaryWithCode}
            />
          )}

          {activeTab === 'territory' && (
            <TerritoryView
              year={year}
              macroYear={macroYear}
              modoAula={modoAula}
              globalUnit={unit}
            />
          )}
        </div>

      </main>

      {/* 5. Modal de Glosario Pedagógico SEC-2010 */}
      <GlossaryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialCode={modalItemCode}
        glosario={rawGlosario}
      />

    </div>
  );
}
