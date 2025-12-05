-- Esquema (DDL) Generado por Sheet2Postgres

CREATE TABLE provincias (
    provincia TEXT PRIMARY KEY,
    capital TEXT,
    ciudad_mas_poblada TEXT,
    escudo TEXT,
    region TEXT,
    superficie_km2 NUMERIC,
    poblacion_2021 INTEGER,
    densidad_hab_km2 NUMERIC,
    latitud NUMERIC,
    longitud NUMERIC,
    mapa TEXT
);