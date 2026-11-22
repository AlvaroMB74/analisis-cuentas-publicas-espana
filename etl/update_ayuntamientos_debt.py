import json

with open("etl/etl_ayuntamientos.py", "r", encoding="utf-8") as f:
    text = f.read()

# Add Marco Normativo constant
norm_def = '''MARCO_NORMATIVO_AYUNTAMIENTOS = {
    "organo_competente": "Ministerio de Hacienda y Comunidades Autónomas (Tutela Financiera Local)",
    "leyes_aplicables": "Texto Refundido de la Ley Reguladora de las Haciendas Locales (TRLRHL arts. 48-53) y Disp. Final 31ª LPGE",
    "principio_equilibrio": "Principio de Presupuesto Nivelado obligatorio sin déficit inicial (art. 165 TRLRHL)",
    "limite_deuda_ordinario_pct": 75.0,
    "limite_deuda_autorizacion_pct": 110.0,
    "regla_superavit_art32_loepsf": "Destino obligatorio del superávit y remanente de tesorería a amortización anticipada de deuda bancaria o Inversiones Financieramente Sostenibles (IFS)"
}
'''

if "MARCO_NORMATIVO_AYUNTAMIENTOS" not in text:
    target_pos = text.find("def simulate_municipal_year(")
    text = text[:target_pos] + norm_def + "\n" + text[target_pos:]

# Add to metadata
meta_target = '"total_municipios": len(MUNICIPIOS_CATALOGO)'
meta_replacement = '"total_municipios": len(MUNICIPIOS_CATALOGO),\n            "marco_normativo_fiscal": MARCO_NORMATIVO_AYUNTAMIENTOS'
if meta_replacement not in text:
    text = text.replace(meta_target, meta_replacement, 1)

# Add deuda_publica block inside simulate_municipal_year return
old_salud = '''        "salud_financiera": {
            "deuda_viva_bancaria": pack(deuda_viva_mio),
            "ratio_deuda_sobre_ingresos_pct": ratio_deuda_pct,
            "remanente_tesoreria_gastos_generales": pack(remanente_mio),
            "es_saneado": ratio_deuda_pct < 75.0
        }'''

new_salud = '''        "salud_financiera": {
            "deuda_viva_bancaria": pack(deuda_viva_mio),
            "ratio_deuda_sobre_ingresos_pct": ratio_deuda_pct,
            "remanente_tesoreria_gastos_generales": pack(remanente_mio),
            "es_saneado": ratio_deuda_pct < 75.0
        },
        "deuda_publica": {
            "deuda_total": pack(deuda_viva_mio),
            "intereses_anuales": pack(cap3_gasto),
            "tipo_interes_implicito_pct": round((cap3_gasto / deuda_viva_mio * 100.0), 2) if deuda_viva_mio > 0 else 0.0,
            "ratio_deuda_sobre_ingresos_pct": ratio_deuda_pct,
            "regimen_endeudamiento_lhrl": "Régimen Ordinario (<75%)" if ratio_deuda_pct <= 75.0 else ("Tutela Previa (75-110%)" if ratio_deuda_pct <= 110.0 else "Crédito Prohibido (>110%)"),
            "es_saneado": ratio_deuda_pct <= 75.0
        }'''

if '"deuda_publica": {' not in text:
    text = text.replace(old_salud, new_salud, 1)

with open("etl/etl_ayuntamientos.py", "w", encoding="utf-8") as f:
    f.write(text)

print("Updated etl_ayuntamientos.py successfully!")
