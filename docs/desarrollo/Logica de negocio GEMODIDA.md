Aplicación para búsqueda y monitoreo de datos en medios digitales. 
Lógica de negocio.

**RESUMEN EJECUTIVO**
GEMODIDA es una aplicación web moderna, eficiente que será utilizada para buscar informaciones especificas en redes sociales, en portales de noticias y en otros sitios web que se definirán en la plataforma. Es una aplicación web completamente responsiva y progresiva (PWA) que funcionará en cualquier navegador y se podrá instalar en cualquier dispositivo.
La aplicación se llamará ‘GEMODIDA’ y será desarrollada usando react, node.js, next.js, Python y otras tecnologías modernas que se puedan requerir para lograr una herramienta digital eficiente y productiva.
Entre otras cosas, esta aplicación deberá realizar tareas como: Buscar en las redes sociales publicaciones que incluyan una frase o un tema específico. Esto incluye a redes como Facebook, Instagram, X (Twitter), YouTube y otras redes que sean populares.
El objetivo de la aplicación es recopilar información sobre temas que se hayan definido previamente y guardarla en una base de datos para organizarla y producir informes más detallados.

**DINAMICA OPERATIVA**
Con esta aplicación se podrán realizar diversas tareas y trabajos, incluyendo:
-	Buscar tendencias en internet, incluyendo redes como Facebook, X, e Instagram
-	Vigilar alertas de balabras clave en buscadores de internet como Google y Bing.
-	Registro de encuestas realizadas en espacios públicos y en medios digitales.
-	Planificación de trabajos, actividades y tareas asignadas a equipos o a individuos.
-	Registro de actividades realizadas (Reuniones, charlas, promociones, etc.).
-	Hacer scraping de páginas web y redes sociales para buscar publicaciones específicas.
-	Configurar los sitios web y las plataformas donde se deberán realizar los scraping.
-	Guardar y organizar la información en una base de datos para generar informes.
-	Monitorear las alertas de buscadores como Google o Bing sobre temas predefinidos.
-	Integrar las informaciones con reporteadores como Power BI o Google Data Studio.
-	Enviar reportes periódicos por correo o por WhatsApp.
-	Enviar notificaciones push a los administradores sobre sucesos preprogramados.
-	Implementar el uso de inteligencia artificial en la plataforma para fines de busqueda, analisis y generacion de informaciones de distintos tipos.
El usuario podrá ejecutar procesos de scraping en el internet de manera aleatoria para buscar publicaciones que contengan frases o palabras que estarán especificadas en una lista previamente definida guardada en una tabla de la base de datos del sistema.
Los datos podrán ser consultados desde plataformas como Google Data Studio y Microsoft Power BI, para generar informes estadísticos y realizar análisis de datos relacionados a temas específicos, filtrados por rangos de fechas y por otras características de datos.
BASE DE DATOS DEL SISTEMA
Vamos a diseñar una base de datos PostgreSQL la cual estará alojada en supabase. Esa base de datos tendrá varias tablas con la estructura necesaria para poder almacenar resultados de las búsquedas, guardar configuraciones previas de los remas que se desean buscar en la red, organizar la información en diversas tablas con el modelo maestro-detalles.

**SEGURIDAD Y USUARIOS**
Roles de usuarios
Los roles de usuarios serán almacenados en una tabla de la base de datos llamada ‘usuarios_roles’, definida para esos fines. Y será desde esa tabla que se van a elegir los roles que se asignarán a cada usuario cuando sea creado en la interfaz de la aplicación.
Los roles principales que tendrá esa tabla para los usuarios serán:
-	Administrador (admin): Usuario con acceso total a la plataforma
-	Operador (operador): Usuario que ejecuta procesos y registra datos
-	Super Usuario (super_user): Usuario de desarrollo con acceso total y poderoso
-	Consultas (invitado): Para usuarios que solo pueden ver informes y consultar datos
Creación de usuarios
En principio los usuarios de esta aplicación serán creados de dos maneras:
1.	A través de instrucciones DDL SQL en tiempo de desarrollo
2.	Desde el panel de administración de la aplicación.

**PANELES DE TRABAJO**
Panel de administración
Este será una Página/Dashboard para gestión administrativa de la plataforma. Será la principal y solo tendrán acceso a ese panel los usuarios con rol de administrador, super usuario y desarrollo (admin, desarrollo, super_user)
Desde el panel de administración se podrán realizar tareas como:
-	Crear usuarios
-	Asignar permisos a usuarios
-	Asignar tareas a usuarios y a procesos
-	Configurar la plataforma
-	Definir temas de consultas para scraping
-	Registrar frases y contenido para investigar.

Panel de operaciones
Este será una Página/Dashboard de trabajo diario que tendrá los menús y los botones para accesar a las herramientas que se necesiten para realizar el scraping y generar informes.
En el cuerpo del panel de operaciones habrá además en pantalla, distintos tipos de gráficos que muestren resúmenes y conteos de informaciones recopiladas recientemente por la aplicación, relacionados a temas más tratados en la plataforma.

**PROMPT PARA DESARROLLAR LA APLICACIÓN**
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

Por favor, comienza por definir el esquema SQL completo para la base de datos.
