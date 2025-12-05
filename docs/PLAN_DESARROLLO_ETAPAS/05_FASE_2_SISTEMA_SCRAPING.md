# FASE 2: SISTEMA DE SCRAPING BÁSICO

**Duración:** 2 semanas (Semanas 5-6)  
**Prioridad:** ALTA  
**Estado:** Pendiente  
**Versión:** 1.0

---

## OBJETIVO GENERAL

Implementar sistema de scraping de redes sociales y portales noticiosos con monitoreo de palabras clave.

---

## TAREA 1: CONFIGURACIÓN DE SCRAPING

### Duración: 3 días

### Entregables
- [ ] UI para configurar palabras clave
- [ ] Selección de fuentes (Facebook, Instagram, X, YouTube, Portales)
- [ ] Configuración de URLs
- [ ] Frecuencia de ejecución (manual, horaria, diaria)
- [ ] Validaciones de configuración

### Componentes
- `src/components/scraping/ConfiguradorScraping.tsx`
- `src/components/scraping/SelectorFuentes.tsx`
- `src/components/scraping/ConfiguradorFrecuencia.tsx`

### Base de Datos
- Tabla `configuraciones_scraping`
- Tabla `fuentes_scraping`
- Funciones RPC para CRUD

---

## TAREA 2: MOTOR DE SCRAPING

### Duración: 3 días

### Entregables
- [ ] Integración con APIs (Twitter, YouTube, etc.)
- [ ] Scraping legal de portales noticiosos
- [ ] Almacenamiento de resultados
- [ ] Análisis de sentimientos básico
- [ ] Manejo de errores y reintentos

### API Routes
- `src/app/api/scraping/ejecutar/route.ts`
- `src/app/api/scraping/status/route.ts`
- `src/app/api/scraping/resultados/route.ts`

### Librerías
- `axios` - Requests HTTP
- `cheerio` - Parsing HTML
- `sentiment` - Análisis de sentimientos

---

## TAREA 3: DASHBOARD DE MONITOREO

### Duración: 2 días

### Entregables
- [ ] Visualización de resultados en tiempo real
- [ ] Alertas de palabras clave
- [ ] Gráficos de tendencias
- [ ] Exportación de datos
- [ ] Filtros avanzados

### Componentes
- `src/app/operaciones/scraping/page.tsx`
- `src/components/scraping/DashboardScraping.tsx`
- `src/components/scraping/AlertasPalabrasClaves.tsx`

### Gráficos
- Tendencia temporal
- Distribución por fuente
- Sentimientos
- Palabras clave más mencionadas

---

## ESTÁNDARES DE DISEÑO

- ✅ Moderno y dinámico
- ✅ Responsivo
- ✅ Efectos visuales suaves
- ✅ Paleta de colores consistente

---

## CHECKLIST DE COMPLETITUD

- [ ] Configurador de scraping
- [ ] Selección de fuentes
- [ ] Configuración de frecuencia
- [ ] Motor de scraping
- [ ] Integración con APIs
- [ ] Análisis de sentimientos
- [ ] Dashboard de monitoreo
- [ ] Alertas funcionales
- [ ] Gráficos implementados
- [ ] Exportación de datos
- [ ] Diseño responsivo
- [ ] Compilación sin errores

---

## COMPILACIÓN Y TESTING

```bash
npm run build
npm run lint
```

---

**Última actualización:** 2025-12-03
**Estado:** Documento de fase 2 creado
