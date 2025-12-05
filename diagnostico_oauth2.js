const { google } = require('googleapis');
require('dotenv').config({ path: './.env.local' });

console.log('🔍 DIAGNÓSTICO DE GMAIL API OAUTH2');
console.log('=====================================\n');

// Verificar variables de entorno
console.log('📋 VARIABLES DE ENTORNO:');
console.log(`GMAIL_CLIENT_ID: ${process.env.GMAIL_CLIENT_ID ? '✅ Presente' : '❌ Faltante'}`);
console.log(`GMAIL_CLIENT_SECRET: ${process.env.GMAIL_CLIENT_SECRET ? '✅ Presente' : '❌ Faltante'}`);
console.log(`GMAIL_REFRESH_TOKEN: ${process.env.GMAIL_REFRESH_TOKEN ? '✅ Presente' : '❌ Faltante'}`);
console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM || '❌ Faltante'}\n`);

// Configurar OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

// Configurar refresh token
oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

async function diagnosticarOAuth2() {
  try {
    console.log('🔑 PROBANDO CONFIGURACIÓN OAUTH2...\n');

    // Intentar obtener access token
    console.log('📡 Solicitando access token...');
    const accessToken = await oauth2Client.getAccessToken();

    if (accessToken.token) {
      console.log('✅ Access token obtenido exitosamente');
      console.log(`🔑 Token: ${accessToken.token.substring(0, 30)}...\n`);

      // Verificar permisos con Gmail API
      console.log('📧 VERIFICANDO PERMISOS DE GMAIL API...');
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      try {
        const profile = await gmail.users.getProfile({ userId: 'me' });
        console.log('✅ Conexión a Gmail API exitosa');
        console.log(`📧 Email de la cuenta: ${profile.data.emailAddress}`);
        console.log(`📊 Total de mensajes: ${profile.data.messagesTotal}\n`);

        console.log('🎉 DIAGNÓSTICO COMPLETADO: OAuth2 configurado correctamente');
        console.log('💡 El problema puede estar en la configuración del transporter de Nodemailer');

      } catch (gmailError) {
        console.log('❌ Error al conectar con Gmail API:');
        console.log(gmailError.message);

        if (gmailError.message.includes('access_denied')) {
          console.log('\n🔧 POSIBLE SOLUCIÓN: El scope de OAuth2 no incluye envío de emails');
        } else if (gmailError.message.includes('invalid_grant')) {
          console.log('\n🔧 POSIBLE SOLUCIÓN: El refresh token ha expirado o es inválido');
        }
      }

    } else {
      console.log('❌ No se pudo obtener access token\n');
      console.log('🔧 POSIBLE SOLUCIÓN: Refresh token inválido o expirado');
    }

  } catch (error) {
    console.log('❌ ERROR EN DIAGNÓSTICO:');
    console.log(error.message);

    if (error.message.includes('invalid_grant')) {
      console.log('\n🔧 SOLUCIÓN: Necesitas regenerar el refresh token');
      console.log('   1. Ve a: https://developers.google.com/oauthplayground');
      console.log('   2. Configura tus Client ID y Client Secret');
      console.log('   3. Selecciona scope: https://www.googleapis.com/auth/gmail.send');
      console.log('   4. Autoriza y obtén nuevo refresh token');
    }
  }
}

diagnosticarOAuth2();