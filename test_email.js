const nodemailer = require('nodemailer');
require('dotenv').config({ path: './.env.local' });

// Configuración del transportador de email usando variables de entorno
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER, // Usar la configuración del .env.local
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Para evitar problemas con certificados
  }
});

// Función para enviar email de prueba
async function enviarEmailPrueba() {
  console.log('🚀 ENVIANDO EMAIL DE PRUEBA');
  console.log('================================');
  console.log('Configuración actual:');
  console.log('- EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('- EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('- EMAIL_USER:', process.env.EMAIL_USER);
  console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? '***CONFIGURADO***' : 'NO CONFIGURADO');
  console.log('');
  console.log('Email a enviar:');
  console.log('Origen: lotecom@gmail.com (usando credenciales de .env.local)');
  console.log('Destino: baez.israel@gmail.com');
  console.log('Asunto: Prueba');
  console.log('Mensaje: Esto es una prueba de GEMODIDA');
  console.log('');

  try {
    // Verificar conexión
    console.log('📡 Verificando conexión con Gmail...');
    await transporter.verify();
    console.log('✅ Conexión exitosa con Gmail');
    console.log('');

    // Configurar el email
    const mailOptions = {
      from: {
        name: 'GEMODIDA Sistema',
        address: 'lotecom@gmail.com'
      },
      to: 'baez.israel@gmail.com',
      subject: 'Prueba',
      text: 'Esto es una prueba de GEMODIDA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Prueba de Email - GEMODIDA</h2>
          <p>Esto es una prueba de GEMODIDA</p>
          <hr style="border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Este es un email de prueba enviado desde el sistema GEMODIDA.
          </p>
        </div>
      `
    };

    // Enviar el email
    console.log('📤 Enviando email...');
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ EMAIL ENVIADO EXITOSAMENTE');
    console.log('================================');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('Accepted:', info.accepted);
    console.log('Rejected:', info.rejected);

    if (info.accepted.includes('baez.israel@gmail.com')) {
      console.log('');
      console.log('🎉 ¡ÉXITO! El email fue aceptado por Gmail');
      console.log('Revisa la bandeja de entrada de baez.israel@gmail.com');
    }

  } catch (error) {
    console.log('');
    console.log('❌ ERROR AL ENVIAR EMAIL');
    console.log('================================');
    console.log('Error:', error.message);

    if (error.code === 'EAUTH') {
      console.log('');
      console.log('🔐 Posibles causas del error de autenticación:');
      console.log('1. La contraseña de aplicación puede ser incorrecta');
      console.log('2. La verificación en dos pasos debe estar activada en Gmail');
      console.log('3. Debes generar una "Contraseña de aplicación" en Gmail');
      console.log('   Ve a: https://myaccount.google.com/apppasswords');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('🌐 Error de conexión: Verifica tu conexión a internet');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('');
      console.log('⏰ Timeout: El servidor de Gmail no responde');
    }

    console.log('');
    console.log('💡 Solución sugerida:');
    console.log('1. Ve a https://myaccount.google.com/apppasswords');
    console.log('2. Genera una nueva contraseña de aplicación');
    console.log('3. Actualiza EMAIL_PASS en .env.local');
    console.log('4. Vuelve a ejecutar esta prueba');
  }
}

// Ejecutar la prueba
enviarEmailPrueba();