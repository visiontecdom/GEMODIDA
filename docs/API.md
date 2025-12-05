# GEMODIDA API Documentation

## Endpoints

### Scraping

#### POST /api/scraping/simulate
Simula un proceso de scraping.

**Request:**
```json
{
  "keyword_id": 1,
  "fuente_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Scraping simulado completado. 5 resultados guardados.",
  "resultados_count": 5
}
```

#### GET /api/scraping/status
Obtiene el estado de un scraping.

**Query Parameters:**
- `keyword_id` (required): ID de la palabra clave

**Response:**
```json
{
  "keyword_id": 1,
  "estado": "completado",
  "progreso": 100,
  "resultados_encontrados": 25,
  "ultima_actualizacion": "2025-11-19T10:30:00Z"
}
```

### Notifications

#### POST /api/notifications/send
Envía una notificación.

**Request:**
```json
{
  "usuario_id": "user-123",
  "titulo": "Nueva notificación",
  "mensaje": "Contenido de la notificación",
  "tipo": "info"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notificación enviada exitosamente"
}
```

### Reports

#### POST /api/reports/generate
Genera un nuevo reporte.

**Request:**
```json
{
  "titulo": "Reporte de Ventas",
  "tipo": "general",
  "descripcion": "Reporte de ventas del mes",
  "fecha_inicio": "2025-11-01",
  "fecha_fin": "2025-11-30"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reporte en generación"
}
```

## Authentication

Todos los endpoints requieren autenticación con token Bearer:

```
Authorization: Bearer <token>
```

## Error Handling

Los errores se devuelven con el siguiente formato:

```json
{
  "error": "Descripción del error",
  "code": "ERROR_CODE"
}
```

## Rate Limiting

- 100 requests por minuto por usuario
- 1000 requests por hora por usuario

## Versioning

API Version: 1.0.0
