const sgMail = require('@sendgrid/mail');
require('dotenv').config({ path: './.env.local' });

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function enviarEmailPruebaSendGrid() {
  console.log('🚀 PRUEBA DE ENVÍO DE EMAIL CON SENDGRID - GEMODIDA');
  console.log('====================================================');
  console.log('');
  console.log('📋 DETALLES DE LA PRUEBA:');
  console.log('Origen: lotecom@gmail.com');
  console.log('Destino: baez.israel@gmail.com');
  console.log('Asunto: Prueba');
  console.log('Mensaje: Esto es una prueba de GEMODIDA');
  console.log('');
  console.log('🔧 PROVEEDOR: SendGrid (recomendado por Google)');
  console.log('');

  // Verificar configuración
  if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'tu_api_key_de_sendgrid_aqui') {
    console.log('❌ CONFIGURACIÓN INCOMPLETA');
    console.log('====================================');
    console.log('');
    console.log('📋 PASOS PARA CONFIGURAR SENDGRID:');
    console.log('');
    console.log('1️⃣ CREAR CUENTA EN SENDGRID:');
    console.log('   • Ve a: https://sendgrid.com');
    console.log('   • Regístrate gratis (100 emails/día gratis)');
    console.log('');
    console.log('2️⃣ VERIFICAR EMAIL Y DOMINIO:');
    console.log('   • Verifica tu email (lotecom@gmail.com)');
    console.log('   • Single Sender Verification: agrega lotecom@gmail.com');
    console.log('');
    console.log('3️⃣ OBTENER API KEY:');
    console.log('   • Ve a Settings → API Keys');
    console.log('   • Create API Key → Full Access');
    console.log('   • Copia la API Key generada');
    console.log('');
    console.log('4️⃣ ACTUALIZAR .env.local:');
    console.log('   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxx');
    console.log('');
    console.log('5️⃣ VOLVER A EJECUTAR ESTA PRUEBA');
    console.log('');
    return;
  }

  try {
    console.log('📡 Verificando API Key de SendGrid...');

    // Configurar el email
    const msg = {
      to: 'baez.israel@gmail.com',
      from: {
        email: process.env.EMAIL_FROM,
        name: process.env.EMAIL_FROM_NAME || 'GEMODIDA Sistema'
      },
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
            Este es un email de prueba enviado desde el sistema GEMODIDA usando SendGrid.<br>
            Fecha de envío: ${new Date().toLocaleString('es-ES')}
          </p>
        </div>
      `,
    };

    console.log('📤 Enviando email...');
    const result = await sgMail.send(msg);

    console.log('');
    console.log('✅ ¡EMAIL ENVIADO EXITOSAMENTE!');
    console.log('====================================');
    console.log('Status Code:', result[0]?.statusCode);
    console.log('Headers:', JSON.stringify(result[0]?.headers, null, 2));

    if (result[0]?.statusCode === 202) {
      console.log('');
      console.log('🎉 ¡ÉXITO TOTAL! El email fue aceptado por SendGrid.');
      console.log('📬 Revisa la bandeja de entrada de baez.israel@gmail.com');
      console.log('');
      console.log('✅ El sistema de envío de emails está funcionando correctamente.');
      console.log('✅ La funcionalidad de "Forgot Password" debería funcionar sin problemas.');
      console.log('');
      console.log('📊 SendGrid es más confiable que Gmail SMTP y no tiene restricciones.');
    }

  } catch (error) {
    console.log('');
    console.log('❌ ERROR AL ENVIAR EMAIL');
    console.log('====================================');
    console.log('Error:', error.message);

    if (error.code === 401) {
      console.log('');
      console.log('🔐 ERROR DE AUTENTICACIÓN: API Key inválida');
      console.log('Verifica que la API Key en .env.local sea correcta');
    } else if (error.code === 403) {
      console.log('');
      console.log('🚫 ACCESO DENEGADO: Verifica la verificación de email/dominio en SendGrid');
    } else {
      console.log('');
      console.log('❓ ERROR DESCONOCIDO: Revisa la configuración de SendGrid');
    }

    console.log('');
    console.log('💡 VERIFICA TU CONFIGURACIÓN EN SENDGRID:');
    console.log('1. Ve a https://app.sendgrid.com/settings/sender_auth');
    console.log('2. Verifica que lotecom@gmail.com esté verificado');
    console.log('3. Ve a https://app.sendgrid.com/settings/api_keys');
    console.log('4. Verifica que la API Key tenga permisos de envío');
  }
}

// Ejecutar la prueba
enviarEmailPruebaSendGrid();