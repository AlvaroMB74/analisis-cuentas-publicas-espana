import json

with open("data/processed/cuentas_ayuntamientos_consolidadas.json", "r", encoding="utf-8") as f:
    d = json.load(f)

municipios = d["municipios"]
print(f"Total municipios procesados: {len(municipios)}")

sample_ines = [
    "28079",  # Madrid
    "08019",  # Barcelona
    "41091",  # Sevilla
    "29069",  # Marbella (Turístico)
    "42173",  # Soria (Capital pequeña)
    "44008"   # Albarracín (Pueblo pequeño)
]

print("\n=== MUESTRA DE CUENTAS MUNICIPALES (2024) ===")
for ine in sample_ines:
    m = municipios[ine]
    info = m["info"]
    s = m["series"]["2024"]
    rf = s["resumen_fiscal"]
    inc = s["ingresos_capitulos"]
    exp = s["gastos_capitulos"]
    salud = s["salud_financiera"]

    print(f"\n-> {info['nombre']} [{info['tipo_municipio']}] ({info['provincia_nombre']} - {info['ccaa_nombre']}):")
    print(f"   Población: {s['poblacion']:,} hab. | C.P.: {info['codigo_postal']}")
    print(f"   Ingresos Totales (TR): {rf['TR']['mio_eur']} M€ ({rf['TR']['eur_hab']} €/hab) [Autonomía fiscal: {inc['autonomia_fiscal_pct']}%]")
    print(f"     * Cap. 1 Directos (IBI, IVTM, Plusv): {inc['cap1_impuestos_directos']['eur_hab']} €/hab (IBI: {inc['detalle_tributario']['ibi_urbana']['eur_hab']} €/hab)")
    print(f"     * Cap. 3 Tasas (Basuras, Vados):       {inc['cap3_tasas_precios_publicos']['eur_hab']} €/hab (Basuras: {inc['detalle_tributario']['tasa_basuras_rsu']['eur_hab']} €/hab)")
    print(f"     * Cap. 4 Transferencias (Estado PTE):  {inc['cap4_transferencias_corrientes']['eur_hab']} €/hab (PTE: {inc['detalle_tributario']['pte_participacion_estado']['eur_hab']} €/hab)")
    print(f"   Gastos Totales (TE):   {rf['TE']['mio_eur']} M€ ({rf['TE']['eur_hab']} €/hab)")
    print(f"     * Cap. 1 Personal / Policía:           {exp['cap1_personal']['eur_hab']} €/hab")
    print(f"     * Cap. 2 Contratos Servicios:          {exp['cap2_gasto_corriente_servicios']['eur_hab']} €/hab (Limpieza: {exp['detalle_servicios']['limpieza_recogida_basuras']['eur_hab']} €/hab)")
    print(f"     * Cap. 6 Inversiones Reales:           {exp['cap6_inversiones_reales']['eur_hab']} €/hab")
    print(f"   Saldo B9: {rf['B9']['mio_eur']} M€ ({rf['B9']['eur_hab']} €/hab) [{rf['tipo_saldo']}]")
    print(f"   Deuda Viva: {salud['deuda_viva_bancaria']['mio_eur']} M€ ({salud['deuda_viva_bancaria']['eur_hab']} €/hab) [Ratio: {salud['ratio_deuda_sobre_ingresos_pct']}%]")

med = d["medias_referencia"]["2024"]
print(f"\n=== MEDIAS NACIONALES MUNICIPALES (2024) ===")
print(f"Gasto medio: {med['gasto_medio_hab']} €/hab | Ingreso medio: {med['ingreso_medio_hab']} €/hab | IBI medio: {med['ibi_medio_hab']} €/hab")
print(f"Limpieza/Basuras media: {med['limpieza_media_hab']} €/hab | Deuda media: {med['deuda_media_hab']} €/hab")
