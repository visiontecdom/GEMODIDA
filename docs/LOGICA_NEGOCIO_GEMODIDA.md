Aplicación para monitoreo del Sistema Dominicano de Seguridad Social (SDSS)
Lógica de negocio.

INTRODUCCION
El SDSS está compuesto por varios grupos de entidades ligadas a la salud y a la seguridad social de la Republica Dominicana, entre las cuales se encuentran las Administradoras de Riesgos de Salud (ARS, las Administradoras de Riesgos Laborales (ARL), las Administradoras de Fondos de Pensiones (AFP) y las Prestadoras de Servicios de Salud (PSS).
Todas esas instituciones son dirigidas por el Consejo Nacional de la Seguridad Social (CNSS) y vigiladas o monitoreadas por la Dirección Nacional de Información y Defensa de los Afiliados a la seguridad Social (DIDA).
La DIDA es un organismo autónomo que forma parte del CNSS, cuya función es:
-	Defender los derechos de los afiliados a la seguridad social
-	Informar y orientar a los afiliados sobre sus deberes y sus derechos en seguridad social
-	Acompañar a los afiliados para asegurar que reciban los beneficios y los servicios de SS.
-	Vigilar que todas las instituciones cumplan las normas en favor de los afiliados al SDSS.
Para realizar todas las tareas que le competen a la DIDA, se utilizan equipos y herramientas digitales que permitan capturar, organizar, procesar y almacenar todas las informaciones relacionadas a la salud y la seguridad social en la Republica Dominicana. 
Como parte de las herramientas necesarias para los trabajos de la institución, hemos diseñado y estamos desarrollando el sistema de Gestión y Monitoreo de Informaciones de la DIDA (GEMODIDA).

RESUMEN EJECUTIVO
GEMODIDA es una aplicación web moderna, eficiente que será utilizada para buscar informaciones especificas en redes sociales, en portales de noticias y en otros sitios web que se definirán en la plataforma. Es una aplicación web completamente responsiva y progresiva (PWA) que funcionará en cualquier navegador y se podrá instalar en cualquier dispositivo.
La aplicación se llamará ‘GEMODIDA’ y será desarrollada usando varias tecnologías, entre las cuales están  react, node.js, next.js, Python y otras tecnologías modernas que se puedan requerir para lograr una herramienta digital eficiente y productiva.
Entre otras cosas, esta aplicación deberá permitir realizar tareas como: 
-	Registrar informaciones de los trabajos diarios 
-	Buscar en las redes sociales publicaciones que incluyan una frase o un tema específico. Esto incluye a redes como Facebook, Instagram, X (Twitter), YouTube y otras redes que sean populares.
-	Integrarse con otros sistemas para importar o exportar datos sincronizados.
-	Generar informes puntuales, que pueden estar en la plataforma o ser integrados a otros sistemas de reportes.
El objetivo de la aplicación es recopilar y procesar información para guardarla en una base de datos, a fin de organizarla y producir informes más detallados.

DINAMICA OPERATIVA
Esta aplicación será utilizada por varios departamentos de la DIDA, tanto en la sede central (La Capital), como en las sucursales regionales y provinciales de la institución, incluyendo las sucursales que se encuentran en zonas dentro de la capital.
Cada sucursal podrá realizar tareas que serán definidas como únicas para sucursales, o como únicas para la sede central. De modo que cada usuario de la plataforma tendrá un nivel de acceso de acuerdo a la sucursal a la cual pertenezca y podrá estar limitado a una sucursal o tener acceso a todas, según su rol y su nivel de alcance. 
Con esta aplicación se podrán realizar diversas tareas y trabajos, incluyendo:
-	Registrar actividades realizadas por departamentos de monitoreo y promociones.
-	Registrar de encuestas realizadas en espacios públicos y en medios digitales.
-	Buscar tendencias en internet, incluyendo redes como Facebook, X e Instagram
-	Vigilar alertas de palabras clave en buscadores de internet como Google y Bing.
-	Planificación de trabajos, actividades y tareas asignadas a equipos o a individuos.
-	Registro de actividades realizadas (Reuniones, charlas, promociones, etc.).
-	Hacer scraping de páginas web y redes sociales para buscar publicaciones específicas.
-	Configurar los sitios web y las plataformas donde se deberán realizar los scraping.
-	Guardar y organizar la información en una base de datos para generar informes.
-	Monitorear las alertas de buscadores como Google o Bing sobre temas predefinidos.
-	Integrar las informaciones con reporteadores como Power BI o Google Data Studio.
-	Enviar reportes periódicos por correo o por WhatsApp.
-	Enviar notificaciones push a los administradores sobre sucesos preprogramados.
El usuario podrá ejecutar procesos de scraping en el internet de manera aleatoria para buscar publicaciones que contengan frases o palabras que estarán especificadas en una lista previamente definida guardada en una tabla de la base de datos del sistema.
Los datos podrán ser consultados desde plataformas como Google Data Studio y Microsoft Power BI, para generar informes estadísticos y realizar análisis de datos relacionados a temas específicos, filtrados por rangos de fechas y por otras características de datos.

BASE DE DATOS DEL SISTEMA
Vamos a diseñar una base de datos PostgreSQL la cual estará alojada en supabase. Esa base de datos tendrá varias tablas con la estructura necesaria para poder almacenar resultados de las búsquedas, guardar configuraciones previas de los remas que se desean buscar en la red, organizar la información en diversas tablas con el modelo maestro-detalles.
Para crear las tablas en la base de datos, utilizaremos varios scripts que fueron diseñados a partir de tablas que se migraron desde hojas de calculo y que se encuentran en archivos *.SQL, cuya definición se establece en documentos complementarios tipo *.md, junto a otras tablas que ya existen 

SEGURIDAD Y USUARIOS
Roles de usuarios y grupos de trabajo
Todos los usuarios deberán pertenecer a una sucursal, además van a pertenecer a un grupo de trabajo y además tendrán un rol por usuario. 
Los grupos de trabajo servirán para identificar las pantallas y paneles a los cuales un usuario podrá tener acceso. Mientras que los roles servirán para indicar el nivel de acceso que tienen los usuarios.
Los grupos de trabajo serán dinámicos y estarán almacenados en una tabla llamada ‘usuarios_grupos’ de la base de datos. Inicialmente empezaremos creando los siguientes grupos:
-	General: Los usuarios de este grupo tendrán acceso a cualquier área de la plataforma, así que al momento de iniciar sesión se le debe pedir además que elijan el panel a donde quieren ser dirigidos para trabajar. Tendrán además la facilidad de cambiar de panel desde dentro de la aplicación/plataforma luego de haber iniciado sesión.
-	Monitoreo: Para agrupar y distinguir los usuarios del departamento de monitoreo.
-	Promociones: Agrupa a los usuarios que perteneces al departamento de promociones
-	Seguridad: Los usuarios de este grupo administran la seguridad del sistema
-	Desarrollo: Este grupo es exclusivo para usuarios que desarrollan aplicaciones
Mas adelante puede surgir la necesidad de crear nuevos grupos, por lo que esta información debe ser manejada de manera dinámica por el sistema.
Los roles de usuarios serán almacenados en una tabla llamada ‘usuarios_roles’ de la base de datos. Y será desde esa tabla que se van a elegir los roles que se asignarán a cada usuario cuando sea creado en la interfaz de la aplicación. Los roles de usuario además tendrán niveles de acceso por zona y por área de trabajo.
Los roles principales que tendrá esa tabla para los usuarios serán:
-	Gerente (gerente): Este rol es para los gerentes o administradores de sucursales. Los usuarios con rol de gerente solo tienen acceso a datos y recursos de la sucursal a donde pertenecen. El rol de gerente crea usuarios, otorga permisos, administra recursos, ejecuta procesos, etc.
-	Supervisor (supervisor): Rol de usuario con permisos inferiores al gerente. Los usuarios con rol de supervisor solo tienen acceso a datos y recursos de la sucursal a donde pertenecen. El rol de supervisor ejecuta procesos y registra informaciones.
-	Operador (operador): Usuario que ejecuta procesos y registra datos. Los usuarios con el rol de operador solo tienen acceso a datos de la sucursal a la cual pertenecen. Estos usuarios registran y editan informaciones en la plataforma.
-	Encuestador (encuestador): Usuario que realiza y registra encuestas en los sistemas. Los usuarios con rol de encuestador solo pueden ver sus propios datos dentro de la sucursal a la cual pertenecen. Estos usuarios realizan encuestas y sondeos en su panel de trabajo.
-	Administrador (admin): Rol de usuario con acceso administrativo a toda la plataforma. Los usuarios con rol de administrador pueden ver todos los datos de todas las sucursales y tienen acceso a crear, modificar y eliminar informaciones del sistema. Los administradores tienen acceso a todos los paneles de toda la plataforma.
-	Desarrollador (desarrollo): Rol para uso en el ambiente de desarrollo del proyecto. Los usuarios con rol de desarrollo tienen acceso a todos los paneles de todas las sucursales y pueden ver toda la información de todos los usuarios del sistema.
-	Super usuario (super_user): Usuario de mayor nivel, con acceso total a la plataforma. Los usuarios con rol de super_user tienen acceso a todos los paneles de todas las sucursales y pueden ver toda la información de todos los usuarios del sistema.
-	Consultas (invitado): Para usuarios que solo pueden ver informes y consultar datos
-	Seguridad (seguridad): Usuarios que solo administran permisos en el sistema. Los usuarios con rol de seguridad pueden crear a otros usuarios y otorgar permisos en la plataforma.
Cada usuario podrá pertenecer a una o más sucursales, además cada usuario podrá pertenecer a uno o más grupos de trabajo y dentro de cada grupo de trabajo cada usuario tendrá un rol definido. Teniendo presente que los roles definen el nivel de permisibilidad que tiene el usuario.
Las sucursales
Son las unidades que agrupan a los equipos de trabajo. Están distribuidas en diferentes localidades, incluyendo a la sede central que es la gerencia de la institución.
Para registrar las sucursales tendremos una tabla llamada ‘sucursales’ en la base de datos. Y para gestionar los datos de las sucursales crearemos una pagina CRUD que será mostrada desde los paneles administrativos de la plataforma. Además, en todas las operaciones y registro de datos, se guardará el id de la sucursal a la cual pertenece el usuario que haya realizado el registro. También se deberá mostrar la lista de sucursales en la pagina de crear/gestionar usuarios para indicar a cuál sucursal pertenece cada usuario.
Creación de usuarios
En la plataforma, para la creación de usuarios habrá una página/panel de seguridad que podrá ser utilizado por los administradores, los de seguridad y los de desarrollo.
En principio los usuarios de esta aplicación serán creados de dos maneras:
1.	A través de instrucciones DDL SQL en tiempo de desarrollo para los usuarios predefinidos del sistema.
2.	Desde la página/panel de seguridad para usuarios elevados (super_user, desarrollador y admin)
3.	Desde el panel de administración/gerencia cuando el usuario tenga un rol elevado (admin, super_user, seguridad).
Para la creación y manejo de usuarios vamos a crear una pagina CRUD que sea reutilizable en todos los paneles de todos los grupos dentro de la aplicación, para tener una interfaz única de trabajo en ese sentido.

PANELES DE TRABAJO
Para cada rol de usuario, así como para cada grupo de trabajo, habrá una página/panel/dashboard al cual será dirigido el usuario cuando inicia sesión en la aplicación.
En los casos en que un usuario pertenezca a mas de un grupo de trabajo, tras iniciar sesión sele deberá presentar un cuadro con las diferentes áreas/paneles de trabajo para que elija en cual de ellas desea trabajar en el momento.
A continuación, se definen los distintos paneles/dashboards de trabajo que vamos a crear:
Panel: Gerencia de Monitoreo (monitoreo-gerencia)
Este será un panel/dashboard para gestión gerencial del departamento de monitoreo.
A este panel tendrán acceso los usuarios de cualquier sucursal, que pertenezcan a los grupos de Monitoreo y General. Y que además tengan los roles de ‘gerente’, ‘admin’, ‘super_user’ y ‘desarrollador.
El panel de Gerencia de Monitoreo tendrá un menú lateral (sidebar-menú) y botones en el cuerpo de esa página para acceder a las distintas paginas/formularios de trabajo relacionadas a su grupo de trabajo.
Desde el panel Gerencia de Monitoreo, se mostrarán paginas para realizar tareas como:
-	Crear usuarios y asignar permisos a usuarios de monitoreo
-	Planificar trabajos y asignar tareas a usuarios de monitoreo
-	Crear sucursales y configurar la plataforma
-	Elaborar presupuestos de monitoreo
-	Diseñar y producir informes estadísticos de monitoreo
-	Definir temas de consultas para scraping de monitoreo
-	Registrar frases y contenido para investigar.
-	Otra actividades y tareas relacionadas al monitoreo
En el cuerpo del panel Gerencia de Monitoreo habrá además en pantalla, distintos tipos de gráficos que muestren resúmenes y conteos de informaciones registradas o recopiladas recientemente por los usuarios la aplicación en la sucursal a la que pertenecen.
Panel: Operaciones de Monitoreo (monitoreo-operaciones)
Este será un Panel/Dashboard de trabajo para uso frecuente de monitoreo.
A este panel/dashboard tienen acceso los usuarios que pertenezcan cualquier sucursal, que sean miembros de los grupos ‘monitoreo’ o ‘general y que tengan el rol de ‘operador’, ‘admin’, ‘super_user, o ‘desarrollador.
El panel Operaciones de Monitoreo tendrá un menú lateral (sidebar-menú) y botones en el cuerpo de la página para acceder a las distintas paginas/formularios de trabajo relacionadas.
Desde el panel operaciones de monitoreo se mostrarán paginas para realizar tareas tareas como:
-	Registrar datos de encuestas manuales.
-	Actualizar registros de planificación y avance de tareas
-	Ejecutar procesos de scraping de datos
-	Generar informes ejecutivos frecuentes (diarios, semanales, mensuales, trimestrales).
En el cuerpo del panel Operaciones de Monitoreo habrá además en pantalla, distintos tipos de gráficos que muestren resúmenes y conteos de informaciones registradas o recopiladas recientemente por los usuarios la aplicación en la sucursal a la que pertenecen.
Panel: Encuestas de Monitoreo (monitoreo-encuestas)
Este panel/dashboard que se utilizará pare crear las encuestas y para registrar los resultados de todo lo relacionado a encuestas y sondeos de datos.
A este panel tendrán acceso los usuarios de todas las sucursales, que pertenezcan a los grupos ‘monitoreo’ y ‘general’, y que además tengan el rol de ‘encuestador’ o de ‘gerente.
Las encuestas serán diseñadas con cuestionarios de preguntas y respuestas específicas para cada tipo. Mientras que los cuestionarios serán agrupados por tipos (Encuestas o Sondeos), según el tipo de resultado que se persiga conseguir.
El panel Encuestas de Monitoreo tendrá un menú lateral (sidebar-menú) y botones en el cuerpo de la página para acceder a las distintas paginas/formularios de trabajo relacionadas a ese renglón.
Desde el panel Encuestas de Monitoreo se mostrarán paginas para realizar tareas tareas como:
-	Diseñar distintos tipos de encuestas
-	Realizar encuestas y llevar las anotaciones
-	Generar resultados de las encuestas
-	Imprimir o exportar resultados de las encuestas
-	Actualizar las planificaciones y el cumplimiento de las tareas
-	Producir informes relacionados a las encuestas de monitoreo.
Panel: Gerencia de Promociones (promociones-gerencia)
Este panel/dashboard es el centro de mando para el departamento de promociones a nivel administrativo, utilizado por los gerentes de todas las sucursales.
A este panel tendrán acceso los usuarios de cualquier sucursal, que pertenezcan a los grupos ‘Promociones’ y ‘General’, que además tengan roles de ‘gerente’, ‘admin’, ‘super_user’ y ‘desarrollador.
El panel de Gerencia de Promociones tendrá un menú lateral (sidebar-menú) y botones en el cuerpo de esa página para acceder a las distintas paginas/formularios de trabajo relacionadas a su grupo de trabajo.
Desde el panel Gerencia de Promociones, se mostrarán paginas para realizar tareas como:
-	Crear sucursales de la institución
-	Crear usuarios de promociones y otorgar permisos
-	Elaborar planificación de trabajos y asignar tareas al personal
-	Planificar actividades como charlas, reuniones, fiestas, efemérides, campañas, etc.
-	Elaborar presupuesto de promociones
-	Generar informes estadísticos en periodos diario, semanal, mensual, trimestral, etc.
-	Otras actividades relacionadas a promociones
En el cuerpo del panel Gerencia de Promociones habrá además en pantalla, distintos tipos de gráficos que muestren resúmenes y conteos de informaciones registradas o recopiladas recientemente por los usuarios la aplicación en la sucursal a la que pertenecen.
Panel: Operaciones de Promociones (promociones-operaciones)
Este será un Panel/Dashboard de trabajo para registrar los datos frecuentes de promociones.
A este panel/dashboard tienen acceso los usuarios que pertenezcan cualquier sucursal, que sean miembros de los grupos ‘promociones o ‘general y que tengan el rol de ‘operador’, ‘admin’, ‘super_user, o ‘desarrollador.
El panel Operaciones de Promociones tendrá un menú lateral (sidebar-menú) y botones en el cuerpo de la página para acceder a las distintas paginas/formularios de trabajo relacionadas a las actividades que realiza su grupo de trabajo.
Desde el panel Operaciones de Promociones se mostrarán paginas para realizar tareas tareas como:
-	Registrar datos de actividades realizadas.
-	Actualizar registros de planificación
-	Registrar avance de tareas
-	Actualizar presupuesto de actividades
-	Producir repostes estadísticos
-	Generar informes ejecutivos frecuentes (diarios, semanales, mensuales, trimestrales).
En el cuerpo del panel Operaciones de Promociones habrá además en pantalla, distintos tipos de gráficos que muestren resúmenes y conteos de informaciones registradas o recopiladas recientemente por los usuarios la aplicación en la sucursal a la que pertenecen.
Panel: Administración General del Sistema (admin-general)
Este panel/dashboard será la central de trabajo desde donde se podrá visualizar todas las informaciones de todas las sucursales de la plataforma. Este panel tendrá características especiales para consultar y filtrar datos por sucursal, por usuario, por grupo de trabajo, por tipo de actividad y además se podrán generar consultas y reportes consolidados de todas las sucursales, organizados según los criterios del usuario.
A este panel tendrán acceso única y exclusivamente los usuarios que pertenezcan a los grupos ‘general’ y ‘desarrollo’, que tengan un rol de usuario como ‘admin’, ‘super_user’ o ‘desarrollador.
El panel Administración General tendrá un menú lateral (sidebar-menú) y botones en el cuerpo de la página para acceder a las distintas paginas/formularios de trabajo relacionadas a las actividades que realiza su grupo de trabajo.
Desde el panel Administración General se mostrarán paginas para realizar tareas como:
-	Consultar resultados de las sucursales. Filtrando por sucursal
-	Generar informes globales y por sucursal
-	Sacar datos estadísticos globales, por sucursal, por periodos, etc.
-	Asignar y quitar permisos a usuarios
-	Otras actividades de carácter super administrativo de la plataforma.
En el cuerpo del panel Administración General habrá además en pantalla, distintos tipos de gráficos y tarjetas informativas que muestren resúmenes y conteos de informaciones registradas o recopiladas recientemente por los usuarios la aplicación a nivel general de toda la plataforma.

Por favor, comienza por definir el esquema SQL completo para la base de datos.
