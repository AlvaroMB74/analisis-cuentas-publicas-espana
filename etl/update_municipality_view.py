with open("web/src/components/views/MunicipalityView.jsx", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update grid cols to 5 columns on large screens
old_grid = '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">'
new_grid = '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">'
if old_grid in text:
    text = text.replace(old_grid, new_grid, 1)

# 2. Add KPI 5 (Intereses de la Deuda) right after KPI 4
old_kpi4 = '''          {/* KPI 4: Deuda Viva y Población */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">4. Deuda Viva Bancaria</span>
                <ShieldCheck className={`h-4 w-4 ${salud.es_saneado ? 'text-emerald-500' : 'text-amber-500'}`} />
              </div>
              <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {formatValue(curDeuda, localUnit)}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/80 text-xs space-y-1">
              <div className="flex justify-between items-center text-slate-600">
                <span>Ratio sobre ingresos:</span>
                <strong className={`font-mono ${salud.es_saneado ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {curDeudaRatio}% (Límite: 75%)
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Población oficial:</span>
                <strong className="font-mono text-slate-800">{info.poblacion_oficial_2024?.toLocaleString('es-ES')} hab.</strong>
              </div>
            </div>
          </div>'''

new_kpi4_and_5 = '''          {/* KPI 4: Deuda Viva y Población */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">4. Deuda Viva Bancaria</span>
                <ShieldCheck className={`h-4 w-4 ${salud.es_saneado ? 'text-emerald-500' : 'text-amber-500'}`} />
              </div>
              <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {formatValue(curDeuda, localUnit)}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/80 text-xs space-y-1">
              <div className="flex justify-between items-center text-slate-600">
                <span>Ratio sobre ingresos:</span>
                <strong className={`font-mono ${salud.es_saneado ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {curDeudaRatio}% (Límite: 75%)
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Población censada:</span>
                <strong className="font-mono text-slate-800">{info.poblacion_oficial_2024?.toLocaleString('es-ES')} hab.</strong>
              </div>
            </div>
          </div>

          {/* KPI 5: Pago de Intereses de la Deuda */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">5. Intereses Deuda (Cap 3)</span>
                <Coins className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {formatValue(getMetric(exp.cap3_gastos_financieros), localUnit)}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/80 text-xs space-y-1">
              <div className="flex justify-between items-center text-slate-600">
                <span>Régimen legal LRHL:</span>
                <strong className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${curDeudaRatio <= 75 ? 'bg-emerald-100 text-emerald-800' : (curDeudaRatio <= 110 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')}`}>
                  {curDeudaRatio <= 75 ? 'Ordinario (≤75%)' : (curDeudaRatio <= 110 ? 'Tutela Previa' : 'Crédito Prohibido')}
                </strong>
              </div>
              <p className="text-[11px] text-slate-400">Intereses bancarios anuales devengados.</p>
            </div>
          </div>'''

if "KPI 5: Pago de Intereses de la Deuda" not in text and old_kpi4 in text:
    text = text.replace(old_kpi4, new_kpi4_and_5, 1)

# 3. Add Coins to lucide-react imports if missing
if "Coins," not in text and "Coins " not in text:
    text = text.replace("Landmark,", "Landmark,\n  Coins,", 1)

# 4. Enhance Educational Box with Legal Rules on Deficit and Debt
old_edu_box = '''                <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200">
                  <strong className="text-emerald-900 block mb-1">⚖️ Superávit y Regla de Gasto:</strong>
                  A diferencia del Estado y de las CC.AA., los ayuntamientos españoles acumulan un superávit crónico conjunto de más de 7.000 M€ al año debido a la estricta regla de gasto local que les impide gastar los ahorros bancarios sin autorización.
                </div>'''

new_edu_box = '''                <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200">
                  <strong className="text-emerald-900 block mb-1">⚖️ Superávit y Regla de Gasto:</strong>
                  A diferencia del Estado y de las CC.AA., los ayuntamientos acumulan un superávit crónico conjunto de ~7.000 M€ al año debido a la estricta regla de gasto de la LOEPSF.
                </div>
                <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200">
                  <strong className="text-emerald-900 block mb-1">📜 Normas de Deuda (TRLRHL y LPGE):</strong>
                  Hasta el 75% de ingresos corrientes, el Ayuntamiento decide libremente sus préstamos. Entre el 75% y el 110%, requiere autorización previa de Hacienda. Más del 110%: prohibición absoluta de nuevo crédito bancario.
                </div>
                <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200">
                  <strong className="text-emerald-900 block mb-1">💰 Destino del Superávit (Art. 32 LOEPSF):</strong>
                  El superávit local no se puede gastar en gasto corriente: por ley debe destinarse prioritariamente a amortizar deuda bancaria o a Inversiones Financieramente Sostenibles (IFS).
                </div>'''

if "Normas de Deuda (TRLRHL y LPGE)" not in text and old_edu_box in text:
    text = text.replace(old_edu_box, new_edu_box, 1)

with open("web/src/components/views/MunicipalityView.jsx", "w", encoding="utf-8") as f:
    f.write(text)

print("Updated MunicipalityView.jsx with debt, interest and fiscal rules successfully!")
