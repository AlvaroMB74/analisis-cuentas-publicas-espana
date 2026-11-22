"""
Módulo de extracción para Eurostat.
Descarga y almacena en data/raw/ los datasets oficiales necesarios:
1. gov_10a_exp: Gasto público por funciones COFOG (S13, S1311..S1314, unidades MIO_EUR y PC_GDP, na_item=TE).
2. gov_10a_main: Ingresos principales, saldos fiscales B9, TR, TE, impuestos y cotizaciones.
3. demo_pjan: Población anual residente en España (1 de enero).
4. prc_hicp_aind: Índice de Precios de Consumo Armonizado (IPCA) para deflactor a precios constantes.
5. nama_10_gdp: Producto Interior Bruto (PIB) nominal a precios corrientes.
"""
import os
import logging
import pandas as pd
from etl.eurostat_client import EurostatClient

logger = logging.getLogger(__name__)

def extract_all_datasets(client: EurostatClient = None, force_refresh: bool = False) -> dict:
    if client is None:
        client = EurostatClient(raw_cache_dir="data/raw")

    logger.info("=== INICIANDO FASE DE EXTRACCIÓN EUROSTAT ===")

    # 1. Gastos por función COFOG (gov_10a_exp)
    # na_item=TE, unit=['MIO_EUR', 'PC_GDP'], sectores S13 a S1314
    exp_params = {
        "na_item": "TE",
        "unit": ["MIO_EUR", "PC_GDP"],
        "sector": ["S13", "S1311", "S1312", "S1313", "S1314"]
    }
    raw_exp = client.fetch_dataset("gov_10a_exp", params=exp_params, cache_filename="gov_10a_exp.json", force_refresh=force_refresh)
    df_exp = client.json_stat_to_dataframe(raw_exp)
    logger.info(f"Dataset gov_10a_exp procesado: {len(df_exp)} registros.")

    # 2. Ingresos consolidados y saldo fiscal (gov_10a_main)
    # na_item: TR, TE, B9, D2REC, D5REC, D91REC, D61REC
    main_items = ["TR", "TE", "B9", "D2REC", "D5REC", "D91REC", "D61REC"]
    main_params = {
        "na_item": main_items,
        "unit": ["MIO_EUR", "PC_GDP"],
        "sector": ["S13", "S1311", "S1312", "S1313", "S1314"]
    }
    raw_main = client.fetch_dataset("gov_10a_main", params=main_params, cache_filename="gov_10a_main.json", force_refresh=force_refresh)
    df_main = client.json_stat_to_dataframe(raw_main)
    logger.info(f"Dataset gov_10a_main procesado: {len(df_main)} registros.")

    # 3. Población (demo_pjan)
    pop_params = {
        "sex": "T",
        "age": "TOTAL"
    }
    raw_pop = client.fetch_dataset("demo_pjan", params=pop_params, cache_filename="demo_pjan.json", force_refresh=force_refresh)
    df_pop = client.json_stat_to_dataframe(raw_pop)
    logger.info(f"Dataset demo_pjan procesado: {len(df_pop)} registros.")

    # 4. Índice de Precios HICP (prc_hicp_aind)
    hicp_params = {
        "coicop": "CP00",
        "unit": "INX_A_AVG"
    }
    raw_hicp = client.fetch_dataset("prc_hicp_aind", params=hicp_params, cache_filename="prc_hicp_aind.json", force_refresh=force_refresh)
    df_hicp = client.json_stat_to_dataframe(raw_hicp)
    logger.info(f"Dataset prc_hicp_aind procesado: {len(df_hicp)} registros.")

    # 5. PIB nominal en millones de euros (nama_10_gdp)
    gdp_params = {
        "na_item": "B1GQ",
        "unit": "CP_MEUR"
    }
    raw_gdp = client.fetch_dataset("nama_10_gdp", params=gdp_params, cache_filename="nama_10_gdp.json", force_refresh=force_refresh)
    df_gdp = client.json_stat_to_dataframe(raw_gdp)
    logger.info(f"Dataset nama_10_gdp procesado: {len(df_gdp)} registros.")

    # 6. Deuda de Maastricht e Intereses PDE (gov_10dd_edpt1)
    edp_params = {
        "na_item": ["GD", "D41PAY", "B9"],
        "unit": ["MIO_EUR", "PC_GDP"],
        "sector": ["S13", "S1311", "S1312", "S1313", "S1314"]
    }
    raw_edp = client.fetch_dataset("gov_10dd_edpt1", params=edp_params, cache_filename="gov_10dd_edpt1.json", force_refresh=force_refresh)
    df_edp = client.json_stat_to_dataframe(raw_edp)
    logger.info(f"Dataset gov_10dd_edpt1 procesado: {len(df_edp)} registros.")

    return {
        "exp": df_exp,
        "main": df_main,
        "pop": df_pop,
        "hicp": df_hicp,
        "gdp": df_gdp,
        "edp": df_edp
    }

if __name__ == "__main__":
    datasets = extract_all_datasets()
    print("Extracción completada exitosamente.")
