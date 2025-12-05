Necesito que revises este proyecto de forma minuciosa y que además revises los archivos "D:\Proyectos\Web\GEMODIDA\docs\LOGICA_NEGOCIO_GEMODIDA.md" y "D:\Proyectos\Web\GEMODIDA\docs\PROMPT_DISEÑO_GEMODIDA_20251121.md".

Luego vamos a diseñar un plan de trabajo bien elaborado y detallado, para realizar la implementacion sistemática de todas las nuevas funcionalidades y caracteristicas que falten a esta aplicacion, basandonos en todo lo que se define en los archivos que he mencionado y que hayas revisado.

Para evitar crear cosas que ya existen y para comprender el proposito de cada tabla del sistema, debes revisar por completo los siguientes archivos:
**Todos los ficheros dentro de la carpeta:** "D:\Proyectos\Web\GEMODIDA\db\definiciones_gemodida" 
**Todo el contenido del fichero:** "D:\Proyectos\Web\GEMODIDA\db\esquema\GEMODIDA_ESQUEMA_BD.sql"
**Todo el contenido del fichero:** "D:\Proyectos\Web\GEMODIDA\db\esquema\GEMODIDA_FUNCIONES_PUB.sql"
**Todo el contenido del fichero:** "D:\Proyectos\Web\GEMODIDA\db\esquema\GEMODIDA_POLITICAS_RLS.sql"
----------------

Quiero que revises el fichero "D:\Proyectos\Web\GEMODIDA\db\esquema_gemodida\ConfigMatriz_data.sql"

Luego quiero que me des un nuevo archivo, con un nuevo script consolidado completo, adaptado y actualizado a la estructura actual de las tablas para insertar esos datos en la base de datos, incluyendo las sucursales.

Revisa todo el contenido del fichero: "D:\Proyectos\Web\GEMODIDA\db\esquema\GEMODIDA_ESQUEMA_BD.sql" antes de hacer las mejoras del nuevo script
------------------

Quiero que revises el fichero "D:\Proyectos\Web\GEMODIDA\db\esquema_gemodida\MonitoreoDB_data.sql"

Luego quiero que me des un nuevo script completo mejorado y lo guardes en un archivo consolidado. El script debe ser adaptado y actualizado a la estructura actual de las tablas de la base de datos, para insertar la informacion sin errores.

Antes de crear el script mejorado, revisa todo el contenido del fichero: "D:\Proyectos\Web\GEMODIDA\db\esquema\GEMODIDA_ESQUEMA_BD.sql" que tiene las definiciones de tablas actualizada.

Antes de ejecutar las tareas que yo te pido, debes revisar el archivo:
"D:\Proyectos\Web\GEMODIDA\POLITICAS_DESARROLLO_GEMODIDA.md"

archivo "D:\Proyectos\Web\GEMODIDA\docs\LOGICA_NEGOCIO_GEMODIDA.md" que ademas se menciona en el archivo  "D:\Proyectos\Web\GEMODIDA\docs\PROMPT_DISEÑO_GEMODIDA_20251121.md".
--------------------

Para que tengas un mejor contexto de lo que estamos creando y de lo que queremos lograr en esta aplicacion,
Necesito que revises de forma minuciosa los archivos "D:\Proyectos\Web\GEMODIDA\docs\LOGICA_NEGOCIO_GEMODIDA.md" y "D:\Proyectos\Web\GEMODIDA\docs\PROMPT_DISEÑO_GEMODIDA_20251121.md".
------------------

En la pagina 'Dashboard' / 'src\app\dashboard\page.tsx' de este proyecto, en el pie del sidebar-menu de esa pagina, vamos colocar una etiqueta que muestre el nombre completo del usuario que ha iniciado sesion en la aplicacion. Y otra etiqueta justo debajo que muestre el rol de acceso que tiene ese usuario.

Todos los datos del usuario deben recuperarse y almacenarse en la sesion cuando el usuario ingresa a la aplicacion, y de allí debemos poder leer los datos.
---------------

Algunas tablas fueron eliminadas porque aparecian con nombres parecidos (datos duplicados) en la base de datos, asi que necesitamos actualizar el codigo fuente para que se apliquen los cambios. tablas como 'roles' ahora se llaman 'usuarios_roles', tablas como 'oerfiles' ahora se llama 'usuarios_perfiles'.

Para conocer mejor todas las tablas, revise el archivo "D:\Proyectos\Web\GEMODIDA\db\esquema\GEMODIDA_ESQUEMA_BD.sql"

En otro orden:
¿Podemos verificar si el rol del usuario se recupera cuando inicia sesion?

Tambien quiero identificar la sucursal a la cual pertenece el usuario que inicia sesion, para mostrar en cual sucursal se está trabajando en el sistema.

Revisa el archivo "D:\Proyectos\Web\GEMODIDA\db\esquema\GEMODIDA_DATOS_TABLAS.json" para conocer las tablas relacionadas a los usuarios
--------------

Necesito crear un script sql consolidado y bien estructurado para postgresql, para actualizar/reconstruir los valores de la columna id_rol en la tabla usuarios_roles, para que tangan el id_rol como se indica a continuacion:

id_rol	codigo_rol
3 = gerente
4 =	supervisor
5 =	operador
6 =	encuestador
2 =	admin
9 =	desarrollo
1 =	super_user
8 =	invitado
7 =	seguridad
----------------

En la pagina que dice 'Panel de Control' (src\app\dashboard\page.tsx), vamos a realizar las siguientes mejoras:

1. Vamos a reemplazar en toda esa pagina, el texto que dice 'Panel de Control', para que diga 'Panel de Principal'

2. Vamos a renombrar la carpeta 'src\app\dashboard\' para que se llame 'src\app\principal-dashboard\'. Y haremos las actualizaciones de ese cambio de ruta en el codigo fuente.

3. En el menu lateral (sidebar-menu) de esa misma pagina, vamos a agregar una opcion de menu llamada 'Matriz de Soporte', la cual permitira navegar a una pagina/panel de que crearemos para fines administrativos, de configuración y de soporte.

4. Vamos a crear una nueva pagina llamada 'Matriz de Soporte' ('matriz-soporte'), que será a donde debe navegar el sistema cuando el usuario haga clic en la opcion 'Matriz de Soporte' del menu lateral del panel de soporte. En esa pagina vamos a integrar una barra lateral con botones y en el cuerpo vamos a integrar un juego de pestañas para que se puedan realizar las siguientes tareas sin salir de esa pagina:
	- Ver, crear, modificar y gestionar (CRUD) toto tipo de usuarios (Tabla public.usuarios)
	- Ver, crer y editar roles de usuarios (tabla usuarios_roles)
	- Ver, rear y gestionar configuracion del sistema (tabla configuraciones_sistema)
	- Ver, crear y gestionar (CRUD) configuracion de scraping (tabla configuracion_scraping)
	- Mostrar tarjetas con datos de conteo y estadisticas de trabajos realizados en las distintas dependencias.
	- Otras funcionalidades que agregaremos mas adelante.
	
Para realizar esas tareas, es posible que necesitemos crear nuevas funciones rpc que deberan recuperar y manejar los diferentes tipos de datos.	

==========================================================================

**POLITICAS DESARROLLO**
Antes de ejecutar las tareas que yo te pido, siempre debes revisar el archivo:
"D:\Proyectos\Web\GEMODIDA\POLITICAS_DESARROLLO_GEMODIDA.md"

**COMANDOS DE USO FRECUENTE EN LA TERMINAL**
Finalizar instancias del servidor: taskkill /f /im node.exe /T
Conectarse al servidor: ssh user@31.97.149.242 / ssh gediuser / ssh gediroot
sudo usermod -aG sudo user

ELIMINAR ARCHIVO O carpeta
rmdir /s /q "RUTA_ARCHIVO"
rmdir /s "RUTA"
rmdir /s /q RUTA

**ACCESO A GOOGLE VTD**
Clave API: AIzaSyCcIlfxQEauMx08yETGEI67Yzt2W1crjVQ
ID de Cliente: 1023267974743-k65pju793lh7v0rakfukp5ivp93omt3j.apps.googleusercontent.com

**DESPLEGAR APLICACION**
Antes de iniciar a desplegar la aplicacion a produccion, debes revisar las instrucciones del archivo:
"\INSTRUCCIONES_DESPLEGAR_GEMODIDA.md"

**ARCHIVOS DE DE BASE DE DATOS**
El espacio de trabajo raiz de este proyecto es "D:\Proyectos\Web\GEMODIDA"
Las variables de entorno de este proyecto se encuentran en "\.env.local" ("D:\Proyectos\Web\GEMODIDA\.env.local")

Para conocer la estructura de las tablas en la base de datos de este proyecto, siempre debes revisar el archivo:
"\db\Esquema\GEMODIDA_ESQUEMA_BD.sql"

Para que conozcas las funciones que ya existen en la base de datos de este proyecto, te invito a que revises el archivo que está en esta ruta:
"\db\Esquema\GEMODIDA_FUNCIONES_PUB.sql"

Para conocer las politicas RLS que ya existen en la base de datos de este proyecto, te invito a que revises el archivo que está en esta ruta:
"\db\Esquema\GEMODIDA_Politicas_RLS.sql"

No tenemos que buscar ni revisar en ninguna otra carpeta ni en ningun otro archivo para conocer la estructura actualizada de la base de datos.

Siempre debemos tener presente y no olvidar que, los archivos que se encuentran dentro de la carpeta "\db\Esquema" NO SE TOCAN. Son de solo lectura para fines de revision, asi que NUNCA, PERO NUNCA se deben modificar.

Para realizar cambios y modificaciones en la base de datos se deben crear scripts nuevos en archivos consolidados que se guardan en la carpeta "\db\Scripts_SQL", para ser copiados y ejecutados por el usuario en supabase.

La logica de negocio de este proyecto se indica en el archivo:
"D:\Proyectos\Web\GEMODIDA\docs\desarrollo\Logica de negocio GEMODIDA.md"