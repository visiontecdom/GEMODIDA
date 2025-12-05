const nodemailer = require('nodemailer');
require('dotenv').config({ path: './.env.local' });

console.log('🚀 PRUEBA DE ENVÍO DE EMAIL CON SMTP EMPRESARIAL');
console.log('===================================================\n');

// Verificar configuración SMTP
console.log('📋 CONFIGURACIÓN SMTP:');
console.log(`Host: ${process.env.SMTP_HOST || 'smtp.office365.com'}`);
console.log(`Puerto: ${process.env.SMTP_PORT || '587'}`);
console.log(`Usuario: ${process.env.SMTP_USER ? '✅ Configurado' : '❌ No configurado'}`);
console.log(`Contraseña: ${process.env.SMTP_PASS ? '✅ Configurada' : '❌ No configurada'}`);
console.log(`Email FROM: ${process.env.EMAIL_FROM || 'lotecom@gmail.com'}\n`);

async function enviarEmailPruebaSMTP() {
  console.log('📧 ENVIANDO EMAIL DE PRUEBA...');

  try {
    // Crear transporter SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.office365.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Configurar email de prueba
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'GEMODIDA Sistema',
        address: process.env.EMAIL_FROM || 'lotecom@gmail.com'
      },
      to: 'baez.israel@gmail.com',
      subject: 'Prueba SMTP Empresarial - GEMODIDA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Prueba de Email SMTP Empresarial</h2>
          <p>Este email fue enviado usando configuración SMTP empresarial.</p>
          <p><strong>Proveedor:</strong> ${process.env.SMTP_HOST || 'Microsoft 365/Office 365'}</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
          <br>
          <p>Si recibiste este email, la configuración SMTP funciona correctamente.</p>
        </div>
      `,
      text: `
        Prueba de Email SMTP Empresarial - GEMODIDA

        Este email fue enviado usando configuración SMTP empresarial.
        Proveedor: ${process.env.SMTP_HOST || 'Microsoft 365/Office 365'}
        Fecha: ${new Date().toLocaleString()}

        Si recibiste este email, la configuración SMTP funciona correctamente.
      `,
    };

    // Enviar email
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ EMAIL ENVIADO EXITOSAMENTE');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 Response: ${info.response}\n`);

    console.log('🎉 CONFIGURACIÓN SMTP FUNCIONANDO CORRECTAMENTE');
    console.log('💡 El sistema de "Forgot Password" ya puede usar esta configuración');

  } catch (error) {
    console.log('❌ ERROR AL ENVIAR EMAIL');
    console.log(`Error: ${error.message}\n`);

    console.log('🔧 POSIBLES SOLUCIONES:');
    console.log('1. Verifica que las credenciales SMTP sean correctas');
    console.log('2. Asegúrate de que la cuenta tenga permisos para enviar emails');
    console.log('3. Verifica que el firewall no bloquee el puerto SMTP');
    console.log('4. Para Microsoft 365: habilita autenticación SMTP en el portal de administración');
    console.log('5. Para Zoho: habilita acceso IMAP/SMTP en la configuración de la cuenta');

    console.log('\n📋 CONFIGURACIONES COMUNES:');

    console.log('\n🔹 Microsoft 365/Outlook:');
    console.log('   SMTP_HOST=smtp.office365.com');
    console.log('   SMTP_PORT=587');
    console.log('   SMTP_SECURE=false');

    console.log('\n🔹 Gmail (SMTP tradicional):');
    console.log('   SMTP_HOST=smtp.gmail.com');
    console.log('   SMTP_PORT=587');
    console.log('   SMTP_SECURE=false');

    console.log('\n🔹 Zoho Mail:');
    console.log('   SMTP_HOST=smtp.zoho.com');
    console.log('   SMTP_PORT=587');
    console.log('   SMTP_SECURE=false');

    console.log('\n🔹 ProtonMail:');
    console.log('   SMTP_HOST=smtp.protonmail.com');
    console.log('   SMTP_PORT=587');
    console.log('   SMTP_SECURE=false');
  }
}

// Verificar si las credenciales están configuradas
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.log('❌ CONFIGURACIÓN INCOMPLETA');
  console.log('Para usar SMTP empresarial, configura estas variables en .env.local:');
  console.log('');
  console.log('SMTP_HOST=smtp.office365.com  # o tu proveedor SMTP');
  console.log('SMTP_PORT=587');
  console.log('SMTP_SECURE=false');
  console.log('SMTP_USER=tu_email@empresa.com');
  console.log('SMTP_PASS=tu_password');
  console.log('');
  console.log('Ejemplos de proveedores:');
  console.log('• Microsoft 365: smtp.office365.com');
  console.log('• Gmail: smtp.gmail.com');
  console.log('• Zoho: smtp.zoho.com');
  console.log('• ProtonMail: smtp.protonmail.com');
} else {
  enviarEmailPruebaSMTP();
}