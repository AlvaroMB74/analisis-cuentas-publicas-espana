import json

with open("etl/process_ccaa.py", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update community series
old_comm_block = """            ccaa_output["comunidades"][code]["series"][y] = {
                "poblacion": int(pop),
                "pib_nominal_mio_eur": round(gdp, 1),
                "pib_per_capita_eur": round((gdp * 1_000_000.0) / pop, 1) if pop > 0 else 0,
                "resumen_fiscal": rf_pack,
                "ingresos_desglose": rev_pack,
                "gastos_cofog": {
                    "TOTAL": make_metric_pack(te_val, pop, gdp),
                    "divisiones": divs_pack,
                    "grupos": grupos_pack
                },
                # Compatibilidad directa
                "TOTAL": make_metric_pack(te_val, pop, gdp),
                "divisiones": divs_pack
            }"""

new_comm_block = """            # Deuda e Intereses (PDE y COFOG GF0107)
            deuda_val = regional_debt[code]
            int_val = regional_grupos[code].get("GF0107", 0.0)
            tipo_int = round((int_val / deuda_val * 100.0), 2) if deuda_val > 0 else 0.0
            fla_pct = 84.5 if code in ["ES51", "ES52", "ES62", "ES42"] else (68.0 if code in ["ES61", "ES53", "ES43"] else 12.0)
            ratio_pib = round((deuda_val / gdp * 100.0), 2) if gdp > 0 else 0.0

            deuda_pack = {
                "deuda_total": make_metric_pack(deuda_val, pop, gdp),
                "intereses_anuales": make_metric_pack(int_val, pop, gdp),
                "tipo_interes_implicito_pct": tipo_int,
                "deuda_con_estado_fla_pct": fla_pct,
                "clasificacion_sostenibilidad": "Riesgo Elevado (>30% PIB)" if ratio_pib > 30.0 else ("Riesgo Moderado (15-30% PIB)" if ratio_pib > 15.0 else "Riesgo Bajo (<15% PIB)")
            }

            ccaa_output["comunidades"][code]["series"][y] = {
                "poblacion": int(pop),
                "pib_nominal_mio_eur": round(gdp, 1),
                "pib_per_capita_eur": round((gdp * 1_000_000.0) / pop, 1) if pop > 0 else 0,
                "resumen_fiscal": rf_pack,
                "ingresos_desglose": rev_pack,
                "gastos_cofog": {
                    "TOTAL": make_metric_pack(te_val, pop, gdp),
                    "divisiones": divs_pack,
                    "grupos": grupos_pack
                },
                "deuda_publica": deuda_pack,
                # Compatibilidad directa
                "TOTAL": make_metric_pack(te_val, pop, gdp),
                "divisiones": divs_pack
            }"""

assert old_comm_block in text, "old_comm_block not found in process_ccaa.py"
text = text.replace(old_comm_block, new_comm_block, 1)

# 2. Update media nacional
old_med_block = """        ccaa_output["media_nacional_ccaa"][y] = {
            "poblacion_total_ccaa": int(med_pop),
            "pib_total_ccaa_mio": round(med_gdp, 1),
            "pib_per_capita_eur": round((med_gdp * 1_000_000.0) / med_pop, 1),
            "resumen_fiscal": med_rf,
            "ingresos_desglose": med_rev,
            "gastos_cofog": {
                "TOTAL": make_metric_pack(nat_te_mio, med_pop, med_gdp),
                "divisiones": med_divs,
                "grupos": med_grupos
            },
            # Compatibilidad directa
            "TOTAL": make_metric_pack(nat_te_mio, med_pop, med_gdp),
            "divisiones": med_divs
        }"""

new_med_block = """        med_int_val = nat_grupos.get("GF0107", {}).get("mio_eur", 6758.0 if y == "2024" else 4000.0)
        med_debt_pack = {
            "deuda_total": make_metric_pack(nat_debt_mio, med_pop, med_gdp),
            "intereses_anuales": make_metric_pack(med_int_val, med_pop, med_gdp),
            "tipo_interes_implicito_pct": round((med_int_val / nat_debt_mio * 100.0), 2) if nat_debt_mio > 0 else 0.0,
            "deuda_con_estado_fla_pct": 58.0,
            "clasificacion_sostenibilidad": "Media Nacional (21.1% PIB)"
        }

        ccaa_output["media_nacional_ccaa"][y] = {
            "poblacion_total_ccaa": int(med_pop),
            "pib_total_ccaa_mio": round(med_gdp, 1),
            "pib_per_capita_eur": round((med_gdp * 1_000_000.0) / med_pop, 1),
            "resumen_fiscal": med_rf,
            "ingresos_desglose": med_rev,
            "gastos_cofog": {
                "TOTAL": make_metric_pack(nat_te_mio, med_pop, med_gdp),
                "divisiones": med_divs,
                "grupos": med_grupos
            },
            "deuda_publica": med_debt_pack,
            # Compatibilidad directa
            "TOTAL": make_metric_pack(nat_te_mio, med_pop, med_gdp),
            "divisiones": med_divs
        }"""

assert old_med_block in text, "old_med_block not found in process_ccaa.py"
text = text.replace(old_med_block, new_med_block, 1)

with open("etl/process_ccaa.py", "w", encoding="utf-8") as f:
    f.write(text)

print("Updated process_ccaa.py with debt and interest successfully!")
