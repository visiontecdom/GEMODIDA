-- Esquema (DDL) Generado por Sheet2Postgres

CREATE TABLE provincias (
    provincia TEXT NOT NULL PRIMARY KEY,
    capital TEXT NOT NULL,
    superficie_km2 NUMERIC(10, 2) NOT NULL,
    poblacion INTEGER NOT NULL,
    densidad NUMERIC(10, 2) NOT NULL
);