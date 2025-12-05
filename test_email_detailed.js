const nodemailer = require('nodemailer');
require('dotenv').config({ path: './.env.local' });

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Función para enviar email de prueba
async function enviarEmailPrueba() {
  console.log('🚀 PRUEBA DE ENVÍO DE EMAIL - GEMODIDA');
  console.log('==========================================');
  console.log('');
  console.log('📋 DETALLES DE LA PRUEBA:');
  console.log('Origen: lotecom@gmail.com');
  console.log('Destino: baez.israel@gmail.com');
  console.log('Asunto: Prueba');
  console.log('Mensaje: Esto es una prueba de GEMODIDA');
  console.log('');
  console.log('⚙️ CONFIGURACIÓN ACTUAL:');
  console.log(`EMAIL_HOST: ${process.env.EMAIL_HOST}`);
  console.log(`EMAIL_PORT: ${process.env.EMAIL_PORT}`);
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '***CONFIGURADO***' : '❌ NO CONFIGURADO'}`);
  console.log('');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ ERROR: Variables de entorno no configuradas');
    console.log('');
    console.log('💡 SOLUCIÓN: Configura EMAIL_USER y EMAIL_PASS en .env.local');
    return;
  }

  try {
    console.log('📡 Verificando conexión con Gmail...');
    await transporter.verify();
    console.log('✅ Conexión exitosa con Gmail');
    console.log('');

    // Configurar el email
    const mailOptions = {
      from: {
        name: 'GEMODIDA Sistema',
        address: process.env.EMAIL_USER
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
            Este es un email de prueba enviado desde el sistema GEMODIDA.<br>
            Fecha de envío: ${new Date().toLocaleString('es-ES')}
          </p>
        </div>
      `
    };

    console.log('📤 Enviando email...');
    const info = await transporter.sendMail(mailOptions);

    console.log('');
    console.log('✅ ¡EMAIL ENVIADO EXITOSAMENTE!');
    console.log('=====================================');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📨 Response: ${info.response}`);
    console.log(`✅ Accepted: ${info.accepted.join(', ')}`);
    if (info.rejected.length > 0) {
      console.log(`❌ Rejected: ${info.rejected.join(', ')}`);
    }

    if (info.accepted.includes('baez.israel@gmail.com')) {
      console.log('');
      console.log('🎉 ¡ÉXITO TOTAL! El email fue enviado correctamente.');
      console.log('📬 Revisa la bandeja de entrada de baez.israel@gmail.com');
      console.log('');
      console.log('✅ El sistema de envío de emails está funcionando correctamente.');
      console.log('✅ La funcionalidad de "Forgot Password" debería funcionar sin problemas.');
    }

  } catch (error) {
    console.log('');
    console.log('❌ ERROR AL ENVIAR EMAIL');
    console.log('=====================================');
    console.log(`Error: ${error.message}`);
    console.log('');

    if (error.code === 'EAUTH') {
      console.log('🔐 PROBLEMA DE AUTENTICACIÓN DETECTADO');
      console.log('');
      console.log('📋 PASOS PARA SOLUCIONAR:');
      console.log('');
      console.log('1️⃣ ACCEDER A LA CONFIGURACIÓN DE GMAIL:');
      console.log('   • Ve a: https://myaccount.google.com/');
      console.log('   • Ve a la sección "Seguridad"');
      console.log('');
      console.log('2️⃣ ACTIVAR VERIFICACIÓN EN DOS PASOS:');
      console.log('   • Si no está activada, actívala');
      console.log('');
      console.log('3️⃣ GENERAR CONTRASEÑA DE APLICACIÓN:');
      console.log('   • Ve a: https://myaccount.google.com/apppasswords');
      console.log('   • Selecciona "Correo" como aplicación');
      console.log('   • Selecciona "Otro" como dispositivo');
      console.log('   • Escribe "GEMODIDA" como nombre');
      console.log('   • Copia la contraseña de 16 caracteres generada');
      console.log('');
      console.log('4️⃣ ACTUALIZAR .env.local:');
      console.log('   • EMAIL_PASS=tu_nueva_contraseña_de_16_caracteres');
      console.log('');
      console.log('5️⃣ VOLVER A EJECUTAR ESTA PRUEBA:');
      console.log('   • node test_email.js');

    } else if (error.code === 'ECONNREFUSED') {
      console.log('🌐 ERROR DE CONEXIÓN: Verifica tu conexión a internet');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('⏰ TIMEOUT: El servidor de Gmail no responde');
    } else {
      console.log('❓ ERROR DESCONOCIDO: Revisa la configuración');
    }
  }
}

// Ejecutar la prueba
enviarEmailPrueba();