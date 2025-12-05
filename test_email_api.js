// Script para probar el envío de emails usando la API route de Next.js
// Esto simula cómo funcionará el sistema de reset de contraseña

const fetch = require('node-fetch');

async function testEmailAPI() {
  console.log('🚀 PRUEBA DE API DE ENVÍO DE EMAIL - GEMODIDA');
  console.log('===============================================');
  console.log('');
  console.log('📋 DETALLES DE LA PRUEBA:');
  console.log('Origen: lotecom@gmail.com (desde .env.local)');
  console.log('Destino: baez.israel@gmail.com');
  console.log('Asunto: Prueba');
  console.log('Mensaje: Esto es una prueba de GEMODIDA');
  console.log('');
  console.log('🔧 MÉTODO: Usando la API route /api/send-reset-email');
  console.log('📡 Endpoint: http://localhost:3003/api/send-reset-email');
  console.log('');

  try {
    // Datos del email de prueba
    const emailData = {
      token: '123456', // Token de prueba
      userEmail: 'baez.israel@gmail.com',
      userName: 'Usuario de Prueba'
    };

    console.log('📤 Enviando solicitud a la API...');

    // Hacer la petición a la API route
    const response = await fetch('http://localhost:3003/api/send-reset-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const result = await response.json();

    console.log('');
    if (response.ok) {
      console.log('✅ ¡API RESPONDIÓ EXITOSAMENTE!');
      console.log('====================================');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(result, null, 2));

      if (result.success) {
        console.log('');
        console.log('🎉 ¡ÉXITO TOTAL! El email fue enviado correctamente.');
        console.log('📬 Revisa la bandeja de entrada de baez.israel@gmail.com');
        console.log('');
        console.log('✅ El sistema de envío de emails está funcionando correctamente.');
        console.log('✅ La funcionalidad de "Forgot Password" debería funcionar sin problemas.');
      } else {
        console.log('');
        console.log('⚠️ API respondió pero con error:');
        console.log('Error:', result.error);
      }
    } else {
      console.log('❌ ERROR EN LA API');
      console.log('====================================');
      console.log('Status:', response.status);
      console.log('Error:', result.error || 'Error desconocido');
      console.log('');
      console.log('💡 POSIBLES CAUSAS:');
      console.log('1. El servidor de desarrollo no está ejecutándose');
      console.log('2. Problemas de configuración de email');
      console.log('3. Variables de entorno no configuradas correctamente');
      console.log('');
      console.log('🔧 SOLUCIÓN: Ejecuta "npm run dev" primero');
    }

  } catch (error) {
    console.log('');
    console.log('❌ ERROR DE CONEXIÓN');
    console.log('====================================');
    console.log('Error:', error.message);
    console.log('');
    console.log('💡 POSIBLES CAUSAS:');
    console.log('1. El servidor de desarrollo no está ejecutándose en http://localhost:3003');
    console.log('2. Problemas de red o firewall');
    console.log('');
    console.log('🔧 SOLUCIÓN: Ejecuta "npm run dev" en otra terminal');
  }
}

// Verificar si el servidor está ejecutándose
async function checkServer() {
  try {
    console.log('🔍 Verificando si el servidor está ejecutándose...');
    const response = await fetch('http://localhost:3003/api/send-reset-email', {
      method: 'GET'
    });
    console.log('✅ Servidor detectado en http://localhost:3003');
    console.log('');
    return true;
  } catch (error) {
    console.log('❌ Servidor no detectado en http://localhost:3003');
    console.log('');
    console.log('💡 SOLUCIÓN: Ejecuta "npm run dev" en otra terminal');
    console.log('');
    return false;
  }
}

// Ejecutar la prueba
async function runTest() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testEmailAPI();
  }
}

runTest();