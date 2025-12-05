Quiero que revises la logica de negocio de este proyecto y que analices las cosas que faltan por ser implementadas. Luego quiero que ejecutemos un plan de trabajo estrategico para avanzar con todo lo que falta.

En el plan de trabajo vamos a empezar con el panel de operaciones de monitoreo y vamos a habilitar el sistema de encuestas en todos los aspectos posibles. No vamos a parar hasta dejar funcionando en panel de operaciones de monitoreo.

**LOGICA DE NEGOCIO DEL PROYECTO:**
Para conocer el contexto general de este proyecto, debes revisar por completo cada uno de estos documentos:
&quot;docs\guia\GEMODIDA_BusinessLogic_FULL.md&quot;
&quot;docs\guia\Plan_Trabajo_GEMODIDA.md&quot;

---

I will scan the diff for the following files/folders:
["docs/guia/GEMODIDA_BusinessLogic_FULL.md", "docs/guia/Plan_Trabajo_GEMODIDA.md"]

---

Dado que no hay cambios recientes en los archivos, he realizado una revisión completa en lugar de una revisión de diferencias. Ahora voy a leer los documentos de lógica de negocio para analizar el estado actual del proyecto.

---

Ahora voy a revisar el estado actual del proyecto para entender qué está implementado y qué falta:

---

Ahora voy a revisar específicamente el panel de operaciones de monitoreo y el sistema de encuestas:

---

Ahora voy a revisar el hook de encuestas personalizadas y la base de datos:

---

**POLITICAS DESARROLLO**
Antes de ejecutar las tareas que yo te pido, siempre debes revisar el archivo:
&quot;D:\Proyectos\Web\GEMODIDA\POLITICAS_DESARROLLO_GEMODIDA.md&quot;

---

Perfecto, ahora voy a revisar los documentos de lógica de negocio y continuar con el análisis:

---

Ahora voy a revisar la estructura de la base de datos para entender mejor el estado actual:

---

Ahora voy a revisar las funciones RPC existentes para entender mejor el estado actual:

---

Ahora voy a ejecutar el comando de compilación como se indica en las políticas:

---

Ejecutando el comando de compilación según las políticas de desarrollo

---

Excelente, la compilación fue exitosa. Ahora voy a analizar el estado actual del proyecto y crear el plan estratégico.

## ANÁLISIS DE LA LÓGICA DE NEGOCIO Y ESTADO ACTUAL

Basado en mi revisión completa del proyecto GEMODIDA, he identificado lo siguiente:

### **ESTADO ACTUAL DEL PROYECTO:**

#### ✅ **IMPLEMENTADO:**
1. **Infraestructura Base:**
   - Next.js 16 con React 19 y TypeScript
   - Supabase con PostgreSQL
   - Sistema de autenticación y autorización (RBAC)
   - PWA configurado
   - Estructura de paneles base

2. **Base de Datos:**
   - Esquema completo con 40+ tablas
   - Funciones RPC implementadas (80+ funciones)
   - Políticas RLS configuradas
   - Sistema de roles y permisos

3. **Paneles Básicos:**
   - Panel de Administración General
   - Panel Principal de Desarrollo
   - Estructura de paneles de monitoreo y promociones

#### ❌ **FALTANTE/INCOMPLETO:**

### **PANEL DE OPERACIONES DE MONITOREO:**
1. **Sistema de Scraping:**
   - ❌ Configuración de scraping no funcional
   - ❌ Ejecución de procesos de scraping
   - ❌ Monitoreo de palabras clave en tiempo real
   - ❌ Integración con APIs externas

2. **Sistema de Encuestas:**
   - ❌ Constructor dinámico de formularios
   - ❌ Realización de encuestas en tiempo real
   - ❌ Validación automática de respuestas
   - ❌ Ciclo de vida completo de encuestas (10 etapas)
   - ❌ Exportación de resultados

3. **Monitoreo en Tiempo Real:**
   - ❌ Dashboard de procesos activos
   - ❌ Alertas automáticas
   - ❌ Métricas en tiempo real
   - ❌ Notificaciones push

4. **Planificación y Tareas:**
   - ❌ Gestión de planificaciones
   - ❌ Asignación de tareas
   - ❌ Seguimiento de progreso
   - ❌ Reportes de avance

---

## **PLAN DE TRABAJO ESTRATÉGICO**

### **FASE 1: SISTEMA DE ENCUESTAS COMPLETO** 
*Prioridad: CRÍTICA - 2 semanas*

#### **Semana 1: Constructor de Encuestas**
1. **Diseñador de Encuestas Dinámico:**
   - Constructor visual de formularios
   - Tipos de preguntas: texto, número, selección, escala, fecha, archivo
   - Validaciones automáticas
   - Preview en tiempo real

2. **Gestión de Plantillas:**
   - Plantillas predefinidas (USS, PSS, Personalizada)
   - Clonación de plantillas
   - Versionado de encuestas

#### **Semana 2: Realización y Gestión**
3. **Motor de Encuestas:**
   - Interfaz de realización de encuestas
   - Validación en tiempo real
   - Guardado automático (PWA offline)
   - Captura de ubicación GPS

4. **Ciclo de Vida de Encuestas:**
   - Estados: Borrador → Revisión → Aprobación → Publicación → Recolección → Cierre → Validación → Informe → Archivo
   - Flujo de aprobaciones
   - Notificaciones automáticas

### **FASE 2: SISTEMA DE MONITOREO OPERATIVO**
*Prioridad: ALTA - 2 semanas*

#### **Semana 3: Dashboard de Monitoreo**
5. **Panel de Control en Tiempo Real:**
   - Métricas operativas en vivo
   - Estado de procesos activos
   - Alertas y notificaciones
   - Gráficos dinámicos

6. **Sistema de Alertas:**
   - Configuración de alertas personalizadas
   - Notificaciones push, email, WhatsApp
   - Escalamiento automático
   - Centro de notificaciones

#### **Semana 4: Scraping y Palabras Clave**
7. **Motor de Scraping:**
   - Configuración de fuentes (Facebook, Instagram, X, YouTube, portales)
   - Monitoreo de palabras clave
   - Ejecución manual y automática
   - Almacenamiento de resultados

8. **Análisis de Tendencias:**
   - Análisis de sentimientos
   - Detección de tendencias
   - Reportes automáticos
   - Exportación de datos

### **FASE 3: PLANIFICACIÓN Y GESTIÓN DE TAREAS**
*Prioridad: MEDIA - 1 semana*

#### **Semana 5: Sistema de Planificación**
9. **Gestión de Planificaciones:**
   - Creación y asignación de tareas
   - Calendario de actividades
   - Seguimiento de progreso
   - Gestión de presupuestos

10. **Reportes y Analytics:**
    - Informes ejecutivos automáticos
    - Dashboards personalizados
    - Exportación a PDF, Excel, CSV
    - Integración con Power BI

---

## **IMPLEMENTACIÓN INMEDIATA**

Voy a comenzar implementando el **Sistema de Encuestas Completo** empezando por el constructor dinámico de formularios:

---

Creando el componente constructor dinámico de encuestas que permitirá diseñar formularios de manera visual

---

Creando el directorio encuestas para los componentes

---

Creando el componente constructor dinámico de encuestas que permitirá diseñar formularios de manera visual

---

Creando el componente visualizador de encuestas que permitirá realizar encuestas con validación en tiempo real

---

Creando el componente gestor principal de encuestas que integra el constructor, visualizador y gestión completa

---

Ahora voy a actualizar el panel de operaciones de monitoreo para integrar el sistema de encuestas:

---

Actualizando el panel de operaciones de monitoreo para integrar el sistema completo de encuestas y preparar la estructura para scraping y planificación

---

Ahora voy a crear las funciones RPC necesarias para el sistema de encuestas:

---

Creando las funciones RPC necesarias para el sistema completo de encuestas con validaciones, estadísticas y gestión del ciclo de vida

---

Ahora voy a compilar el proyecto para verificar que todo funciona correctamente:

---

Compilando el proyecto para verificar la integración del sistema de encuestas

---

Necesito corregir el error del icono Slider que no existe en lucide-react:

---

Corrigiendo el nombre del icono Slider por Sliders que es el correcto en lucide-react

---

Actualizando la referencia del icono en el array de tipos de pregunta

---

Ahora voy a compilar nuevamente:

---

Compilando el proyecto después de corregir el error del icono

---

Necesito corregir el error del toast. Voy a revisar la implementación del toast:

---

Veo que el toast usa `type` en lugar de `variant`. Voy a corregir esto:

---

Corrigiendo todas las referencias de variant por type en los toasts del GestorEncuestas

---

Ahora voy a compilar nuevamente:

---

Compilando el proyecto después de corregir los errores de toast

---

Veo que hay un problema con la implementación del toast. Voy a revisar el componente toast:

---

Veo el problema. El toast usa `variant` en lugar de `type`. Voy a corregir esto:

---

Corrigiendo las referencias de type por variant en los toasts para que coincidan con la implementación del componente Toast

---

Ahora necesito actualizar el hook useToast para que sea compatible:

---

Actualizando el hook useToast para que sea compatible con la implementación del componente Toast

---

Ahora voy a compilar nuevamente:

---

Compilando el proyecto después de corregir la compatibilidad del toast

---

Necesito corregir el filtro de estado. Voy a actualizar la lógica:

---

Corrigiendo el filtro de estado para obtener el estado desde la estructura JSON de la encuesta

---

También necesito corregir la columna de estado en la tabla:

---

Corrigiendo la columna de estado en la tabla para obtener el estado desde la estructura JSON

---

Ahora voy a compilar nuevamente:

---

Compilando el proyecto después de corregir los errores de estado

---

Necesito actualizar la interfaz EstructuraEncuesta para incluir el estado:

---

Actualizando la interfaz EstructuraEncuesta para incluir el campo estado opcional

---

Ahora voy a compilar nuevamente:

---

Compilando el proyecto después de actualizar la interfaz EstructuraEncuesta

---

Voy a usar una conversión de tipo más segura:

---

Usando conversión de tipo para acceder al campo estado en la estructura JSON

---

Ahora voy a compilar nuevamente:

---

Compilando el proyecto después de usar conversión de tipo segura