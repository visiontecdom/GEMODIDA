# 🚀 GUÍA DE DESPLIEGUE - GEMODIDA

## Requisitos Previos

- Node.js 18+
- npm 10+
- Cuenta de Supabase
- Variables de entorno configuradas

## Variables de Entorno

Crear archivo `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://user:password@host:port/database
```

## Instalación Local

```bash
# Clonar repositorio
git clone <repository-url>
cd GEMODIDA

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build

# Iniciar servidor de producción
npm start
```

## Despliegue en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Desplegar en producción
vercel --prod
```

## Despliegue en Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Construir imagen
docker build -t GEMODIDA .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env.local GEMODIDA
```

## Despliegue en AWS

### Usando Elastic Beanstalk

```bash
# Instalar EB CLI
pip install awsebcli

# Inicializar
eb init -p node.js-18 GEMODIDA

# Crear entorno
eb create GEMODIDA-env

# Desplegar
eb deploy
```

### Usando EC2

```bash
# Conectar a instancia
ssh -i key.pem ec2-user@instance-ip

# Instalar Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Clonar y configurar
git clone <repository-url>
cd GEMODIDA
npm install
npm run build

# Usar PM2 para mantener la app activa
npm install -g pm2
pm2 start npm --name "GEMODIDA" -- start
pm2 startup
pm2 save
```

## Configuración de Base de Datos

### Ejecutar Migraciones

```bash
# Conectar a Supabase
psql postgresql://user:password@host:port/database

# Ejecutar scripts SQL
\i db/scripts_sql/01_initial_schema.sql
\i db/scripts_sql/02_functions.sql
\i db/scripts_sql/05_fix_functions_and_rls.sql
\i db/scripts_sql/06_funciones_rpc_datos_reales.sql
\i db/scripts_sql/07_tablas_faltantes.sql
\i db/scripts_sql/08_funciones_rpc_surveys.sql
\i db/scripts_sql/09_funciones_rpc_activities.sql
```

## Verificación Post-Despliegue

- [ ] Verificar que la aplicación está accesible
- [ ] Probar autenticación
- [ ] Verificar conexión a base de datos
- [ ] Probar API routes
- [ ] Verificar permisos de usuario
- [ ] Probar CRUD de usuarios
- [ ] Probar CRUD de palabras clave
- [ ] Verificar generación de reportes

## Monitoreo

### Logs

```bash
# Vercel
vercel logs

# Docker
docker logs <container-id>

# PM2
pm2 logs GEMODIDA
```

### Métricas

- Usar Vercel Analytics
- Configurar CloudWatch en AWS
- Usar Datadog para monitoreo avanzado

## Rollback

```bash
# Vercel
vercel rollback

# Docker
docker run -p 3000:3000 GEMODIDA:previous-tag

# AWS EB
eb abort
```

## Troubleshooting

### Error de conexión a BD
- Verificar variables de entorno
- Verificar firewall de BD
- Verificar credenciales

### Error de autenticación
- Verificar tokens de Supabase
- Verificar RLS policies
- Verificar permisos de usuario

### Error de API routes
- Verificar middleware de autenticación
- Verificar logs de servidor
- Verificar CORS headers

## Soporte

Para reportar problemas, crear un issue en el repositorio.
