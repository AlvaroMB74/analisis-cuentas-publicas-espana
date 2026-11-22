"""
Script principal de ejecución y validación de la ETL (Fase 1).
Ejecuta la extracción de datos desde Eurostat, la transformación bajo SEC-2010,
la generación del JSON maestro y muestra el informe de validación contable por consola.
"""
import sys
import os
import json
from etl.extract import extract_all_datasets
from etl.transform import transform_and_validate

def format_curr(val):
    if val is None:
        return "N/D"
    return f"{val:,.1f} M€".replace(",", "X").replace(".", ",").replace("X", ".")

def format_pc(val):
    if val is None:
        return "N/D"
    return f"{val:.1f} %".replace(".", ",")

def format_hab(val):
    if val is None:
        return "N/D"
    return f"{val:,.0f} €/hab".replace(",", "X").replace(".", ",").replace("X", ".")

def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    print("=" * 85)
    print("  MOTOR ETL - CUENTAS PÚBLICAS CONSOLIDADAS DE ESPAÑA (SEC-2010 / EUROSTAT)")
    print("=" * 85)

    # 1. Extracción
    datasets = extract_all_datasets(force_refresh=False)

    # 2. Transformación y validación
    master_data = transform_and_validate(datasets)

    # 3. Extraer metadatos e indicadores del último año cerrado disponible
    meta = master_data["metadata"]
    last_year_cofog = str(meta["ultimo_ano_completo_cofog"])
    last_year_fiscal = str(meta["ultimo_ano_resumen_fiscal"])

    macro_last = master_data["macro"][last_year_cofog]
    pob = macro_last["poblacion"]
    pib = macro_last["pib_nominal_mio_eur"]

    s13 = master_data["sectores"]["S13"]
    resumen_fiscal = s13["resumen_fiscal"][last_year_cofog]
    ingresos = s13["ingresos_desglose"][last_year_cofog]
    cofog = s13["gastos_cofog"][last_year_cofog]

    # Cargar glosario para nombres cortos
    glosario_path = "data/processed/glosario_pedagogico.json"
    glosario = {}
    if os.path.exists(glosario_path):
        with open(glosario_path, "r", encoding="utf-8") as f:
            glosario = json.load(f)

    div_names = {k: v["nombre_corto"] for k, v in glosario.get("cofog_divisiones", {}).items()}
    ing_names = {k: v["nombre_corto"] for k, v in glosario.get("ingresos_y_saldos", {}).items()}

    print("\n" + "#" * 85)
    print(f"  INFORME DE VALIDACIÓN OFICIAL - EJERCICIO CERRADO {last_year_cofog} (SECTOR S13 CONSOLIDADO)")
    print("#" * 85)
    print(f"• Población oficial (1 de enero {last_year_cofog}): {pob:,.0f} habitantes")
    print(f"• PIB nominal de España ({last_year_cofog}):         {format_curr(pib)}")
    print(f"• Año base precios constantes:              {meta['ano_base_precios_constantes']} (HICP: {meta['hicp_indice_base_2024']})")
    print("-" * 85)

    # A. RESUMEN FISCAL
    print("\n[1] CUADRO MACRO-FISCAL Y SALDO PRESUPUESTARIO (S13)")
    print("-" * 85)
    print(f"{'Concepto':<40} | {'M€ Corrientes':>13} | {'M€ Constantes':>13} | {'% PIB':>8} | {'€ / Hab':>10}")
    print("-" * 85)
    for code in ["TR", "TE", "B9"]:
        item = resumen_fiscal[code]
        nombre = ing_names.get(code, code)
        print(f"{code + ' - ' + nombre:<40} | {format_curr(item['mio_eur']):>13} | {format_curr(item['mio_eur_const']):>13} | {format_pc(item['pc_gdp']):>8} | {format_hab(item['eur_hab']):>10}")
    print("-" * 85)

    # B. DESGLOSE DE INGRESOS
    print("\n[2] DESGLOSE DE INGRESOS CONSOLIDADOS (S13)")
    print("-" * 85)
    print(f"{'Partida de Ingreso':<40} | {'M€ Corrientes':>13} | {'M€ Constantes':>13} | {'% PIB':>8} | {'€ / Hab':>10}")
    print("-" * 85)
    for code in ["D2REC", "D5REC", "D91REC", "D61REC", "OTR_REC", "TR"]:
        item = ingresos[code]
        nombre = ing_names.get(code, code)
        prefix = "• " if code != "TR" else "TOTAL "
        print(f"{prefix + code + ' (' + nombre[:27] + '...)':<40} | {format_curr(item['mio_eur']):>13} | {format_curr(item['mio_eur_const']):>13} | {format_pc(item['pc_gdp']):>8} | {format_hab(item['eur_hab']):>10}")
    print("-" * 85)

    # C. GASTOS POR FUNCIÓN COFOG (10 DIVISIONES)
    print("\n[3] DESGLOSE DE GASTO POR FUNCIONES COFOG - 10 DIVISIONES (S13)")
    print("-" * 85)
    print(f"{'División COFOG':<40} | {'M€ Corrientes':>13} | {'M€ Constantes':>13} | {'% PIB':>8} | {'€ / Hab':>10}")
    print("-" * 85)
    suma_div_mio = 0.0
    suma_div_pc = 0.0
    for code in sorted(cofog["divisiones"].keys()):
        item = cofog["divisiones"][code]
        nombre = div_names.get(code, code)
        suma_div_mio += item["mio_eur"]
        if item["pc_gdp"]:
            suma_div_pc += item["pc_gdp"]
        print(f"{code + ' - ' + nombre:<40} | {format_curr(item['mio_eur']):>13} | {format_curr(item['mio_eur_const']):>13} | {format_pc(item['pc_gdp']):>8} | {format_hab(item['eur_hab']):>10}")
    print("-" * 85)
    tot_item = cofog["TOTAL"]
    print(f"{'TOTAL COFOG (Gasto Público TE)':<40} | {format_curr(tot_item['mio_eur']):>13} | {format_curr(tot_item['mio_eur_const']):>13} | {format_pc(tot_item['pc_gdp']):>8} | {format_hab(tot_item['eur_hab']):>10}")
    print(f"{'Suma de las 10 Divisiones':<40} | {format_curr(suma_div_mio):>13} | {format_curr(suma_div_mio):>13} | {format_pc(suma_div_pc):>8} |")
    print("-" * 85)

    # D. AUDITORÍA CONTABLE Y CUADRATURA
    print("\n[4] AUDITORÍA DE CONSISTENCIA Y CUADRATURA CONTABLE")
    print("-" * 85)
    auditoria = master_data["auditoria_contable"]
    print(f"• Total de pruebas de consistencia ejecutadas (2000-{last_year_cofog}): {auditoria['total_verificaciones']}")
    print(f"• Resultado global de las pruebas contables:              {'[OK] 100% VALIDAS' if auditoria['todas_validas'] else '[ERROR] FALLOS DETECTADOS'}")
    
    # Cuadratura exacta del año cerrado
    diff_te = abs(suma_div_mio - tot_item["mio_eur"])
    diff_b9 = abs((resumen_fiscal["TR"]["mio_eur"] - resumen_fiscal["TE"]["mio_eur"]) - resumen_fiscal["B9"]["mio_eur"])
    suma_ing = ingresos["D2REC"]["mio_eur"] + ingresos["D5REC"]["mio_eur"] + ingresos["D91REC"]["mio_eur"] + ingresos["D61REC"]["mio_eur"] + ingresos["OTR_REC"]["mio_eur"]
    diff_tr = abs(suma_ing - ingresos["TR"]["mio_eur"])

    print(f"• Cuadratura de COFOG (Suma Divisiones vs Total TE):     Diferencia = {diff_te:.2f} M€  -> {'[OK]' if diff_te < 0.1 else '[ERROR]'}")
    print(f"• Cuadratura de Saldo Fiscal (TR - TE vs Déficit B9):    Diferencia = {diff_b9:.2f} M€  -> {'[OK]' if diff_b9 < 0.1 else '[ERROR]'}")
    print(f"• Cuadratura de Ingresos (Componentes vs Total TR):      Diferencia = {diff_tr:.2f} M€  -> {'[OK]' if diff_tr < 0.1 else '[ERROR]'}")
    print("=" * 85)
    print(f"[OK] Archivo maestro listo en: data/processed/cuentas_espana_consolidadas.json")
    print(f"[OK] Glosario pedagógico listo en: docs/glosario_pedagogico.json")
    print("=" * 85)

if __name__ == "__main__":
    main()
