Perfecto, Israel 🙌. Te preparo los **scripts DDL en PostgreSQL (Supabase)** para crear todas las tablas que definimos, y además incluyo **funciones RPC (stored procedures)** que podrás invocar desde tu aplicación (via Supabase client) para recuperar y editar datos.  

---

## 📑 Scripts DDL – Creación de Tablas

```sql
-- Tabla de usuarios
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    rol VARCHAR(50) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT NOW()
);

-- Tabla de palabras clave
CREATE TABLE palabras_clave (
    id_palabra SERIAL PRIMARY KEY,
    palabra VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    creado_por INT REFERENCES usuarios(id_usuario)
);

-- Tabla de fuentes
CREATE TABLE fuentes (
    id_fuente SERIAL PRIMARY KEY,
    nombre_fuente VARCHAR(100) NOT NULL,
    tipo_fuente VARCHAR(50) NOT NULL,
    url_base VARCHAR(255)
);

-- Tabla de resultados
CREATE TABLE resultados (
    id_resultado SERIAL PRIMARY KEY,
    id_palabra INT REFERENCES palabras_clave(id_palabra),
    id_fuente INT REFERENCES fuentes(id_fuente),
    texto_encontrado TEXT NOT NULL,
    url_origen VARCHAR(500),
    fecha_publicacion TIMESTAMP,
    fecha_registro TIMESTAMP DEFAULT NOW(),
    sentimiento VARCHAR(50)
);

-- Tabla de estadísticas
CREATE TABLE estadisticas (
    id_estadistica SERIAL PRIMARY KEY,
    id_palabra INT REFERENCES palabras_clave(id_palabra),
    id_fuente INT REFERENCES fuentes(id_fuente),
    frecuencia INT NOT NULL,
    periodo VARCHAR(50) NOT NULL,
    tendencia VARCHAR(50),
    fecha_calculo TIMESTAMP DEFAULT NOW()
);

-- Tabla de reportes
CREATE TABLE reportes (
    id_reporte SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    formato VARCHAR(50) NOT NULL,
    ruta_archivo VARCHAR(500),
    fecha_generacion TIMESTAMP DEFAULT NOW(),
    generado_por INT REFERENCES usuarios(id_usuario)
);

-- Tabla de logs de procesos
CREATE TABLE logs_procesos (
    id_log SERIAL PRIMARY KEY,
    proceso VARCHAR(100) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    detalle TEXT,
    fecha_ejecucion TIMESTAMP DEFAULT NOW()
);
```

---

## ⚙️ Funciones RPC (Stored Procedures)

Estas funciones se pueden invocar desde Supabase usando `supabase.rpc('nombre_funcion', {...})`.

### 1. Recuperar resultados por palabra clave
```sql
CREATE OR REPLACE FUNCTION obtener_resultados_por_palabra(p_palabra TEXT)
RETURNS TABLE (
    id_resultado INT,
    texto_encontrado TEXT,
    url_origen VARCHAR,
    fecha_publicacion TIMESTAMP,
    fuente VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT r.id_resultado, r.texto_encontrado, r.url_origen, r.fecha_publicacion, f.nombre_fuente
    FROM resultados r
    JOIN palabras_clave p ON r.id_palabra = p.id_palabra
    JOIN fuentes f ON r.id_fuente = f.id_fuente
    WHERE p.palabra ILIKE p_palabra;
END;
$$ LANGUAGE plpgsql;
```

---

### 2. Insertar nuevo resultado
```sql
CREATE OR REPLACE FUNCTION insertar_resultado(
    p_id_palabra INT,
    p_id_fuente INT,
    p_texto TEXT,
    p_url VARCHAR,
    p_fecha TIMESTAMP,
    p_sentimiento VARCHAR
) RETURNS VOID AS $$
BEGIN
    INSERT INTO resultados (id_palabra, id_fuente, texto_encontrado, url_origen, fecha_publicacion, sentimiento)
    VALUES (p_id_palabra, p_id_fuente, p_texto, p_url, p_fecha, p_sentimiento);
END;
$$ LANGUAGE plpgsql;
```

---

### 3. Actualizar palabra clave
```sql
CREATE OR REPLACE FUNCTION actualizar_palabra(
    p_id_palabra INT,
    p_nueva_palabra VARCHAR,
    p_descripcion TEXT
) RETURNS VOID AS $$
BEGIN
    UPDATE palabras_clave
    SET palabra = p_nueva_palabra,
        descripcion = p_descripcion,
        fecha_creacion = NOW()
    WHERE id_palabra = p_id_palabra;
END;
$$ LANGUAGE plpgsql;
```

---

### 4. Generar estadística de frecuencia
```sql
CREATE OR REPLACE FUNCTION calcular_frecuencia(
    p_id_palabra INT,
    p_id_fuente INT,
    p_periodo VARCHAR
) RETURNS VOID AS $$
DECLARE
    v_frecuencia INT;
BEGIN
    SELECT COUNT(*) INTO v_frecuencia
    FROM resultados
    WHERE id_palabra = p_id_palabra
      AND id_fuente = p_id_fuente
      AND fecha_registro::date = CURRENT_DATE;

    INSERT INTO estadisticas (id_palabra, id_fuente, frecuencia, periodo, tendencia)
    VALUES (p_id_palabra, p_id_fuente, v_frecuencia, p_periodo, 'pendiente');
END;
$$ LANGUAGE plpgsql;
```

---

## 🚀 Recomendaciones
- **Indices:**  
  - Crear índices en `palabra`, `fecha_publicacion`, `id_fuente` para acelerar búsquedas.  
- **Políticas de Supabase (RLS):**  
  - Define reglas de acceso según `rol` en `usuarios`.  
- **RPCs adicionales:**  
  - `obtener_estadisticas_por_periodo`  
  - `insertar_reporte`  
  - `obtener_reportes_por_usuario`  

---

Israel, con estos **DDL + RPC** ya tienes la base lista para implementar en Supabase y conectar desde tu frontend en React/Next.js.  

👉 ¿Quieres que te prepare también ejemplos de **consultas desde el cliente (JavaScript con Supabase SDK)** para que veas cómo invocar estas funciones desde la interfaz?