# POLÍTICA DE DESARROLLO GEMODIDA

## Objetivo

Minimizar errores, garantizar continuidad y eficiencia en el desarrollo de GEMODIDA.

## Metodología obligatoria para todas las tareas
0. **Importante**

	- Esta es una aplicacion web (react / node.js / next.js, python, etc.) totalmente responsiva y progresiva (PWA), con estilos y colores modernos, asi como paginas dinamicas.
	
	- El directorio raiz del espacio de trabajo de este proyecto es: "D:\Proyectos\Web\GEMODIDA\".
	
	- Las variables de entorno de este proyecto se encuentran dentro de: "\.env.local" ("D:\Proyectos\Web\GEMODIDA\.env.local") y contienen toda la configuracion necesaria.
	
	- Los nombres de carpetas y de archivos indicados en este documento pueden existir en minusculas o en mayusculas, asi que debes ignorar la restriccion de mayusculas o minusculas para que encuentres siempre las cosas. Es decir que cuando te indique un dato puede existir en minusculas o en mayusculas y debes tenerlo presente.
	
	- Siempre se deben incluir los archivos ocultos cuando se realiza una búsqueda en los directorios del proyecto. Tambien incluir los archivos que inician con un punto en su nombre.
	
1. **Revisión inicial**

   - Analizar el código y los requisitos antes de editar.
   - Identificar dependencias y posibles impactos.

2. **Cambios mínimos y localizados**

   - Modificar solo el bloque relevante, evitando tocar otras partes del proyecto.
   - Si se requiere refactorización, hacerlo en pasos pequeños y controlados.
   - Corregir ademas los errores de tipos (type errors) que existan

3. **Validación inmediata**

   - Tras cada cambio, verificar errores de compilación y corregirlos antes de avanzar.

4. **Comparación con respaldo**

   - Antes de cambios importantes, comparar la versión actual con el respaldo más recientes de git o de archivos comprimidos en la carpeta `Recursos/Respaldos/*`.
   - Si hay diferencias en UI o funcionalidad, restaurar o adaptar según el respaldo más funcional luego de evaluar riesgos.

5. **Documentación de cada paso**

   - Explicar cada cambio antes y después de aplicarlo.
   - Solicitar confirmación del usuario para cambios mayores.

6. **Pruebas visuales y funcionales**

   - Verificar que la UI y la funcionalidad sigan funcionando como antes.
   - Ejecutar tests automáticos si existen.

7. **Iteración controlada**

   - Avanzar solo cuando el paso anterior esté validado y sin errores.

8. **Revisión y comparación de versiones**

   - Antes de finalizar una tarea, comparar el archivo editado con el respaldo para garantizar continuidad en el diseño y funcionalidad.
   - Documentar cualquier diferencia relevante.

9. **Registro de errores y soluciones**

   - Mantener un registro de errores frecuentes y sus soluciones para evitar reincidencias.
   
   - **Error: Componente sin return o sin renderizado principal**
     - _Causa:_ Olvidar el bloque `return (...)` en el componente principal, lo que provoca que la página se muestre en blanco.
     - _Solución:_ Siempre verificar que el componente principal tenga un bloque `return` con la estructura de la interfaz. Validar visualmente tras cada cambio.
     - _Prevención:_ Antes de guardar y validar, revisar que el componente exportado tenga un bloque de renderizado y que la UI esté visible.

10. **Comunicación clara y continua**
    - Mantener informado al usuario sobre el estado de cada tarea y cualquier decisión relevante.

11. **Espacio de trabajo GEMODIDA**
	- Recuerda que estamos trabajando con la aplicacion 'GEMODIDA' en la carpeta 'D:\Proyectos\Web\GEMODIDA\', que es el directorio raiz del espacio de trabajo.
	
12. **Manejo de datos en desarrollo**
	- La base de datos de este proyecto está en supabase con PostgreSQL. Asi que todos los scripts deben tener un formato adecuado para esa plataforma. Se recomienda siempre agregar un DROP con CASCADE en los scripts antes de crear cualquier funcion RPC, Politica RLS o disparador en la base de datos.
	
	- Siempre se deben crear los sctipts SQL consolidados en un fichero local y guardarlo en la carpeta '\db\Scripts_SQL' de este espacio de trabajo.
	
	- Antes de crear o modificar funciones RPC, se deben revisar los archivos '\db\Esquema\GEMODIDA_FUNCIONES_PUB.sql', para asegurarse de que los nombres de tablas y de columnas en las funciones sean los correctos. Ademas de evitar crear funciones que ya existen para no tener nombres de funciones duplicados.  

	- Se pueden ejecutar los scripts sql en la base de datos utilizando la conexion de supabase configurada en las variables de entorno del proyecto (.env.local). De lo contrario, se debe avisar en pantalla para que el usuarario copie los scripts y los ejecute en supabase de manera manual.
		
	- NUNCA pero NUNCA debes modificar archivos que no hayas creado.
	Los archivos que están dentro de la carpeta '\db\Esquema' de este proyecto son intocables. Solo se utilizan para leerlos, pero no para escribirlos. Así que no se tocan.
	
	- Para conocer la estructura de las tablas en la base de datos de este proyecto que puedan estar involucradas en el proceso actual, siempre debes revisar el archivo:
	'\db\Esquema\GEMODIDA_ESQUEMA_BD.sql'

	- Para saber cuales funciones podriamos necesitar de las que existen en la base de datos de este proyecto, vamos a revisar el archivo:
	'\db\Esquema\GEMODIDA_FUNCIONES_PUB.sql'

	- Para conocer las politicas RLS de las distintas tablas que puedan estar involucradas en el proceso actual, revisemos siempre el archivo:
	'\db\Esquema\GEMODIDA_POLITICAS_RLS.sql'
	
	- Para saber las reglas y requerimientos quiero que revises los archivos: '\docs\LOGICA_NEGOCIO_GEMODIDA.md'
---

**Esta política debe ser consultada y aplicada en cada sesión y tarea, sin excepción.**

Si se requiere agregar nuevas medidas, documentarlas aquí y notificar al usuario.
