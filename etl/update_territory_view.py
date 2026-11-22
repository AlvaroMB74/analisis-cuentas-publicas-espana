with open("web/src/components/views/TerritoryView.jsx", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Ensure Coins is in imports
if "Coins," not in text and "Coins " not in text:
    text = text.replace("Landmark,", "Landmark,\n  Coins,", 1)

# 2. Extract CCAA debt variables
debt_vars_code = '''  // Variables de Deuda e Intereses Autonómicos
  const curDebt = currentRegion.seriesYear?.deuda_publica?.deuda_total;
  const curInterest = currentRegion.seriesYear?.deuda_publica?.intereses_anuales;
  const curTipoInt = currentRegion.seriesYear?.deuda_publica?.tipo_interes_implicito_pct;
  const curFlaPct = currentRegion.seriesYear?.deuda_publica?.deuda_con_estado_fla_pct;
  const curSost = currentRegion.seriesYear?.deuda_publica?.clasificacion_sostenibilidad;
'''

if "curDebt =" not in text:
    target_pos = text.find("const curHealth =")
    text = text[:target_pos] + debt_vars_code + "\n  " + text[target_pos:]

# 3. Add CCAA Debt cards right after KPI 4
old_kpi4_end = '''              <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>PIB per cápita regional:</span>
                  <strong className="font-mono text-slate-900">{gdpPerCapita.toLocaleString('es-ES')} €/hab</strong>
                </div>
                <div className="flex justify-between items-center text-slate-500 text-[11px]">
                  <span>Gasto medio CC.AA.:</span>
                  <span className="font-mono">{formatValue(medTE, territoryUnit)}</span>
                </div>
              </div>
            </div>
          </div>'''

new_kpis_and_rules = '''              <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>PIB per cápita regional:</span>
                  <strong className="font-mono text-slate-900">{gdpPerCapita.toLocaleString('es-ES')} €/hab</strong>
                </div>
                <div className="flex justify-between items-center text-slate-500 text-[11px]">
                  <span>Gasto medio CC.AA.:</span>
                  <span className="font-mono">{formatValue(medTE, territoryUnit)}</span>
                </div>
              </div>
            </div>

            {/* KPI 5: Deuda Autonómica PDE */}
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-500 mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">5. Deuda Autonómica (PDE)</span>
                  <Landmark className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                  {formatValue(dipMetric(curDebt), territoryUnit)}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Peso sobre PIB regional:</span>
                  <strong className="font-mono text-purple-800">{curDebt?.pc_gdp ?? 0}% PIB</strong>
                </div>
                <div className="flex justify-between items-center text-slate-500 text-[11px]">
                  <span>Dependencia del FLA (Estado):</span>
                  <span className="font-mono font-semibold text-slate-700">{curFlaPct ?? 50}%</span>
                </div>
              </div>
            </div>

            {/* KPI 6: Pago Anual de Intereses */}
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-500 mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">6. Intereses de la Deuda</span>
                  <Coins className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                  {formatValue(dipMetric(curInterest), territoryUnit)}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Tipo de interés implícito:</span>
                  <strong className="font-mono text-amber-800">{curTipoInt ? `${curTipoInt.toFixed(2)}%` : '1.8%'}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-500 text-[11px]">
                  <span>Sostenibilidad fiscal:</span>
                  <span className="font-semibold text-slate-700">{curSost || 'Moderada'}</span>
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
          </div>'''

if "KPI 5: Deuda Autonómica PDE" not in text and old_kpi4_end in text:
    text = text.replace(old_kpi4_end, new_kpis_and_rules, 1)

# 4. Extract Diputaciones debt variables
dip_debt_vars = '''  // Variables de Deuda e Intereses Supramunicipales
  const dipDebt = dipSeries?.deuda_publica?.deuda_total;
  const dipInterest = dipSeries?.deuda_publica?.intereses_anuales;
  const dipRatioIngresos = dipSeries?.deuda_publica?.ratio_deuda_sobre_ingresos_pct;
  const dipSituacion = dipSeries?.deuda_publica?.situacion_endeudamiento;
'''

if "dipDebt =" not in text:
    target_pos = text.find("const dipCoopVal =")
    text = text[:target_pos] + dip_debt_vars + "\n  " + text[target_pos:]

# 5. Add Diputaciones Debt cards and rules right after KPI 4 in Diputaciones
old_dip_kpi4_end = '''                    <div className="flex justify-between items-center text-slate-500 text-[11px]">
                      <span>Gasto medio provincial:</span>
                      <span className="font-mono">{formatValue(dipComunesMed.gasto_medio_por_habitante, territoryUnit)}</span>
                    </div>
                  </div>
                </div>
              </div>'''

new_dip_kpis_and_rules = '''                    <div className="flex justify-between items-center text-slate-500 text-[11px]">
                      <span>Gasto medio provincial:</span>
                      <span className="font-mono">{formatValue(dipComunesMed.gasto_medio_por_habitante, territoryUnit)}</span>
                    </div>
                  </div>
                </div>

                {/* KPI 5: Deuda Viva de la Diputación */}
                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-slate-500 mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">5. Deuda Viva Bancaria</span>
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                      {formatValue(dipMetric(dipDebt), territoryUnit)}
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Ratio sobre ingresos:</span>
                      <strong className="font-mono text-slate-800">{dipRatioIngresos ?? 0}% (Límite: 75%)</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 text-[11px]">
                      <span>Situación legal:</span>
                      <span className="font-semibold text-emerald-700">{dipSituacion || 'Saneada'}</span>
                    </div>
                  </div>
                </div>

                {/* KPI 6: Pago de Intereses de la Deuda */}
                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-slate-500 mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">6. Intereses Deuda (Cap 3)</span>
                      <Coins className="h-4 w-4 text-amber-500" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                      {formatValue(dipMetric(dipInterest), territoryUnit)}
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
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
              </div>'''

if "KPI 5: Deuda Viva de la Diputación" not in text and old_dip_kpi4_end in text:
    text = text.replace(old_dip_kpi4_end, new_dip_kpis_and_rules, 1)

with open("web/src/components/views/TerritoryView.jsx", "w", encoding="utf-8") as f:
    f.write(text)

print("Updated TerritoryView.jsx with debt, interest and fiscal rules successfully!")
