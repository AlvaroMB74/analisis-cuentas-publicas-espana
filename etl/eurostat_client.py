"""
Cliente HTTP robusto y parser JSON-stat 2.0 para la API REST v1.0 de Eurostat.
Incluye reintentos automáticos con backoff exponencial, cabeceras oficiales y caché local en data/raw/.
"""
import os
import json
import logging
import time
import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

BASE_URL = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{dataset}"

DEFAULT_HEADERS = {
    "User-Agent": "SecundariaEducacionFinanzasES/1.0 (DataPipeline; Contact: educacion.secundaria@educa.es)",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "es,en-US;q=0.9,en;q=0.8"
}

class EurostatClient:
    def __init__(self, raw_cache_dir: str = "data/raw"):
        self.raw_cache_dir = raw_cache_dir
        os.makedirs(self.raw_cache_dir, exist_ok=True)
        self.session = self._create_session()

    def _create_session(self) -> requests.Session:
        session = requests.Session()
        session.headers.update(DEFAULT_HEADERS)
        retries = Retry(
            total=5,
            backoff_factor=2,
            status_forcelist=[429, 500, 502, 503, 504],
            raise_on_status=False
        )
        adapter = HTTPAdapter(max_retries=retries)
        session.mount("https://", adapter)
        session.mount("http://", adapter)
        return session

    def fetch_dataset(self, dataset: str, params: dict = None, cache_filename: str = None, force_refresh: bool = False) -> dict:
        """
        Descarga datos de Eurostat en formato JSON-stat 2.0 o los recupera de la caché local.
        """
        if cache_filename is None:
            cache_filename = f"{dataset}.json"
        
        cache_path = os.path.join(self.raw_cache_dir, cache_filename)

        if not force_refresh and os.path.exists(cache_path):
            logging.info(f"Cargando dataset '{dataset}' desde caché local: {cache_path}")
            with open(cache_path, "r", encoding="utf-8") as f:
                return json.load(f)

        url = BASE_URL.format(dataset=dataset)
        default_params = {"format": "JSON", "lang": "EN", "geo": "ES"}
        merged_params = default_params.copy()
        if params:
            merged_params.update(params)

        logging.info(f"Consultando API de Eurostat: {url}")
        
        # Realizar petición con hasta 3 intentos adicionales explícitos
        last_exception = None
        for attempt in range(1, 4):
            try:
                response = self.session.get(url, params=merged_params, timeout=60)
                if response.status_code == 200:
                    data = response.json()
                    with open(cache_path, "w", encoding="utf-8") as f:
                        json.dump(data, f, ensure_ascii=False)
                    logging.info(f"Dataset '{dataset}' guardado con éxito en caché ({os.path.getsize(cache_path)} bytes): {cache_path}")
                    return data
                else:
                    logging.warning(f"Intento {attempt}: Status code {response.status_code}. Reintentando...")
                    time.sleep(attempt * 2)
            except Exception as e:
                logging.warning(f"Intento {attempt} falló con error: {e}. Reintentando...")
                last_exception = e
                time.sleep(attempt * 3)

        if last_exception:
            raise last_exception
        raise RuntimeError(f"No se pudo descargar el dataset {dataset} tras varios intentos.")

    @staticmethod
    def json_stat_to_dataframe(data: dict) -> pd.DataFrame:
        """
        Convierte la estructura multidimensional sparse de JSON-stat 2.0 de Eurostat en un DataFrame de pandas.
        Mapea las dimensiones y sus posiciones relativas (strides) para reconstruir las series completas.
        """
        dims = data.get("id", [])
        sizes = data.get("size", [])
        values = data.get("value", {})

        if not dims or not sizes:
            raise ValueError("El JSON no tiene una estructura JSON-stat 2.0 válida (faltan 'id' o 'size').")

        # Extraer listas de etiquetas para cada dimensión en orden exacto de índice
        dim_members = []
        for d in dims:
            cat = data["dimension"][d]["category"]
            if "index" in cat:
                if isinstance(cat["index"], dict):
                    # Diccionario {clave: indice} -> ordenar por índice
                    sorted_keys = [k for k, _ in sorted(cat["index"].items(), key=lambda item: item[1])]
                else:
                    sorted_keys = list(cat["index"])
            else:
                sorted_keys = list(cat["label"].keys())
            dim_members.append(sorted_keys)

        # Calcular strides (pasos de multiplicación para índice lineal)
        n_dims = len(dims)
        strides = [1] * n_dims
        for i in range(n_dims - 2, -1, -1):
            strides[i] = strides[i + 1] * sizes[i + 1]

        # Reconstruir filas solo para los valores existentes en el diccionario sparse 'value'
        records = []
        for str_idx, val in values.items():
            linear_idx = int(str_idx)
            record = {}
            remainder = linear_idx
            for d_i in range(n_dims):
                member_idx = remainder // strides[d_i]
                remainder = remainder % strides[d_i]
                record[dims[d_i]] = dim_members[d_i][member_idx]
            record["value"] = float(val) if val is not None else None
            records.append(record)

        df = pd.DataFrame(records)
        return df
