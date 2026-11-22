import re

# 1. Update TerritoryView.jsx
with open("web/src/components/views/TerritoryView.jsx", "r", encoding="utf-8") as f:
    text = f.read()

# Add useEffect import if missing
if "useEffect" not in text:
    text = text.replace("useState, useMemo", "useState, useMemo, useEffect", 1)

# Sync globalUnit
unit_sync_code = """  // Sincronizar unidad global de la barra lateral con la vista territorial
  useEffect(() => {
    if (globalUnit) {
      setTerritoryUnit(globalUnit);
    }
  }, [globalUnit]);
"""
if "Sincronizar unidad global" not in text:
    target_pos = text.find("const unitKey = useMemo(")
    text = text[:target_pos] + unit_sync_code + "\n  " + text[target_pos:]

# Theme classes replacements
text = text.replace("bg-white p-", "bg-slate-900/90 p-")
text = text.replace("bg-white rounded-2xl", "bg-slate-900/90 rounded-2xl")
text = text.replace("bg-white text-slate-900", "bg-blue-600 text-white")
text = text.replace("border-slate-200 shadow-xs", "border-slate-800 shadow-md")
text = text.replace("border-slate-200", "border-slate-800")
text = text.replace("border-slate-100", "border-slate-800/80")
text = text.replace("text-slate-900", "text-white")
text = text.replace("text-slate-800", "text-slate-100")
text = text.replace("text-slate-700", "text-slate-200")
text = text.replace("text-slate-600", "text-slate-300")
text = text.replace("text-slate-500", "text-slate-400")
text = text.replace("bg-slate-50", "bg-slate-900")
text = text.replace("bg-slate-100", "bg-slate-800")
text = text.replace("hover:bg-slate-100", "hover:bg-slate-800")
text = text.replace("hover:bg-slate-200", "hover:bg-slate-700")

# Update ECharts titles and axis colors in TerritoryView
text = text.replace("color: '#0f172a'", "color: '#f8fafc'")
text = text.replace("color: '#64748b'", "color: '#94a3b8'")
text = text.replace("color: '#334155'", "color: '#cbd5e1'")
text = text.replace("lineStyle: { stroke: '#e2e8f0', type: 'dashed' }", "lineStyle: { stroke: '#334155', type: 'dashed' }")

with open("web/src/components/views/TerritoryView.jsx", "w", encoding="utf-8") as f:
    f.write(text)

print("Updated TerritoryView.jsx to dark theme")

# 2. Update MunicipalityView.jsx
with open("web/src/components/views/MunicipalityView.jsx", "r", encoding="utf-8") as f:
    text2 = f.read()

text2 = text2.replace("bg-white p-", "bg-slate-900/90 p-")
text2 = text2.replace("bg-white rounded-2xl", "bg-slate-900/90 rounded-2xl")
text2 = text2.replace("border-slate-200 shadow-xs", "border-slate-800 shadow-md")
text2 = text2.replace("border-slate-200", "border-slate-800")
text2 = text2.replace("border-slate-100", "border-slate-800/80")
text2 = text2.replace("text-slate-900", "text-white")
text2 = text2.replace("text-slate-800", "text-slate-100")
text2 = text2.replace("text-slate-700", "text-slate-200")
text2 = text2.replace("text-slate-600", "text-slate-300")
text2 = text2.replace("text-slate-500", "text-slate-400")
text2 = text2.replace("bg-slate-50", "bg-slate-900")
text2 = text2.replace("bg-slate-100", "bg-slate-800")
text2 = text2.replace("hover:bg-slate-100", "hover:bg-slate-800")
text2 = text2.replace("hover:bg-slate-200", "hover:bg-slate-700")

# Update ECharts titles and axis colors in MunicipalityView
text2 = text2.replace("color: '#0f172a'", "color: '#f8fafc'")
text2 = text2.replace("color: '#64748b'", "color: '#94a3b8'")

# Educational box
text2 = text2.replace("bg-gradient-to-r from-emerald-50 to-teal-50", "bg-gradient-to-r from-emerald-950/40 to-teal-950/40")
text2 = text2.replace("border-emerald-200", "border-emerald-800/60")
text2 = text2.replace("text-emerald-950", "text-emerald-200")
text2 = text2.replace("text-emerald-900", "text-emerald-300")
text2 = text2.replace("bg-white/80", "bg-slate-900/90")

with open("web/src/components/views/MunicipalityView.jsx", "w", encoding="utf-8") as f:
    f.write(text2)

print("Updated MunicipalityView.jsx to dark theme")
