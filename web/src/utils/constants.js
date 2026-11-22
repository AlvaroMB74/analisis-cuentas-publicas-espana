// Constantes, paleta de colores y utilidades de formato para la aplicación

export const COFOG_COLORS = {
  GF01: '#64748b', // Servicios Públicos Generales (Slate)
  GF02: '#0284c7', // Defensa (Sky Blue militar)
  GF03: '#0369a1', // Orden Público y Seguridad (Azul policía)
  GF04: '#f59e0b', // Asuntos Económicos (Ámbar infraestructuras)
  GF05: '#10b981', // Protección del Medio Ambiente (Esmeralda ecológico)
  GF06: '#d97706', // Vivienda y Servicios Comunitarios (Marrón/Ocre)
  GF07: '#ef4444', // Salud / Sanidad (Rojo hospital)
  GF08: '#a855f7', // Ocio, Cultura y Religión (Púrpura)
  GF09: '#2563eb', // Educación (Azul Real académico)
  GF10: '#0d9488', // Protección Social (Teal / Bienestar)
};

export const REVENUE_COLORS = {
  D5REC: '#6366f1',  // Directos (IRPF/Sociedades) - Indigo
  D2REC: '#ec4899',  // Indirectos (IVA/Especiales) - Pink
  D61REC: '#8b5cf6', // Cotizaciones Sociales - Violet
  D91REC: '#84cc16', // Impuestos Capital - Lime
  OTR_REC: '#06b6d4',// Otros Ingresos - Cyan
  DEFICIT: '#f43f5e',// Déficit / Endeudamiento - Rose
  SURPLUS: '#10b981',// Superávit - Emerald
};

export const SECTORS = [
  { id: 'S13', label: 'Total Administraciones Públicas (Consolidado)', shortLabel: 'Total AA.PP. (S13)' },
  { id: 'S1311', label: 'Administración Central (Estado y Ministerios)', shortLabel: 'Estado Central (S1311)' },
  { id: 'S1312', label: 'Comunidades Autónomas (CC.AA.)', shortLabel: 'CC.AA. (S1312)' },
  { id: 'S1313', label: 'Corporaciones Locales (Ayuntamientos y Diputaciones)', shortLabel: 'Locales (S1313)' },
  { id: 'S1314', label: 'Fondos de la Seguridad Social', shortLabel: 'Seguridad Social (S1314)' },
];

export const UNITS = [
  { id: 'MIO_EUR', label: 'Millones de € corrientes', shortLabel: 'M€ corrientes', symbol: 'M€' },
  { id: 'MIO_EUR_CONST', label: 'Millones de € constantes (Base 2024)', shortLabel: 'M€ constantes (2024)', symbol: 'M€ (2024)' },
  { id: 'EUR_HAB', label: 'Euros por habitante', shortLabel: '€ / habitante', symbol: '€/hab' },
  { id: 'PC_GDP', label: 'Porcentaje del PIB (% PIB)', shortLabel: '% del PIB', symbol: '% PIB' },
];

export function formatValue(value, unitId) {
  if (value === null || value === undefined || isNaN(value)) return 'N/D';
  switch (unitId) {
    case 'MIO_EUR':
    case 'MIO_EUR_CONST':
      return `${value.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M€`;
    case 'EUR_HAB':
      return `${Math.round(value).toLocaleString('es-ES')} €/hab`;
    case 'PC_GDP':
      return `${value.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} %`;
    default:
      return `${value.toLocaleString('es-ES')}`;
  }
}

export function formatRawNumber(value, unitId) {
  if (value === null || value === undefined || isNaN(value)) return 0;
  return Number(value);
}
