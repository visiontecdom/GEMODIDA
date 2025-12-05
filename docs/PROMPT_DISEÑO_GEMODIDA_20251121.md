# ROL
Actúa como un Arquitecto de Software Senior y Desarrollador Full Stack Experto con especialización en arquitecturas escalables, bases de datos PostgreSQL avanzadas y diseño de interfaces de usuario modernas (UI/UX). Tienes amplia experiencia en el ecosistema de Supabase, React/Next.js y Python para procesamiento de datos.

# OBJETIVO
Tu tarea es revisar la arquitectura actual del proyecto GEMODIDA, para determinar cuales cosas faltan por agregar, segun lo definido en la logica de negocio del archivo "D:\Proyectos\Web\GEMODIDA\docs\LOGICA_NEGOCIO_GEMODIDA.md" y luego desarrollar todo lo que haga falta en terminos de arquitectura, el esquema de base de datos y el código base para una Aplicación Web Progresiva (PWA) llamada **"GEMODIDA"** (Gestión y Monitoreo de Informaciones de la DIDA). Esta aplicación debe ser robusta, de alto rendimiento, responsiva y con un diseño vanguardista profesional.

# ARCHIVOS IMPORTANTES DE REFERENCIA Y CONTEXTO
1.	**Revisar Ficheros:** Leer cuidadosamente todos y cada uno de los ficheros dentro de la carpeta "D:\Proyectos\Web\GEMODIDA\db\definiciones_gemodida" que son relevantes para comprender y mejorar el diseño y utilizacion de la base de datos.
2.	**Esquema de Tablas actuales:** Para saber cuales tablas faltan por crear en la base de datos, debemos primero revisar las tablas que existen actualmente, descritas en el archivo "D:\Proyectos\Web\GEMODIDA\db\esquema\GEMODIDA_ESQUEMA_BD.sql"
3.	**Funciones RPC actuales:** Debemos diseñar y crear todas las funciones RPC que faltan para este sistema. Actualmente solo existen las que se encuentran en el archivo "D:\Proyectos\Web\GEMODIDA\db\esquema\GEMODIDA_FUNCIONES_PUB.sql"

# CONTEXTO DEL PROYECTO
GEMODIDA es un sistema para el monitoreo del Sistema Dominicano de Seguridad Social (SDSS). La aplicación será utilizada por la DIDA para capturar, organizar y procesar información, realizar scraping de redes sociales, gestionar encuestas y generar reportes de inteligencia de negocios.

# STACK TECNOLÓGICO REQUERIDO
1.  **Frontend/App:** Next.js 14+ (App Router), React, Tailwind CSS (para diseño vanguardista), Framer Motion (animaciones), Lucide React (iconos).
2.  **Backend/DB:** Supabase (PostgreSQL). Uso intensivo de Row Level Security (RLS), Triggers y Funciones RPC.
3.  **Procesamiento/Scraping:** Python (microservicio o scripts integrados) para scraping de RRSS (Facebook, X, Instagram) y análisis de tendencias.
4.  **PWA:** Configuración completa de manifest, service workers y soporte offline-first donde sea posible.

# INSTRUCCIONES ESPECÍFICAS DE BASE DE DATOS (SUPABASE/POSTGRESQL)
Debes diseñar el esquema de base de datos siguiendo estrictamente las reglas de normalización y sintaxis de PostgreSQL.
1.  **Tablas:** Crea las tablas necesarias basadas en la lógica de negocio descrita abajo. Usa nombres en `snake_case`.
2.  **Seguridad:** Implementa RLS (Row Level Security) en todas las tablas.
3.  **Funciones RPC:** Diseña funciones almacenadas (PL/pgSQL) para lógica compleja (ej. asignación de roles, reportes consolidados) para ser llamadas desde el frontend.
4.  **Relaciones:** Modelo Maestro-Detalle estricto con claves foráneas e índices para optimizar consultas.

# LÓGICA DE NEGOCIO Y ESTRUCTURA DE DATOS

## 1. Estructura Organizativa
-   **Sucursales:** Tabla `sucursales`. Incluye Sede Central y regionales.
-   **Usuarios:** Tabla `usuarios` (vinculada a `auth.users` de Supabase).
-   **Grupos de Trabajo:** Tabla `usuarios_grupos`. Valores iniciales: General, Monitoreo, Promociones, Seguridad, Desarrollo.
-   **Roles:** Tabla `usuarios_roles`. Valores: Gerente, Supervisor, Operador, Encuestador, Administrador, Desarrollador, Super Usuario, Invitado, Seguridad.

## 2. Lógica de Acceso (IMPORTANTE)
Un usuario pertenece a una **Sucursal**, a uno o más **Grupos**, y tiene un **Rol** específico dentro de ese grupo.
-   *Regla:* El acceso a los datos debe filtrarse por `sucursal_id` a menos que el rol sea `admin`, `super_user` o `desarrollo`.

## 3. Funcionalidades Clave a Modelar
-   **Monitoreo y Scraping:** Tablas para guardar `keywords` de búsqueda y resultados de scraping (red social, fecha, contenido, sentimiento).
-   **Encuestas:** Tablas para diseño de encuestas (preguntas) y captura de respuestas (encuestas/sondeos).
-   **Promociones:** Registro de actividades, planificación y presupuestos.
-   **Notificaciones:** Sistema de alertas para palabras clave encontradas.

# DISEÑO DE INTERFAZ (PANELES/DASHBOARDS)
El sistema debe contar con un enrutamiento dinámico y layouts específicos para los siguientes paneles. El usuario debe ser redirigido a su panel correspondiente al login o elegir uno si tiene múltiples grupos.

1.  **monitoreo-gerencia:** Gestión de usuarios, planificación, presupuestos y dashboards estadísticos de monitoreo.
2.  **monitoreo-operaciones:** Registro de encuestas, scraping y reportes diarios.
3.  **monitoreo-encuestas:** Diseño y ejecución de encuestas.
4.  **promociones-gerencia:** Planificación de eventos, presupuestos y KPIs de promociones.
5.  **promociones-operaciones:** Registro de actividades y avance de tareas.
6.  **admin-general:** Visión "Ojo de Dios" (God Mode) para ver todas las sucursales, métricas globales y gestión de seguridad.

# ENTREGABLES ESPERADOS EN ESTA RESPUESTA
Para comenzar, necesito que generes lo siguiente:

1.  **Script SQL (DDL) de las tablas que faltan en el proyecto para Supabase:**
    -   Creación de tablas (`sucursales`, `usuarios_grupos`, `usuarios_roles`, `asignaciones_usuario`, `config_scraping`, `registros_actividades`, etc.).
    -   Definición de ENUMs para roles y estados.
    -   Políticas RLS básicas sugeridas.
2.  **Estructura de Carpetas del Proyecto (Next.js):**
    -   Cómo organizarás las rutas para manejar los múltiples paneles (`/app/(dashboard)/monitoreo-gerencia`, etc.).
3.  **Diseño de Funciones RPC (Ejemplo):**
    -   Un ejemplo de función RPC para crear un usuario y asignarle su rol y sucursal en una sola transacción segura.

Por favor, analiza toda la información proporcionada sobre el SDSS, la DIDA y los requerimientos de GEMODIDA antes de generar el código. Comienza ahora.