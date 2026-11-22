import json

with open("data/processed/cuentas_ccaa_consolidadas.json", "r", encoding="utf-8") as f:
    ccaa_data = json.load(f)

with open("data/processed/cuentas_espana_consolidadas.json", "r", encoding="utf-8") as f:
    nat_data = json.load(f)

# Validar 2024
s1312_2024_rf = nat_data["sectores"]["S1312"]["resumen_fiscal"]["2024"]
s1312_tr = s1312_2024_rf["TR"]["mio_eur"]
s1312_te = s1312_2024_rf["TE"]["mio_eur"]
s1312_b9 = s1312_2024_rf["B9"]["mio_eur"]

ccaa_sum_tr = sum(c["series"]["2024"]["resumen_fiscal"]["TR"]["mio_eur"] for c in ccaa_data["comunidades"].values())
ccaa_sum_te = sum(c["series"]["2024"]["resumen_fiscal"]["TE"]["mio_eur"] for c in ccaa_data["comunidades"].values())
ccaa_sum_b9 = sum(c["series"]["2024"]["resumen_fiscal"]["B9"]["mio_eur"] for c in ccaa_data["comunidades"].values())

print("=== VERIFICACIÓN BALANZA FISCAL AUTONÓMICA 2024 ===")
print(f"INGRESOS (TR): Nacional={s1312_tr} M€ | Suma CC.AA.={round(ccaa_sum_tr, 1)} M€ | Discrepancia={round(ccaa_sum_tr - s1312_tr, 2)} M€")
print(f"GASTOS (TE):   Nacional={s1312_te} M€ | Suma CC.AA.={round(ccaa_sum_te, 1)} M€ | Discrepancia={round(ccaa_sum_te - s1312_te, 2)} M€")
print(f"DÉFICIT (B9):  Nacional={s1312_b9} M€ | Suma CC.AA.={round(ccaa_sum_b9, 1)} M€ | Discrepancia={round(ccaa_sum_b9 - s1312_b9, 2)} M€")

print("\n=== MUESTRA DETALLADA POR COMUNIDADES ===")
for code in ["ES30", "ES61", "ES21", "ES51", "ES52"]:
    c = ccaa_data["comunidades"][code]
    name = c["info"]["nombre"]
    s = c["series"]["2024"]
    rf = s["resumen_fiscal"]
    rev = s["ingresos_desglose"]
    cof = s["gastos_cofog"]
    print(f"\n-> {name} ({code}):")
    print(f"   Población: {s['poblacion']:,} | PIB/hab: {s['pib_per_capita_eur']:,} €")
    print(f"   Ingresos: {rf['TR']['mio_eur']} M€ ({rf['TR']['eur_hab']} €/hab)")
    print(f"     * Directos (IRPF/Patr): {rev['D5REC']['eur_hab']} €/hab")
    print(f"     * Indirectos (IVA/ITP): {rev['D2REC']['eur_hab']} €/hab")
    print(f"     * Transf. Estado (SFA): {rev['OTR_REC']['eur_hab']} €/hab")
    print(f"   Gastos: {rf['TE']['mio_eur']} M€ ({rf['TE']['eur_hab']} €/hab)")
    print(f"     * Sanidad: {cof['divisiones']['GF07']['eur_hab']} €/hab")
    print(f"     * Educación: {cof['divisiones']['GF09']['eur_hab']} €/hab")
    print(f"   Saldo B9: {rf['B9']['mio_eur']} M€ ({rf['B9']['eur_hab']} €/hab, {rf['B9']['pc_gdp']}% PIB) [{rf['tipo_saldo']}]")

med = ccaa_data["media_nacional_ccaa"]["2024"]
print("\n-> MEDIA NACIONAL CC.AA.:")
print(f"   Ingresos: {med['resumen_fiscal']['TR']['eur_hab']} €/hab | Gastos: {med['resumen_fiscal']['TE']['eur_hab']} €/hab")
print(f"   Déficit medio: {med['resumen_fiscal']['B9']['eur_hab']} €/hab ({med['resumen_fiscal']['B9']['pc_gdp']}% PIB)")
print(f"   Sanidad: {med['gastos_cofog']['divisiones']['GF07']['eur_hab']} €/hab | Educación: {med['gastos_cofog']['divisiones']['GF09']['eur_hab']} €/hab")
