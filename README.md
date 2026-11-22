# Cuentas Públicas de España | Explorador Didáctico SEC-2010

Aplicación interactiva y pedagógica para la exploración y docencia en Educación Secundaria de los **ingresos y gastos públicos CONSOLIDADOS de España** a partir de las fuentes oficiales de **Eurostat** y la **IGAE** (Sistema Europeo de Cuentas Nacionales SEC-2010).

---

## 🏛️ Estructura del Proyecto

```text
├── etl/                           # Motor ETL en Python
│   ├── eurostat_client.py         # Cliente HTTP con caché local, reintentos y parser JSON-stat 2.0
│   ├── extract.py                 # Extractor de datasets (gov_10a_exp, gov_10a_main, demo_pjan, etc.)
│   ├── transform.py               # Transformación, cálculo de 4 métricas y auditoría contable
│   ├── generate_dictionary.py     # Generador del glosario pedagógico SEC-2010
│   └── run_etl.py                 # Orquestador del pipeline y reporte de validación en consola
├── data/
│   ├── raw/                       # Respuestas originales de Eurostat (caché local inmutable)
│   └── processed/                 # Dataset maestro final y glosario
│       ├── cuentas_espana_consolidadas.json (1,97 MB)
│       └── glosario_pedagogico.json
├── docs/
│   ├── glosario_pedagogico.json   # 93 fichas pedagógicas SEC-2010 para Secundaria
│   └── verificacion_datos.md      # Memoria técnica de auditoría y reglas de consolidación
├── web/                           # Aplicación Web Frontend (Vite + React + Tailwind + ECharts)
│   ├── src/
│   │   ├── components/            # Navbar, ControlBar, KpiCards, GlossaryModal
│   │   │   └── views/             # 4 Vistas: Sankey, Treemap, Evolution, Table
│   │   ├── data/                  # Copia local de los JSON para carga instantánea offline
│   │   └── utils/constants.js     # Paleta oficial COFOG, sectores y formateadores
│   └── package.json
└── requirements.txt               # Dependencias Python
```

---

## 🚀 Puesta en Marcha

### 1. Motor ETL (Python)
```bash
# Activar entorno virtual
.venv\Scripts\activate

# Ejecutar extracción y validación oficial
python -m etl.run_etl
```

### 2. Aplicación Web Interactiva
```bash
cd web
npm install
npm run dev
```
La aplicación se abrirá en `http://localhost:5173/`.

---

## 📊 Características y Vistas de la Aplicación

1. **Barra de Control Global (Sticky Header):**
   - **Selector de Año:** Desde 2000 hasta 2024 (último ejercicio cerrado oficial).
   - **Selector de Subsector:** S13 (Total Consolidado), S1311 (Estado Central), S1312 (CC.AA.), S1313 (Corporaciones Locales) y S1314 (Seguridad Social).
   - **Selector de Unidad en tiempo real:**
     - `MIO_EUR`: Millones de € corrientes.
     - `MIO_EUR_CONST`: Millones de € constantes (ajustados a inflación base 2024 con IPCA).
     - `EUR_HAB`: Euros por habitante (€ / hab).
     - `PC_GDP`: Porcentaje del PIB (% PIB).
   - **Switch "Modo Aula":** Activa resúmenes didácticos para Secundaria y destaca las notas de consolidación contable.

2. **Tarjetas KPI Superiores:**
   - Ingresos Totales (`TR`), Gastos Totales (`TE`), Saldo Fiscal (`B9` Déficit o Superávit) y Contexto Macroeconómico (Población, PIB nominal y Gasto medio por habitante).

3. **Las 5 Vistas Didácticas:**
   - **Pestaña 1: "El Gran Flujo (Sankey)":** Diagrama de flujos que conecta impuestos y cotizaciones (izquierda) con el presupuesto (centro) y las 10 divisiones de gasto COFOG (derecha). Si hay déficit (`TE > TR`), incorpora el nodo `"Déficit / Endeudamiento Neto (B9)"` para cuadrar las entradas con los gastos. Al hacer clic en cualquier caja, abre su ficha del glosario.
   - **Pestaña 2: "Mapa del Gasto (Treemap)":** Visualización proporcional de las 10 divisiones COFOG con **drill-down interactivo** a subgrupos de Nivel 2 (ej. desglose de `GF01` en intereses de la deuda vs órganos ejecutivos, o `GF10` en jubilación, desempleo y dependencia) con tarjeta maestra-detalle.
   - **Pestaña 3: "Balanza de Servicios y Seguros":** Análisis de sostenibilidad contributiva y finalista con tres presets didácticos (Balanza del Desempleo, Balanza de Pensiones e Incapacidad, y el Desmitificador de Sanidad vs Cotizaciones) más un comparador libre con checkboxes e histórico temporal.
   - **Pestaña 4: "Túnel del Tiempo (2000-2024)":** Evolución histórica de ingresos, gastos y saldo fiscal junto con el comparador de las 10 políticas COFOG (modo líneas o área apilada).
   - **Pestaña 5: "Explorador de Tablas y Exportación":** Tabla completa filtrable y ordenable con explicaciones didácticas expandibles y exportación directa a **Excel (.xlsx)** y **CSV**.
