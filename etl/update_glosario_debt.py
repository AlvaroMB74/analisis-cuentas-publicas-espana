import json, os

with open("docs/glosario_pedagogico.json", "r", encoding="utf-8") as f:
    glosario = json.load(f)

glosario["deuda_y_coste_financiero"] = {
    "DEUDA_PDE_MAASTRICHT": {
        "codigo": "GD",
        "termino": "Deuda Pública según el Protocolo de Déficit Excesivo (Deuda de Maastricht)",
        "definicion_pedagogica": "Volumen total de pasivos financieros exigibles brutos que las Administraciones Públicas mantienen frente a terceros (inversores que compran Letras, Bonos y Obligaciones del Estado, o entidades financieras que otorgan préstamos).",
        "fuente_oficial": "Banco de España / Eurostat (Reglamento UE 479/2009 y SEC-2010)",
        "por_que_importa_en_el_aula": "Explica la diferencia esencial entre el 'déficit' (el agujero contable de un solo año) y la 'deuda' (la suma acumulada de todos los déficits históricos que el país debe devolver).",
        "unidad_medida": "M€ corrientes, % del PIB y €/habitante"
    },
    "DEUDA_VIVA_LOCAL": {
        "codigo": "DEUDA_VIVA",
        "termino": "Deuda Viva de las Entidades Locales",
        "definicion_pedagogica": "Saldo vivo consolidado a 31 de diciembre de todas las operaciones financieras a corto y largo plazo (créditos bancarios y emisiones de deuda) concertadas por Ayuntamientos, Diputaciones, Cabildos y sus organismos dependientes.",
        "fuente_oficial": "Ministerio de Hacienda y Banco de España (Oficina Virtual de Entidades Locales)",
        "por_que_importa_en_el_aula": "Permite a los estudiantes comprobar cuánto debe su propio ayuntamiento o diputación por habitante y verificar si su municipio está saneado o endeudado.",
        "unidad_medida": "M€ corrientes, €/habitante y % sobre ingresos corrientes"
    },
    "INTERESES_DEUDA": {
        "codigo": "GF0107 / D41PAY / Cap. 3",
        "termino": "Intereses de la Deuda Pública y Coste Financiero",
        "definicion_pedagogica": "La cuantía que las administraciones públicas deben pagar anualmente a sus acreedores simplemente por el hecho de tener deuda, antes de amortizar o devolver un solo euro de capital.",
        "fuente_oficial": "Eurostat (COFOG GF0107 / D41PAY) y Presupuestos Generales (Capítulo 3: Gastos Financieros)",
        "por_que_importa_en_el_aula": "Ilustra el coste de oportunidad del endeudamiento: en España, los ~40.000 M€ anuales de intereses equivalen aproximadamente al 60% de todo el presupuesto nacional de Educación o al 40% del gasto sanitario total.",
        "unidad_medida": "M€ anuales, €/habitante y tipo de interés implícito (%)"
    }
}

glosario["marco_normativo_deficit_y_deuda"] = {
    "NIVEL_1_ESTADO": {
        "nivel": "Administración Central y Total Administraciones Públicas (S.13 / S.1311)",
        "regla_deficit": "Límite máximo del 3,0% del PIB según el Pacto de Estabilidad y Crecimiento (PEC). Superar este umbral activa el Procedimiento de Déficit Excesivo por parte de la Comisión Europea.",
        "regla_deuda": "Límite de referencia del 60,0% del PIB (Criterio de Maastricht).",
        "marco_constitucional": "Artículo 135 de la Constitución Española (reforma de 2011): consagra el principio de estabilidad presupuestaria y establece la prioridad absoluta e inaplazable del pago de los créditos para satisfacer los intereses y el capital de la deuda pública frente a cualquier otro gasto.",
        "nueva_gobernanza_europea_2024": "Reglamento (UE) 2024/1264: introduce como ancla operativa vinculante la senda de gasto primario neto plurianual acordada en los Planes Fiscales-Estructurales de medio plazo (4 a 7 años)."
    },
    "NIVEL_2_CCAA": {
        "nivel": "Comunidades Autónomas (S.1312)",
        "organo_regulador": "Consejo de Política Fiscal y Financiera (CPFF), presidido por el Ministerio de Hacienda con participación de los consejeros de hacienda autonómicos.",
        "limite_deuda_referencia": "13,0% del PIB regional (fijado por la Disposición Transitoria Primera de la LOEPSF 2/2012).",
        "objetivo_deficit": "Senda trienal fijada por el CPFF (objetivo de equilibrio presupuestario a medio plazo).",
        "mecanismos_tutelados": "Fondo de Liquidez Autonómico (FLA) y Fondo de Facilidad Financiera: el Estado financia a las CC.AA. a cambio de estricta condicionalidad fiscal y rendición mensual de cuentas a la IGAE.",
        "consecuencias_incumplimiento": "Presentación obligatoria de un Plan Económico-Financiero (PEF) que detalle las medidas de ajuste o incremento de ingresos necesarias para corregir la desviación en un plazo máximo de dos años."
    },
    "NIVEL_3_Y_4_LOCAL": {
        "nivel": "Diputaciones Provinciales y Ayuntamientos (S.1313 Local)",
        "principio_equilibrio_obligatorio": "Artículo 165 del TRLRHL: el presupuesto de las entidades locales debe aprobarse en situación de estricto equilibrio entre ingresos y gastos corrientes, prohibiendo el déficit inicial.",
        "limites_endeudamiento_lrhl": {
            "regimen_ordinario": "Ratio de deuda viva sobre ingresos corrientes liquidados inferior o igual al 75%. El Ayuntamiento o Diputación puede concertar créditos bancarios a largo plazo por acuerdo del Pleno sin tutela administrativa externa.",
            "tutela_previa": "Ratio de deuda viva entre el 75% y el 110%. Requiere autorización preceptiva y previa del órgano de tutela financiera (Ministerio de Hacienda o CC.AA. con competencias estatutarias de tutela financiera local).",
            "credito_prohibido": "Ratio de deuda viva superior al 110%. Prohibición taxativa de concertar nuevas operaciones de crédito a largo plazo para financiar inversiones; obligación de aprobar un Plan de Reducción de Deuda."
        },
        "regla_superavit_art32_loepsf": "El superávit presupuestario (saldo positivo B.9) y el Remanente de Tesorería para Gastos Generales (RTGG) deben destinarse obligatoriamente a reducir el endeudamiento neto bancario o, potestativamente si se cumplen los requisitos legales de estabilidad, a Inversiones Financieramente Sostenibles (IFS)."
    }
}

# Guardar en todas las rutas requeridas
rutas = [
    "docs/glosario_pedagogico.json",
    "data/processed/glosario_pedagogico.json",
    "web/src/data/glosario_pedagogico.json",
    "web/public/data/glosario_pedagogico.json"
]

for r in rutas:
    os.makedirs(os.path.dirname(r), exist_ok=True)
    with open(r, "w", encoding="utf-8") as f:
        json.dump(glosario, f, ensure_ascii=False, indent=2)
    print(f"Sincronizado glosario pedagógico en {r}")
