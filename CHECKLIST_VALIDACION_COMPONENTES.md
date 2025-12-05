# CHECKLIST DE VALIDACIÓN POR COMPONENTE
**Validación Funcional Detallada**

---

## 🎯 FASE 0: NORMALIZACIÓN UI

### MenuButton Component
**Archivo:** `src/components/shared/MenuButton.tsx`

#### Validación Visual
- [ ] Ancho: 200px exactos
- [ ] Altura: 48px exactos
- [ ] Padding: 16px horizontal, 12px vertical
- [ ] Border radius: 8px
- [ ] Font weight: 500 (normal), 600 (activo)

#### Validación de Interacción
- [ ] Hover: Color cambia a gray-200
- [ ] Hover: Sombra aparece
- [ ] Hover: Icono escala a 1.1
- [ ] Active: Escala a 0.95
- [ ] Focus: Ring visible

#### Validación de Estados
- [ ] Estado normal: bg-gray-100, text-gray-700
- [ ] Estado activo: bg-gradient-to-r from-blue-600 to-blue-700, text-white
- [ ] Estado hover: bg-gray-200
- [ ] Estado disabled: opacity-50, cursor-not-allowed

#### Validación de Contenido
- [ ] Icono renderiza correctamente
- [ ] Texto se alinea a la izquierda
- [ ] Badge se muestra si existe
- [ ] Indicador de estado activo visible

#### Validación Responsive
- [ ] Mobile (<768px): Altura 44px
- [ ] Tablet (768-1024px): Altura 48px
- [ ] Desktop (>1024px): Altura 48px

#### Validación de Accesibilidad
- [ ] aria-label presente
- [ ] aria-current="page" cuando activo
- [ ] role="menuitem"
- [ ] Keyboard navigation funciona

#### Tests Requeridos
```typescript
✅ test('renders with correct label')
✅ test('shows active state')
✅ test('handles click')
✅ test('shows badge')
✅ test('responsive on mobile')
✅ test('accessible with keyboard')
```

---

### MenuContainer Component
**Archivo:** `src/components/shared/MenuContainer.tsx`

#### Validación Visual
- [ ] Encabezado visible
- [ ] Icono alineado correctamente
- [ ] Título en mayúsculas
- [ ] Separador gradiente visible
- [ ] Espaciado consistente

#### Validación de Contenido
- [ ] Título se renderiza
- [ ] Icono se renderiza
- [ ] Children se renderizan
- [ ] Separador es visible

#### Validación Responsive
- [ ] Mobile: Ancho completo
- [ ] Tablet: Ancho completo
- [ ] Desktop: Ancho completo

#### Tests Requeridos
```typescript
✅ test('renders title')
✅ test('renders icon')
✅ test('renders children')
✅ test('shows separator')
```

---

### PanelSidebar Component
**Archivo:** `src/components/layout/PanelSidebar.tsx`

#### Validación Visual
- [ ] Ancho: 256px en desktop
- [ ] Ancho: 56px en tablet (colapsado)
- [ ] Ancho: 0 en mobile (drawer)
- [ ] Fondo: blanco
- [ ] Borde derecho: gris

#### Validación de Navegación
- [ ] Rutas activas se resaltan
- [ ] Navegación funciona
- [ ] Links correctos por panel
- [ ] Badges se muestran

#### Validación por Panel
- [ ] monitoreo-gerencia: Menú correcto
- [ ] monitoreo-operaciones: Menú correcto
- [ ] monitoreo-encuestas: Menú correcto
- [ ] promociones-gerencia: Menú correcto
- [ ] promociones-operaciones: Menú correcto
- [ ] admin-general: Menú correcto

#### Validación Responsive
- [ ] Mobile: Drawer funciona
- [ ] Tablet: Colapsado funciona
- [ ] Desktop: Expandido funciona

#### Tests Requeridos
```typescript
✅ test('renders correct menu for panel')
✅ test('highlights active route')
✅ test('navigation works')
✅ test('responsive on mobile')
✅ test('shows badges')
```

---

## 🎯 FASE 1: SISTEMA DE ENCUESTAS

### ConstructorEncuestas Component
**Archivo:** `src/components/encuestas/ConstructorEncuestas.tsx`

#### Validación de Tipos de Preguntas
- [ ] Texto: Se crea correctamente
- [ ] Número: Se crea correctamente
- [ ] Selección única: Se crea correctamente
- [ ] Selección múltiple: Se crea correctamente
- [ ] Escala: Se crea correctamente
- [ ] Fecha: Se crea correctamente
- [ ] Archivo: Se crea correctamente

#### Validación de Funcionalidad
- [ ] Agregar pregunta funciona
- [ ] Eliminar pregunta funciona
- [ ] Editar pregunta funciona
- [ ] Reordenar preguntas funciona
- [ ] Duplicar pregunta funciona

#### Validación de Validaciones
- [ ] Título requerido
- [ ] Tipo requerido
- [ ] Opciones requeridas (selección)
- [ ] Rango requerido (escala)
- [ ] Validaciones en tiempo real

#### Validación de Guardado
- [ ] Guardado automático cada 30s
- [ ] Datos se persisten en BD
- [ ] Recuperación de datos funciona
- [ ] Versiones se guardan

#### Validación de Preview
- [ ] Preview se actualiza en tiempo real
- [ ] Preview muestra todas las preguntas
- [ ] Preview es responsive

#### Tests Requeridos
```typescript
✅ test('creates all question types')
✅ test('validates required fields')
✅ test('auto-saves every 30s')
✅ test('preview updates in real-time')
✅ test('reorders questions')
```

---

### VisualizadorEncuesta Component
**Archivo:** `src/components/encuestas/VisualizadorEncuesta.tsx`

#### Validación de Renderizado
- [ ] Todas las preguntas se renderizan
- [ ] Tipos de preguntas correctos
- [ ] Opciones se muestran
- [ ] Validaciones se muestran

#### Validación de Interacción
- [ ] Respuestas se capturan
- [ ] Validaciones se ejecutan
- [ ] Errores se muestran
- [ ] Navegación funciona

#### Validación de Guardado
- [ ] Respuestas se guardan
- [ ] Guardado automático funciona
- [ ] Recuperación funciona
- [ ] Offline funciona

#### Validación de Captura
- [ ] GPS se captura
- [ ] Fotos se capturan
- [ ] Timestamp se registra
- [ ] Duración se calcula

#### Tests Requeridos
```typescript
✅ test('renders all questions')
✅ test('captures responses')
✅ test('validates in real-time')
✅ test('auto-saves responses')
✅ test('captures GPS')
```

---

### Ciclo de Vida de Encuestas
**Función RPC:** `transicionar_estado_encuesta()`

#### Validación de Estados
- [ ] Borrador: Editable
- [ ] Revisión: Requiere aprobación
- [ ] Aprobación: Requiere autorización
- [ ] Publicación: Disponible para encuestadores
- [ ] Recolección: Aceptando respuestas
- [ ] Cierre: No acepta respuestas
- [ ] Validación: Validando calidad
- [ ] Informe Preliminar: Análisis inicial
- [ ] Informe Final: Análisis completo
- [ ] Archivo: Almacenado

#### Validación de Transiciones
- [ ] Borrador → Revisión: Funciona
- [ ] Revisión → Aprobación: Funciona
- [ ] Revisión → Borrador: Funciona
- [ ] Aprobación → Publicación: Funciona
- [ ] Publicación → Recolección: Automático
- [ ] Recolección → Cierre: Funciona
- [ ] Cierre → Validación: Funciona
- [ ] Validación → Informe Preliminar: Funciona
- [ ] Informe Preliminar → Informe Final: Funciona
- [ ] Informe Final → Archivo: Funciona

#### Validación de Validaciones
- [ ] Transiciones inválidas bloqueadas
- [ ] Permisos verificados
- [ ] Datos validados
- [ ] Logs registrados

#### Validación de Notificaciones
- [ ] Notificación en cambio de estado
- [ ] Notificación a usuarios relevantes
- [ ] Notificación con detalles correctos

#### Tests Requeridos
```typescript
✅ test('all 10 states exist')
✅ test('valid transitions work')
✅ test('invalid transitions blocked')
✅ test('permissions verified')
✅ test('notifications sent')
```

---

### Validaciones Avanzadas
**Función RPC:** `validar_respuesta_encuesta()`

#### Validación en Tiempo Real
- [ ] Campos requeridos validados
- [ ] Formato validado
- [ ] Rango validado
- [ ] Patrón validado
- [ ] Errores mostrados

#### Validación de GPS
- [ ] GPS se captura
- [ ] Precisión > 10m
- [ ] Coordenadas válidas
- [ ] Timestamp correcto

#### Validación de Fotos
- [ ] Fotos se capturan
- [ ] Compresión funciona
- [ ] Almacenamiento funciona
- [ ] Recuperación funciona

#### Validación de Calidad
- [ ] Tiempo mínimo verificado
- [ ] Completitud verificada
- [ ] Coherencia verificada
- [ ] Duplicados detectados

#### Tests Requeridos
```typescript
✅ test('validates required fields')
✅ test('captures GPS correctly')
✅ test('compresses photos')
✅ test('detects duplicates')
✅ test('validates quality')
```

---

### Offline Support (PWA)
**Hook:** `useOfflineSync()`

#### Validación de Almacenamiento
- [ ] IndexedDB funciona
- [ ] Datos se guardan
- [ ] Datos se recuperan
- [ ] Límite de almacenamiento respetado

#### Validación de Sincronización
- [ ] Sincronización automática
- [ ] Queue de cambios funciona
- [ ] Conflictos se resuelven
- [ ] Indicador de estado visible

#### Validación de Offline
- [ ] Funciona sin conexión
- [ ] Datos se guardan offline
- [ ] Sincronización al conectar
- [ ] No hay pérdida de datos

#### Tests Requeridos
```typescript
✅ test('stores data in IndexedDB')
✅ test('syncs automatically')
✅ test('works offline')
✅ test('resolves conflicts')
```

---

### Reportes de Encuestas
**Función RPC:** `generar_reporte_encuesta()`

#### Validación de Reportes
- [ ] Reporte de respuestas genera
- [ ] Reporte estadístico genera
- [ ] Reporte de calidad genera
- [ ] Datos son precisos

#### Validación de Exportación
- [ ] Exportación a PDF funciona
- [ ] Exportación a Excel funciona
- [ ] Exportación a CSV funciona
- [ ] Archivos se descargan

#### Validación de Gráficos
- [ ] Gráficos se renderizan
- [ ] Datos son correctos
- [ ] Formato es profesional
- [ ] Responsive funciona

#### Tests Requeridos
```typescript
✅ test('generates all report types')
✅ test('exports to PDF')
✅ test('exports to Excel')
✅ test('exports to CSV')
✅ test('renders charts')
```

---

## 🎯 FASE 2: SCRAPING Y MONITOREO

### Integración de APIs
**Archivo:** `src/lib/integrations/scraper.ts`

#### Validación de Facebook API
- [ ] Conexión funciona
- [ ] Posts se obtienen
- [ ] Comentarios se obtienen
- [ ] Reacciones se obtienen
- [ ] Errores se manejan

#### Validación de Instagram API
- [ ] Conexión funciona
- [ ] Hashtags se buscan
- [ ] Posts se obtienen
- [ ] Comentarios se obtienen
- [ ] Errores se manejan

#### Validación de X API
- [ ] Conexión funciona
- [ ] Tweets se buscan
- [ ] Retweets se obtienen
- [ ] Menciones se obtienen
- [ ] Errores se manejan

#### Validación de YouTube API
- [ ] Conexión funciona
- [ ] Videos se buscan
- [ ] Comentarios se obtienen
- [ ] Estadísticas se obtienen
- [ ] Errores se manejan

#### Validación de RSS Feeds
- [ ] Conexión funciona
- [ ] Feeds se parsean
- [ ] Artículos se obtienen
- [ ] Errores se manejan

#### Tests Requeridos
```typescript
✅ test('Facebook API connection')
✅ test('Instagram API connection')
✅ test('X API connection')
✅ test('YouTube API connection')
✅ test('RSS feeds parsing')
```

---

### Motor de Scraping
**Función RPC:** `ejecutar_scraping()`

#### Validación de Ejecución Manual
- [ ] Botón de inicio funciona
- [ ] Progreso se muestra
- [ ] Resultados se obtienen
- [ ] Errores se manejan

#### Validación de Ejecución Automática
- [ ] Cron jobs se configuran
- [ ] Ejecución automática funciona
- [ ] Frecuencia respetada
- [ ] Logs se registran

#### Validación de Monitoreo
- [ ] Dashboard muestra procesos
- [ ] Estado se actualiza
- [ ] Alertas se envían
- [ ] Logs se muestran

#### Validación de Almacenamiento
- [ ] Resultados se guardan
- [ ] Datos se persisten
- [ ] Recuperación funciona
- [ ] Límite de almacenamiento respetado

#### Tests Requeridos
```typescript
✅ test('manual execution works')
✅ test('automatic execution works')
✅ test('monitoring works')
✅ test('results are stored')
```

---

### Análisis de Sentimientos
**Función RPC:** `analizar_sentimiento()`

#### Validación de Análisis
- [ ] Análisis se ejecuta
- [ ] Clasificación es precisa
- [ ] Puntuación es consistente
- [ ] Resultados se guardan

#### Validación de Clasificación
- [ ] Positivo detectado correctamente
- [ ] Negativo detectado correctamente
- [ ] Neutro detectado correctamente
- [ ] Precisión > 80%

#### Validación de Tendencias
- [ ] Tendencias se calculan
- [ ] Evolución se muestra
- [ ] Comparativas funcionan
- [ ] Gráficos se renderizan

#### Tests Requeridos
```typescript
✅ test('sentiment analysis works')
✅ test('classification accuracy > 80%')
✅ test('trends calculated')
✅ test('results stored')
```

---

### Reportes de Scraping
**Función RPC:** `generar_reporte_scraping()`

#### Validación de Reportes
- [ ] Reporte de tendencias genera
- [ ] Reporte de sentimientos genera
- [ ] Datos son precisos
- [ ] Formato es profesional

#### Validación de Gráficos
- [ ] Gráficos se renderizan
- [ ] Datos son correctos
- [ ] Interactividad funciona
- [ ] Responsive funciona

#### Validación de Exportación
- [ ] Exportación a PDF funciona
- [ ] Exportación a Excel funciona
- [ ] Exportación a CSV funciona
- [ ] Archivos se descargan

#### Tests Requeridos
```typescript
✅ test('generates trend reports')
✅ test('generates sentiment reports')
✅ test('exports to PDF')
✅ test('exports to Excel')
```

---

## 🎯 FASE 3: REPORTES Y ANALYTICS

### Generación de Reportes
**Función RPC:** `generar_reporte_completo()`

#### Validación de Reportes Ejecutivos
- [ ] Resumen ejecutivo genera
- [ ] KPIs se muestran
- [ ] Recomendaciones se incluyen
- [ ] Formato es profesional

#### Validación de Reportes Técnicos
- [ ] Datos detallados se incluyen
- [ ] Metodología se explica
- [ ] Apéndices se incluyen
- [ ] Formato es profesional

#### Validación de Reportes Estadísticos
- [ ] Análisis estadístico se realiza
- [ ] Gráficos se incluyen
- [ ] Tablas se incluyen
- [ ] Interpretación se proporciona

#### Tests Requeridos
```typescript
✅ test('generates executive reports')
✅ test('generates technical reports')
✅ test('generates statistical reports')
```

---

### Exportación de Datos
**Función:** `exportarDatos()`

#### Validación de PDF
- [ ] PDF se genera
- [ ] Estilos se aplican
- [ ] Imágenes se incluyen
- [ ] Descarga funciona

#### Validación de Excel
- [ ] Excel se genera
- [ ] Múltiples hojas funciona
- [ ] Formato se aplica
- [ ] Descarga funciona

#### Validación de CSV
- [ ] CSV se genera
- [ ] Delimitadores correctos
- [ ] Encoding correcto
- [ ] Descarga funciona

#### Validación de JSON
- [ ] JSON se genera
- [ ] Estructura correcta
- [ ] Datos completos
- [ ] Descarga funciona

#### Tests Requeridos
```typescript
✅ test('exports to PDF')
✅ test('exports to Excel')
✅ test('exports to CSV')
✅ test('exports to JSON')
```

---

### Dashboards Personalizados
**Componente:** `DashboardPersonalizado.tsx`

#### Validación de Dashboard de Monitoreo
- [ ] Métricas se muestran
- [ ] Gráficos se renderizan
- [ ] Datos se actualizan
- [ ] Filtros funcionan

#### Validación de Dashboard de Operaciones
- [ ] Actividades se muestran
- [ ] Tareas se muestran
- [ ] Progreso se muestra
- [ ] Alertas se muestran

#### Validación de Dashboard de Análisis
- [ ] Análisis se muestra
- [ ] Comparativas se muestran
- [ ] Predicciones se muestran
- [ ] Tendencias se muestran

#### Validación de Widgets
- [ ] Widgets son interactivos
- [ ] Widgets son personalizables
- [ ] Widgets se guardan
- [ ] Widgets se recuperan

#### Tests Requeridos
```typescript
✅ test('monitoring dashboard works')
✅ test('operations dashboard works')
✅ test('analytics dashboard works')
✅ test('widgets are interactive')
```

---

## 📊 MATRIZ DE VALIDACIÓN FINAL

| Componente | Validación Visual | Validación Funcional | Tests | Documentación |
|-----------|------------------|---------------------|-------|---------------|
| MenuButton | ✅ | ✅ | ✅ | ✅ |
| MenuContainer | ✅ | ✅ | ✅ | ✅ |
| PanelSidebar | ✅ | ✅ | ✅ | ✅ |
| Constructor | ✅ | ✅ | ✅ | ✅ |
| Visualizador | ✅ | ✅ | ✅ | ✅ |
| Ciclo Vida | ✅ | ✅ | ✅ | ✅ |
| Validaciones | ✅ | ✅ | ✅ | ✅ |
| Offline | ✅ | ✅ | ✅ | ✅ |
| Reportes | ✅ | ✅ | ✅ | ✅ |
| APIs | ✅ | ✅ | ✅ | ✅ |
| Motor | ✅ | ✅ | ✅ | ✅ |
| Sentimientos | ✅ | ✅ | ✅ | ✅ |
| Dashboards | ✅ | ✅ | ✅ | ✅ |

---

**Checklist de Validación - Versión 1.0**
