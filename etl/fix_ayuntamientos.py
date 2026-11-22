with open("etl/etl_ayuntamientos.py", "r", encoding="utf-8") as f:
    text = f.read()

norm_def = '''
MARCO_NORMATIVO_AYUNTAMIENTOS = {
    "organo_competente": "Ministerio de Hacienda y Comunidades Autónomas (Tutela Financiera Local)",
    "leyes_aplicables": "Texto Refundido de la Ley Reguladora de las Haciendas Locales (TRLRHL arts. 48-53) y Disp. Final 31ª LPGE",
    "principio_equilibrio": "Principio de Presupuesto Nivelado obligatorio sin déficit inicial (art. 165 TRLRHL)",
    "limite_deuda_ordinario_pct": 75.0,
    "limite_deuda_autorizacion_pct": 110.0,
    "regla_superavit_art32_loepsf": "Destino obligatorio del superávit y remanente de tesorería a amortización anticipada de deuda bancaria o Inversiones Financieramente Sostenibles (IFS)"
}
'''

target = "logger = logging.getLogger(__name__)\n"
if target in text and "MARCO_NORMATIVO_AYUNTAMIENTOS =" not in text:
    text = text.replace(target, target + norm_def, 1)

with open("etl/etl_ayuntamientos.py", "w", encoding="utf-8") as f:
    f.write(text)

print("Placed MARCO_NORMATIVO_AYUNTAMIENTOS at top of etl_ayuntamientos.py")
