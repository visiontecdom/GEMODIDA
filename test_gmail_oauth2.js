const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './.env.local' });

// Configurar OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground' // Redirect URI
);

// Configurar refresh token
oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

// Crear transporter con OAuth2
const createTransporter = async () => {
  try {
    const accessToken = await oauth2Client.getAccessToken();

    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // STARTTLS
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_FROM,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
      tls: {
        rejectUnauthorized: false, // Para evitar problemas con certificados
      },
    });
  } catch (error) {
    throw new Error('Error configurando OAuth2: ' + error.message);
  }
};

async function enviarEmailPruebaGmailAPI() {
  console.log('🚀 PRUEBA DE ENVÍO DE EMAIL CON GMAIL API OAUTH2 - GEMODIDA');
  console.log('=============================================================');
  console.log('');
  console.log('📋 DETALLES DE LA PRUEBA:');
  console.log('Origen: lotecom@gmail.com (vía Gmail API OAuth2)');
  console.log('Destino: baez.israel@gmail.com');
  console.log('Asunto: Prueba');
  console.log('Mensaje: Esto es una prueba de GEMODIDA');
  console.log('');
  console.log('🔧 PROVEEDOR: Gmail API con OAuth2 (COMPLETAMENTE GRATIS)');
  console.log('');

  // Verificar configuración
  if (!process.env.GMAIL_CLIENT_ID ||
      !process.env.GMAIL_CLIENT_SECRET ||
      !process.env.GMAIL_REFRESH_TOKEN ||
      process.env.GMAIL_CLIENT_ID === 'tu_client_id_de_google_oauth2') {

    console.log('❌ CONFIGURACIÓN INCOMPLETA');
    console.log('====================================');
    console.log('');
    console.log('📋 PASOS PARA CONFIGURAR GMAIL API OAUTH2:');
    console.log('');
    console.log('1️⃣ CREAR PROYECTO EN GOOGLE CLOUD:');
    console.log('   • Ve a: https://console.cloud.google.com/');
    console.log('   • Crea un nuevo proyecto o selecciona uno existente');
    console.log('');
    console.log('2️⃣ HABILITAR GMAIL API:');
    console.log('   • Ve a "APIs & Services" → "Library"');
    console.log('   • Busca "Gmail API" y habilítala');
    console.log('');
    console.log('3️⃣ CREAR CREDENCIALES OAUTH2:');
    console.log('   • Ve a "APIs & Services" → "Credentials"');
    console.log('   • "Create Credentials" → "OAuth 2.0 Client IDs"');
    console.log('   • Application type: "Web application"');
    console.log('   • Authorized redirect URIs: https://developers.google.com/oauthplayground');
    console.log('   • Copia Client ID y Client Secret');
    console.log('');
    console.log('4️⃣ OBTENER REFRESH TOKEN:');
    console.log('   • Ve a: https://developers.google.com/oauthplayground');
    console.log('   • Configura OAuth2:');
    console.log('     - Client ID: pega el tuyo');
    console.log('     - Client Secret: pega el tuyo');
    console.log('   • Autoriza Gmail API (marca "https://www.googleapis.com/auth/gmail.send")');
    console.log('   • "Exchange authorization code for tokens"');
    console.log('   • Copia el "Refresh token"');
    console.log('');
    console.log('5️⃣ ACTUALIZAR .env.local:');
    console.log('   GMAIL_CLIENT_ID=tu_client_id');
    console.log('   GMAIL_CLIENT_SECRET=tu_client_secret');
    console.log('   GMAIL_REFRESH_TOKEN=tu_refresh_token');
    console.log('');
    console.log('6️⃣ VOLVER A EJECUTAR ESTA PRUEBA');
    console.log('');
    console.log('⚠️ NOTA: Asegúrate de que la cuenta lotecom@gmail.com tenga 2FA activado');
    console.log('        OAuth2 requiere verificación en dos pasos.');
    console.log('');
    return;
  }

  try {
    console.log('🔑 Configurando OAuth2...');
    const transporter = await createTransporter();

    console.log('📡 Verificando conexión con Gmail API...');
    await transporter.verify();
    console.log('✅ Conexión exitosa con Gmail API');
    console.log('');

    // Configurar el email
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME,
        address: process.env.EMAIL_FROM
      },
      to: 'baez.israel@gmail.com',
      subject: 'Prueba',
      text: 'Esto es una prueba de GEMODIDA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #2563eb; text-align: center;">🧪 Prueba de Email - GEMODIDA</h2>
          <div style="background: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px; color: #374151;">Esto es una prueba de GEMODIDA</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            Este es un email de prueba enviado desde el sistema GEMODIDA usando Gmail API OAuth2.<br>
            Fecha de envío: ${new Date().toLocaleString('es-ES')}
          </p>
        </div>
      `
    };

    console.log('📤 Enviando email...');
    const info = await transporter.sendMail(mailOptions);

    console.log('');
    console.log('✅ ¡EMAIL ENVIADO EXITOSAMENTE!');
    console.log('====================================');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('Accepted:', info.accepted.join(', '));

    if (info.accepted.includes('baez.israel@gmail.com')) {
      console.log('');
      console.log('🎉 ¡ÉXITO TOTAL! El email fue enviado correctamente.');
      console.log('📬 Revisa la bandeja de entrada de baez.israel@gmail.com');
      console.log('');
      console.log('✅ El sistema de envío de emails con Gmail API OAuth2 está funcionando.');
      console.log('✅ La funcionalidad de "Forgot Password" debería funcionar sin problemas.');
      console.log('');
      console.log('💡 Gmail API OAuth2 es completamente gratis y recomendado por Google.');
      console.log('💡 No hay límites de envío (solo límites razonables para evitar spam).');
    }

  } catch (error) {
    console.log('');
    console.log('❌ ERROR AL ENVIAR EMAIL');
    console.log('====================================');
    console.log('Error:', error.message);

    if (error.message.includes('invalid_grant')) {
      console.log('');
      console.log('🔐 ERROR DE REFRESH TOKEN EXPIRADO');
      console.log('El refresh token ha expirado. Necesitas generar uno nuevo:');
      console.log('1. Ve a https://developers.google.com/oauthplayground');
      console.log('2. Repite el proceso de autorización');
      console.log('3. Actualiza GMAIL_REFRESH_TOKEN en .env.local');
    } else if (error.message.includes('access_denied')) {
      console.log('');
      console.log('🚫 ACCESO DENEGADO');
      console.log('Verifica que hayas autorizado el scope "https://www.googleapis.com/auth/gmail.send"');
    } else if (error.message.includes('invalid_client')) {
      console.log('');
      console.log('❌ CREDENCIALES INVÁLIDAS');
      console.log('Verifica que Client ID y Client Secret sean correctos');
    } else {
      console.log('');
      console.log('❓ ERROR DESCONOCIDO');
      console.log('Revisa la configuración de OAuth2');
    }

    console.log('');
    console.log('💡 RECURSO DE AYUDA:');
    console.log('https://developers.google.com/gmail/api/quickstart/nodejs');
  }
}

// Ejecutar la prueba
enviarEmailPruebaGmailAPI();