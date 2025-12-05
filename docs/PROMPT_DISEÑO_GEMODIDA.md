PROMPT PARA DESARROLLAR LA APLICACIÓN
Actúa como un Arquitecto de Software Senior y Desarrollador Full Stack experto en arquitecturas modernas, escalables y seguras.

Tu objetivo es diseñar la arquitectura, el esquema de base de datos y el código inicial para una Aplicación Web Progresiva (PWA) llamada "GEMODIDA".

### 1. RESUMEN DEL PROYECTO
GEMODIDA es una plataforma de inteligencia de datos y monitoreo de medios digitales. Su función principal es permitir la configuración, ejecución y análisis de procesos de scraping en redes sociales (Facebook, Instagram, X, YouTube) y portales web, así como la gestión operativa de equipos de campo (encuestas, actividades).

### 2. STACK TECNOLÓGICO REQUERIDO
Debes utilizar las siguientes tecnologías:
- **Frontend:** Next.js (App Router), React, Tailwind CSS para el diseño UI/UX moderno y responsivo.
- **Backend/API:** Node.js (dentro de Next.js API routes) para la lógica de negocio ligera y Python para los scripts de scraping (simulados o estructurados como microservicios).
- **Base de Datos:** PostgreSQL alojado en Supabase.
- **Integraciones:** Power BI / Google Data Studio (preparación de vistas de datos).
- **PWA:** Configuración de manifiesto y service workers para instalación en dispositivos móviles.

### 3. ESTRUCTURA DE BASE DE DATOS (PostgreSQL en Supabase)
Genera el script SQL o la definición de modelos para las siguientes tablas, asegurando relaciones de integridad referencial y tipos de datos correctos:

**Tablas de Seguridad y Usuarios:**
1. `users` (Tabla extendida de auth de Supabase con datos de perfil).
2. `user_roles` (Catálogo: admin, operador, super_user, invitado).
3. `user_permissions` (Relación muchos a muchos entre usuarios y roles).

**Tablas de Configuración de Scraping (Core):**
4. `platforms` (Catálogo: Facebook, X, Instagram, Google News, etc.).
5. `search_topics` (Temas generales a monitorear).
6. `search_keywords` (Frases o palabras clave específicas vinculadas a un tema).
7. `scraping_configs` (Configuraciones técnicas: frecuencia, selectores CSS si aplica, límites).

**Tablas de Datos Operativos (Resultados):**
8. `scraping_results` (Almacén maestro de data extraída: URL, contenido, fecha, sentimiento, plataforma_id).
9. `alerts` (Notificaciones generadas por keywords detectadas en buscadores como Google/Bing).
10. `reports_log` (Registro de informes enviados por WhatsApp/Email).

**Tablas de Gestión de Campo:**
11. `surveys` (Registro de encuestas realizadas en espacios públicos).
12. `activities` (Registro de reuniones, charlas, promociones).
13. `team_tasks` (Asignación de tareas a usuarios específicos).

### 4. REQUERIMIENTOS FUNCIONALES Y PANELES
La aplicación debe tener dos interfaces principales basadas en el rol del usuario:

**A. Panel de Administración (Roles: Admin, Super_User, Desarrollo)**
- Dashboard de gestión de usuarios (CRUD).
- Configuración de la plataforma (gestión de tablas `platforms` y `search_keywords`).
- Visor de logs del sistema.
- Disparador manual de notificaciones Push.

**B. Panel de Operaciones (Roles: Operador, Invitado -solo lectura-)**
- Dashboard visual con gráficos (Recharts o Chart.js) mostrando:
  - Conteo de menciones por tema.
  - Actividades recientes.
  - Estatus de los bots de scraping.
- Formularios para registrar "Encuestas" y "Actividades" (Mobile first).
- Botones de acción rápida para ejecutar scripts de scraping bajo demanda.

### 5. INSTRUCCIONES DE ENTREGA
1. **Esquema de Base de Datos:** Proporciona el código SQL para crear las tablas mencionadas arriba.
2. **Estructura del Proyecto:** Muestra el árbol de carpetas sugerido para un proyecto Next.js robusto que incluya una carpeta para los scripts de Python.
3. **Componentes Clave:** Genera el código del componente `DashboardLayout` que diferencie entre Admin y Operador, y un ejemplo del formulario de `Registro de Keywords`.
4. **Estilo:** Utiliza una paleta de colores "Dark Mode" profesional, estilo dashboard de inteligencia (Ciberseguridad/Data).
