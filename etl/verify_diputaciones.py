import json

with open("data/processed/cuentas_diputaciones_consolidadas.json", "r", encoding="utf-8") as f:
    d = json.load(f)

entidades = d["entidades"]
print(f"Total entidades registradas: {len(entidades)}")

# Verificar muestras de 2024
print("\n=== MUESTRA DIPUTACIONES PROVINCIALES (2024) ===")
sample_codes = [
    "ES618",  # Sevilla
    "ES511",  # Barcelona
    "ES523",  # Valencia
    "ES413",  # León (rural dispersa)
    "ES417",  # Soria (despoblación)
    "ES213",  # Bizkaia (Foral)
    "ES709",  # Cabildo de Tenerife
    "ES532",  # Consell de Mallorca
    "ES300"   # Madrid (Uniprovincial integrada)
]

for code in sample_codes:
    ent = entidades[code]
    info = ent["info"]
    s = ent["series"]["2024"]
    rf = s["resumen_fiscal"]
    rev = s["ingresos_origen"]
    exp = s["gastos_funciones"]
    
    print(f"\n-> {info['nombre']} [{info['tipo']}] (Municipios: {info['municipios_count']}):")
    print(f"   Población provincial: {s['poblacion']:,} hab.")
    if info['tipo'] == 'uniprovincial_integrada':
        print("   ESTADO: Asumida directamente por la Comunidad Autónoma (extinguida en 1982-1983).")
    else:
        print(f"   Ingresos: {rf['TR']['mio_eur']} M€ ({rf['TR']['eur_hab']} €/hab)")
        print(f"     * Financiación del Estado (PIE): {rev['transferencias_estado_pie']['eur_hab']} €/hab ({rev['pct_estado_pie']}%)")
        print(f"     * Financiación de la CCAA:      {rev['transferencias_ccaa']['eur_hab']} €/hab ({rev['pct_ccaa']}%)")
        print(f"     * Tributos propios y tasas:      {rev['tributos_propios_tasas']['eur_hab']} €/hab ({rev['pct_propios']}%)")
        print(f"   Gastos: {rf['TE']['mio_eur']} M€ ({rf['TE']['eur_hab']} €/hab)")
        print(f"     * Cooperación Municipal (POS):  {exp['cooperacion_planes_obras_pos']['eur_hab']} €/hab")
        print(f"     * Carreteras Provinciales:      {exp['carreteras_red_viaria']['eur_hab']} €/hab")
        print(f"     * Bomberos y Protección Civil:   {exp['bomberos_proteccion_civil']['eur_hab']} €/hab")
        print(f"   Saldo B9: {rf['B9']['mio_eur']} M€ ({rf['B9']['eur_hab']} €/hab) [{rf['tipo_saldo']}]")

med = d["media_diputaciones_comunes"]["2024"]
print("\n=== MEDIA DE LAS 38 DIPUTACIONES DE RÉGIMEN COMÚN (2024) ===")
print(f"Gasto medio por habitante: {med['gasto_medio_por_habitante']} €/hab")
print(f"Ingreso medio por habitante: {med['ingreso_medio_por_habitante']} €/hab")
print(f"Estructura de ingresos: Estado (PIE)={med['pct_financiacion_estado_pie']}% | CCAA={med['pct_financiacion_ccaa']}% | Propios={med['pct_tributos_propios_tasas']}%")
print(f"Superávit total conjunto: {med['superavit_total_mio']} M€")
