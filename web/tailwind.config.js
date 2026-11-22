/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta oficial COFOG y finanzas públicas
        cofog: {
          gf01: "#475569", // Servicios Generales (pizarra/azul grisáceo)
          gf02: "#0369a1", // Defensa (azul marino militar)
          gf03: "#0284c7", // Orden Público (azul policía)
          gf04: "#d97706", // Asuntos Económicos (ámbar infraestructuras)
          gf05: "#15803d", // Medio Ambiente (verde bosque)
          gf06: "#b45309", // Vivienda (arcilla / marrón)
          gf07: "#e11d48", // Sanidad (rojo carmín / cruz roja)
          gf08: "#9333ea", // Cultura y Deporte (púrpura)
          gf09: "#2563eb", // Educación (azul zafiro académico)
          gf10: "#059669", // Protección Social (esmeralda bienestar)
        }
      }
    },
  },
  plugins: [],
}
