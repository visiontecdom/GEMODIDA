const fetch = require('node-fetch');
require('dotenv').config({ path: './.env.local' });

async function testSendResetEmailAPI() {
  console.log('🚀 PRUEBA DE API ROUTE: /api/send-reset-email');
  console.log('===============================================\n');

  const currentProvider = process.env.EMAIL_PROVIDER || 'smtp';
  console.log(`📧 PROVEEDOR CONFIGURADO: ${currentProvider.toUpperCase()}\n`);

  const testData = {
    token: '123456',
    userEmail: 'baez.israel@gmail.com',
    userName: 'Israel Báez'
  };

  console.log('📋 DATOS DE PRUEBA:');
  console.log(`Token: ${testData.token}`);
  console.log(`Email: ${testData.userEmail}`);
  console.log(`Nombre: ${testData.userName}\n`);

  try {
    console.log('📤 ENVIANDO PETICIÓN A LA API...');

    const response = await fetch('http://localhost:3003/api/send-reset-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    console.log(`📊 ESTADO HTTP: ${response.status}`);
    console.log('📋 RESPUESTA:');
    console.log(JSON.stringify(result, null, 2));

    if (response.ok && result.success) {
      console.log('\n✅ PRUEBA EXITOSA: Email enviado correctamente');
      console.log(`🔧 Proveedor usado: ${result.provider || currentProvider}`);
    } else {
      console.log('\n❌ PRUEBA FALLIDA: Error en el envío');
      console.log(`🔧 Proveedor: ${result.provider || currentProvider}`);
      console.log(`📝 Error: ${result.details || result.error}`);
    }

  } catch (error) {
    console.error('\n❌ ERROR DE CONEXIÓN:');
    console.error(error.message);
    console.log('\n💡 ASEGÚRATE DE QUE:');
    console.log('   • El servidor Next.js esté ejecutándose (npm run dev)');
    console.log('   • Las variables de entorno estén configuradas correctamente');
    console.log('   • El proveedor de email esté configurado (SMTP, Gmail OAuth2, o SendGrid)');
  }
}

// Ejecutar la prueba
testSendResetEmailAPI();