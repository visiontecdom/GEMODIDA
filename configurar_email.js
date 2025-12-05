const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function pregunta(texto) {
  return new Promise((resolve) => {
    rl.question(texto, resolve);
  });
}

async function configurarEmail() {
  console.log('🚀 CONFIGURADOR DE PROVEEDORES DE EMAIL - GEMODIDA');
  console.log('==================================================\n');

  console.log('📧 PROVEEDORES DISPONIBLES:\n');

  console.log('1️⃣  SMTP EMPRESARIAL (Microsoft 365, Zoho, ProtonMail, etc.)');
  console.log('   ✅ Fácil configuración');
  console.log('   ✅ No depende de Google');
  console.log('   ✅ Profesional para empresas');
  console.log('   ❌ Puede requerir pago según el proveedor\n');

  console.log('2️⃣  GMAIL API OAUTH2 (Completamente gratis)');
  console.log('   ✅ 100% gratuito');
  console.log('   ✅ Alta deliverability');
  console.log('   ❌ Configuración más compleja');
  console.log('   ❌ Depende de Google\n');

  console.log('3️⃣  SENDGRID (Gratis hasta 100 emails/día)');
  console.log('   ✅ Buena deliverability');
  console.log('   ✅ API profesional');
  console.log('   ❌ Límite de emails gratis');
  console.log('   ❌ Requiere registro\n');

  const opcion = await pregunta('¿Qué proveedor deseas configurar? (1=SMPT, 2=Gmail OAuth2, 3=SendGrid): ');

  let config = {};

  switch (opcion.trim()) {
    case '1':
      console.log('\n🔧 CONFIGURANDO SMTP EMPRESARIAL...\n');
      config = await configurarSMTP();
      break;

    case '2':
      console.log('\n🔧 CONFIGURANDO GMAIL API OAUTH2...\n');
      config = await configurarGmailOAuth2();
      break;

    case '3':
      console.log('\n🔧 CONFIGURANDO SENDGRID...\n');
      config = await configurarSendGrid();
      break;

    default:
      console.log('❌ Opción no válida. Ejecuta el script nuevamente.');
      rl.close();
      return;
  }

  // Aplicar configuración
  await aplicarConfiguracion(config);

  console.log('\n🎉 CONFIGURACIÓN COMPLETADA');
  console.log('💡 Ejecuta: node test_api_send_reset_email.js (con el servidor Next.js ejecutándose)');
  console.log('💡 O prueba directamente: node test_smtp_empresarial.js (para SMTP)');

  rl.close();
}

async function configurarSMTP() {
  console.log('📋 PROVEEDORES SMTP COMUNES:');
  console.log('• Microsoft 365/Outlook: smtp.office365.com:587');
  console.log('• Gmail: smtp.gmail.com:587');
  console.log('• Zoho: smtp.zoho.com:587');
  console.log('• ProtonMail: smtp.protonmail.com:587');
  console.log('• Yahoo: smtp.mail.yahoo.com:587\n');

  const host = await pregunta('SMTP Host (ej: smtp.office365.com): ');
  const port = await pregunta('SMTP Port (ej: 587): ');
  const user = await pregunta('Email de usuario: ');
  const pass = await pregunta('Contraseña (no se mostrará): ');

  return {
    EMAIL_PROVIDER: 'smtp',
    SMTP_HOST: host.trim(),
    SMTP_PORT: port.trim() || '587',
    SMTP_SECURE: 'false',
    SMTP_USER: user.trim(),
    SMTP_PASS: pass.trim(),
    EMAIL_FROM: user.trim(),
    EMAIL_FROM_NAME: 'GEMODIDA Sistema'
  };
}

async function configurarGmailOAuth2() {
  console.log('⚠️  IMPORTANTE: Necesitas configurar Google Cloud Console primero\n');

  console.log('📋 PASOS PARA CONFIGURACIÓN:');
  console.log('1. Ve a: https://console.cloud.google.com/');
  console.log('2. Crea un proyecto o selecciona uno existente');
  console.log('3. Habilita Gmail API');
  console.log('4. Crea credenciales OAuth2');
  console.log('5. Configura redirect URI: https://developers.google.com/oauthplayground');
  console.log('6. Ve a OAuth2 Playground y obtén refresh token\n');

  const clientId = await pregunta('Client ID de Google: ');
  const clientSecret = await pregunta('Client Secret de Google: ');
  const refreshToken = await pregunta('Refresh Token: ');

  return {
    EMAIL_PROVIDER: 'gmail_oauth2',
    GMAIL_CLIENT_ID: clientId.trim(),
    GMAIL_CLIENT_SECRET: clientSecret.trim(),
    GMAIL_REFRESH_TOKEN: refreshToken.trim(),
    EMAIL_FROM: 'lotecom@gmail.com',
    EMAIL_FROM_NAME: 'GEMODIDA Sistema'
  };
}

async function configurarSendGrid() {
  console.log('📋 PARA OBTENER API KEY:');
  console.log('1. Ve a: https://sendgrid.com');
  console.log('2. Regístrate (es gratis)');
  console.log('3. Ve a Settings > API Keys');
  console.log('4. Crea una API Key con permisos de envío\n');

  const apiKey = await pregunta('SendGrid API Key: ');
  const emailFrom = await pregunta('Email FROM (verificado en SendGrid): ');

  return {
    EMAIL_PROVIDER: 'sendgrid',
    SENDGRID_API_KEY: apiKey.trim(),
    EMAIL_FROM: emailFrom.trim(),
    EMAIL_FROM_NAME: 'GEMODIDA Sistema'
  };
}

async function aplicarConfiguracion(config) {
  const envPath = path.join(__dirname, '.env.local');

  try {
    // Leer archivo actual
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Actualizar configuración
    Object.entries(config).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const newLine = `${key}=${value}`;

      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, newLine);
      } else {
        envContent += `\n${newLine}`;
      }
    });

    // Guardar archivo
    fs.writeFileSync(envPath, envContent.trim() + '\n');

    console.log('✅ Configuración guardada en .env.local');

  } catch (error) {
    console.error('❌ Error al guardar configuración:', error.message);
  }
}

// Ejecutar configurador
configurarEmail().catch(console.error);