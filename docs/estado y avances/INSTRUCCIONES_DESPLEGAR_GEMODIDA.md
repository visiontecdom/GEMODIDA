**TAREA PARA REALIZAR**

	- Vamos a desplegar la aplicacion (react / node.js / next.js) llamada 'GEMODIDA' al servidor de producción para dejarla operando en el sitio web llamado 'GEMODIDA.vtd.com.do'
		
**DATOS DE CONEXION AL SERVIDOR**
	- para conectarse al servidor e iniciar el despliegue, se deben tomar en cuenta los siguientes datos:
	- El servidor de produccion (el host) es: 31.97.149.242
	- Conectarse al servidor por SSH: 'ssh user@31.97.149.242' o 'ssh root@31.97.149.242'
	- Alias de conexión ssh para el usuario 'user': "ssh gediuser"
	- Alias de conexion elevada ssh para el usuario 'root': "ssh gediroot"
	- En caso de fallar con uno de los alias ssh, podemos utilizar una conexion directa usando "ssh -o ConnectTimeout=10 root@31.97.149.242"
	
**RUTAS DE FICHEROS**
	- La ruta completa para desplegar hacia produccion es "/home/user/web/GEMODIDA.vtd.com.do/public_html" y el directorio raíz del sitio web en el servidor de producción es "\public_html"
	- El directorio local del espacio de trabajo en desarrollo es: "D:\Proyectos\Web\GEMODIDA" y la aplicacion a desplegar se encuentra dentro de esa ruta.

**PROCEDIMIENTO A SEGUIR**
	1.1: Vamos a revisar si ya existe, y si no existe vamos a crear un script (*.ps1 o *.sh) llamado 'desplegar_GEMODIDA_comprimido', el cual tendrá todas las instrucciones para realizar el despliegue de GEMODIDA.vtd.com.do a produccion. En caso de que el script ya exista, lo vamos a revisar minuciosamente para asegurarnos de que cumple con todos los parametros y la integridad necesaria para el despliegue.
	
	2.1: El secript deberá contener los comandos y la configuracion necesaria para realizar las tareas y procesos siguientes:
	- En el proyecto local de desarrollo ("D:\Proyectos\Web\GEMODIDA"), se debe realizar una compilacion para producción optimizada de la aplicacion.
	
	- Luego de tener una compilacion exitosa, debemos a crear un fichero comprimido solamente con los archivos del proyecto que se deben subir al servidor. Excluyendo cualquier archivo o carpeta que no sea equerido, necesario, o imprescindible para el funcionamiento de la aplicacion en produccion. Entre los archivos y carpetas a excluir están las carpetas 'Recursos', 'db', 'Errores', 'Ejecutables', 'Ejecutables_Local', 'Docs', 'Imgs' y cualquier otro que no forma parte integral de la aplicacion.
	
	- En el servidor de produccion (31.97.149.242), se deben revisar cuales son los servicios (nginx, pm2, etc.) que utiliza la aplicacion en el sitio web 'GEMODIDA.vtd.com.do', para detenerlos todos y guardar la lista de esos los servicios, que luego deberán volver a iniciarse al finalizar el proceso de despliegue para dejar el sitio web operativo.

	- Luego se debe realizar un backup comprimido de los archivos desde la carpata 'public_html' hasta la carpeta '/home/user/web/GEMODIDA.vtd.com.do/GEMODIDA_backups' en el servidor de producción. luego quiero que se haga una limpieza total de los archivos que existen en 'public_html' para poner todo nuevo.
	
	- El siguiente paso que debe realizar el proceso desde el script es subir desde el ambiente de desarrollo el fichero comprimido con la aplicacion lista para desplegarse.
	
	- Luego de subir al servidor el archivo comprimido con la aplicacion compilada, se debe proceder a descomprimir en la carpeta 'public_html', asegurandonos de que cualquier archivo viejo sea reemplazado por archivos nuevos y actualizados. Además asegurando que cualquier carpeta requerida en el servidor sea creada.

	- Luego de haber descomprimido los archivos en el servidor, se deben instalar todas las dependencias que hagan falta en el servidor y finalmente verificaremos si se requiere hacer una compilación nueva de la aplicacion en el servidor de producción, para realizarla solo si es necesaria.

	- El siguiente paso es reiniciar todos los servicios necesarios en el servidor para dejar la aplicacion sea levantada y sea puesta en linea.

	- Despues de reiniciar todos los servicios, vamos a realizar validaciones del sitio web para asegurarnos de que responde bien y realizar cualquier corrección que haga falta en el servidor para asegurarnos de que la aplicacion sea operativa.
	
	3.1: Luego de completada la tarea de subir todo al servidor y de poner el sitio wen online, el archivo comprimido localmente debe ser eliminado para no ocupar espacio innecesario.

	4.1: Finalmente se deben ejecutar pruebas externas al sitio web 'www.GEMODIDA.vtd.com.do', para verificar si en verdad se encuentra operando en línea. Y si no se encuentra en linea, debemos volver a revisar y reiniciar todos los servicios que no se hayan iniciado en el servidor para asegurarnos de que entren en operacion.
	
	- Antes de iniciar el despliegue, siempre vamos a revisar el script 'desplegar_GEMODIDA_comprimido', para asegurarnos de que no contenga errores y de que cuenta con todas las prestaciones necesarias para cumplir todos los requerimientos definidos en este documento.

**IMPORTANTE RECORDAR**
	Siempre debemos recordar esto:
	- Crear un script que se pueda ejecutar por bloques, de manera que, si se detiene el proceso luego de haber avanzado alguna de las etapas, no sea necesario empezar desde cero, sino que se pueda continuar en la etapa que falló, luego de haber hecho los ajustes y correcciones que se requieran.
	- 'gediuser' no es un usuario. Es un alias configurado para realizar conexion ssh con el servidor de produccion desde la terminal local de desarrollo.
	- 'gediroot' no es un usuario. Es un alias configurado para realizar conexion ssh con el servidor de produccion desde la terminal local de desarrollo.
##	- El usuario que es propietario del sitio web se llama 'user' y el usuario que tiene poderes elevados en el servidor se llama 'root'.
	- Nunca debes utilizar gediuser como usuario y tampoco debes utilizar gediroot como usuario. Esos solo son alias de conexion para tener acceso al servidor de produccion.
	- El host o servidor de producción es "31.97.149.242"
	- En caso de ser necesario utilizar un usuario con la IP del servidor, la contraseña para el usuario 'user' es 'Admin##01' y para el usuario 'root' es 'Escalinatas##01'
	- Antes de ejecutar uno de esos script (*.ps1 o *.sh), los debemos revisar cada uno para asegurarnos de que no tengan errores y de que cumplen los parametros para un despliegue exitoso de la aplicacion
------------

**NOTAS DE REFERENCIA**
## Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force; .\desplegar_GEMODIDA_comprimido.ps1 -Verbose
## ssh -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=no gediuser echo "Conexión SSH exitosa"