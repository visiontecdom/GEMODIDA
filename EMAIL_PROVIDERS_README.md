# 🚀 SISTEMA DE EMAIL MULTIPROVEEDOR - GEMODIDA

## 📧 Proveedores de Email Disponibles

El sistema de "Forgot Password" ahora soporta múltiples proveedores de email, permitiendo flexibilidad y redundancia.

---

## 1️⃣ SMTP EMPRESARIAL (RECOMENDADO)

### ✅ Ventajas
- **Independiente de Google**: No depende de servicios de Google
- **Profesional**: Ideal para empresas con dominio propio
- **Fácil configuración**: Solo necesitas credenciales SMTP
- **Confianza**: Mejor deliverability para emails corporativos

### 🔧 Configuración

#### Variables de Entorno (.env.local):
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@empresa.com
SMTP_PASS=tu_password
EMAIL_FROM=tu_email@empresa.com
EMAIL_FROM_NAME=GEMODIDA Sistema
```

#### Proveedores Comunes:

| Proveedor | SMTP Host | Puerto | Notas |
|-----------|-----------|--------|-------|
| **Microsoft 365** | `smtp.office365.com` | 587 | Requiere habilitar SMTP en admin portal |
| **Gmail** | `smtp.gmail.com` | 587 | Usa contraseña de aplicación |
| **Zoho Mail** | `smtp.zoho.com` | 587 | Excelente para pequeñas empresas |
| **ProtonMail** | `smtp.protonmail.com` | 587 | Enfocado en privacidad |
| **Yahoo** | `smtp.mail.yahoo.com` | 587 | Para cuentas Yahoo |

### 🧪 Probar Configuración:
```bash
node test_smtp_empresarial.js
```

---

## 2️⃣ Gmail API OAuth2 (GRATIS)

### ✅ Ventajas
- **100% Gratuito**: Sin límites de envío
- **Alta deliverability**: Excelente reputación de Gmail
- **Recomendado por Google**: Solución oficial

### ❌ Desventajas
- **Configuración compleja**: Requiere Google Cloud Console
- **Dependencia de Google**: Sujeto a cambios de política

### 🔧 Configuración Compleja

#### Paso 1: Google Cloud Console
1. Ve a: https://console.cloud.google.com/
2. Crea proyecto o selecciona existente
3. Habilita "Gmail API"
4. Crea "OAuth 2.0 Client IDs"
5. Configura redirect URI: `https://developers.google.com/oauthplayground`

#### Paso 2: OAuth2 Playground
1. Ve a: https://developers.google.com/oauthplayground
2. Configura tus Client ID/Secret
3. Selecciona scope: `https://www.googleapis.com/auth/gmail.send`
4. Autoriza y obtén refresh token

#### Variables de Entorno:
```env
EMAIL_PROVIDER=gmail_oauth2
GMAIL_CLIENT_ID=tu_client_id
GMAIL_CLIENT_SECRET=tu_client_secret
GMAIL_REFRESH_TOKEN=tu_refresh_token
EMAIL_FROM=tu_email@gmail.com
EMAIL_FROM_NAME=GEMODIDA Sistema
```

### 🧪 Probar Configuración:
```bash
node test_gmail_oauth2.js
node diagnostico_oauth2.js
```

---

## 3️⃣ SendGrid (GRATIS CON LÍMITES)

### ✅ Ventajas
- **Buena deliverability**: API profesional
- **Dashboard**: Monitoreo y estadísticas
- **Escalable**: Fácil upgrade a pago

### ❌ Desventajas
- **Límite gratuito**: 100 emails/día
- **Registro requerido**: Proceso de verificación

### 🔧 Configuración

#### Paso 1: Registro en SendGrid
1. Ve a: https://sendgrid.com
2. Regístrate (gratis)
3. Verifica tu email
4. Ve a Settings > API Keys
5. Crea API Key con permisos "Mail Send"

#### Variables de Entorno:
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=tu_api_key
EMAIL_FROM=tu_email_verificado@dominio.com
EMAIL_FROM_NAME=GEMODIDA Sistema
```

### 📦 Instalación:
```bash
npm install @sendgrid/mail
```

---

## 🔄 Cambiar Entre Proveedores

### Opción 1: Configurador Interactivo
```bash
node configurar_email.js
```

### Opción 2: Manual
Edita `.env.local` y cambia `EMAIL_PROVIDER`:
- `EMAIL_PROVIDER=smtp` (SMTP Empresarial)
- `EMAIL_PROVIDER=gmail_oauth2` (Gmail API)
- `EMAIL_PROVIDER=sendgrid` (SendGrid)

---

## 🧪 Probar Sistema Completo

### Con API Route:
```bash
# Asegúrate de que Next.js esté ejecutándose
npm run dev

# En otra terminal
node test_api_send_reset_email.js
```

### Pruebas Específicas:
```bash
# SMTP Empresarial
node test_smtp_empresarial.js

# Gmail OAuth2
node test_gmail_oauth2.js

# Diagnóstico OAuth2
node diagnostico_oauth2.js
```

---

## 🚨 Solución de Problemas

### Error: "self-signed certificate"
**Solución**: El código ya maneja esto automáticamente.

### Error: "Invalid login" (SMTP)
**Solución**: Verifica credenciales y configuración del proveedor.

### Error: "insufficient authentication scopes" (Gmail)
**Solución**: Regenera refresh token con el scope correcto.

### Error: SendGrid no funciona
**Solución**: Instala SendGrid con `npm install @sendgrid/mail`

---

## 📊 Recomendaciones

### Para Desarrollo:
- **SMTP Empresarial**: Más fácil y rápido de configurar

### Para Producción:
- **SMTP Empresarial**: Mejor para empresas con dominio propio
- **Gmail OAuth2**: Si no tienes SMTP empresarial
- **SendGrid**: Para alta volumetría (cuando excedas límites gratuitos)

### Backup/Fallback:
Configura múltiples proveedores y implementa lógica de fallback automático.

---

## 🔧 Configuración Rápida

Ejecuta el configurador interactivo:
```bash
node configurar_email.js
```

Este script te guiará paso a paso para configurar cualquier proveedor.