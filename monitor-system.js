#!/usr/bin/env node

/**
 * Script de monitoreo del sistema GEMODIDA
 * Utiliza temporizadores para verificar procesos y evitar desbordamientos
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuración de temporizadores
const MONITOR_INTERVAL = 30000; // 30 segundos
const HEALTH_CHECK_TIMEOUT = 10000; // 10 segundos
const BUILD_TIMEOUT = 120000; // 2 minutos
const MAX_RETRIES = 3;

// Estado del sistema
let systemStatus = {
  lastCheck: new Date(),
  serverRunning: false,
  buildStatus: 'unknown',
  memoryUsage: 0,
  errors: [],
  retries: 0
};

/**
 * Función para ejecutar comandos con timeout
 */
function executeWithTimeout(command, timeout = HEALTH_CHECK_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const child = exec(command, { timeout }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

/**
 * Verificar si el servidor está ejecutándose
 */
async function checkServerStatus() {
  try {
    // Verificar si el puerto 3003 está en uso
    await executeWithTimeout('netstat -ano | findstr :3003', 5000);
    systemStatus.serverRunning = true;
    console.log('✅ Servidor ejecutándose en puerto 3003');
  } catch (error) {
    systemStatus.serverRunning = false;
    console.log('❌ Servidor no detectado en puerto 3003');
  }
}

/**
 * Verificar uso de memoria
 */
function checkMemoryUsage() {
  const memUsage = process.memoryUsage();
  systemStatus.memoryUsage = Math.round(memUsage.heapUsed / 1024 / 1024); // MB
  console.log(`📊 Uso de memoria: ${systemStatus.memoryUsage} MB`);
}

/**
 * Verificar estado del build
 */
async function checkBuildStatus() {
  try {
    const projectRoot = path.join(__dirname, '..');
    const buildStart = Date.now();

    // Timeout para el build
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Build timeout')), BUILD_TIMEOUT);
    });

    const buildPromise = executeWithTimeout('npm run build', BUILD_TIMEOUT);

    await Promise.race([buildPromise, timeoutPromise]);

    const buildTime = Date.now() - buildStart;
    systemStatus.buildStatus = 'success';
    console.log(`✅ Build exitoso en ${Math.round(buildTime/1000)}s`);
    systemStatus.retries = 0; // Reset retries on success

  } catch (error) {
    systemStatus.buildStatus = 'failed';
    systemStatus.errors.push(`Build failed: ${error.message}`);
    console.log(`❌ Build falló: ${error.message}`);

    // Reintentar con backoff exponencial
    if (systemStatus.retries < MAX_RETRIES) {
      systemStatus.retries++;
      const delay = Math.pow(2, systemStatus.retries) * 1000; // Backoff exponencial
      console.log(`🔄 Reintentando build en ${delay/1000}s (intento ${systemStatus.retries}/${MAX_RETRIES})`);
      setTimeout(checkBuildStatus, delay);
    }
  }
}

/**
 * Limpiar errores antiguos
 */
function cleanupOldErrors() {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  systemStatus.errors = systemStatus.errors.filter(error => {
    // Mantener errores de la última hora
    return true; // Por simplicidad, mantener todos por ahora
  });
}

/**
 * Función principal de monitoreo
 */
async function monitorSystem() {
  console.log(`\n🔍 [${new Date().toISOString()}] Iniciando verificación del sistema...`);

  try {
    // Verificar estado del servidor
    await checkServerStatus();

    // Verificar uso de memoria
    checkMemoryUsage();

    // Limpiar errores antiguos
    cleanupOldErrors();

    // Verificar build cada 5 minutos (cada 10 ciclos)
    if (Date.now() - systemStatus.lastCheck.getTime() > 5 * 60 * 1000) {
      console.log('🔨 Verificando estado del build...');
      await checkBuildStatus();
      systemStatus.lastCheck = new Date();
    }

    // Reporte de estado
    console.log(`📈 Estado del sistema:
  - Servidor: ${systemStatus.serverRunning ? '✅ Activo' : '❌ Inactivo'}
  - Build: ${systemStatus.buildStatus === 'success' ? '✅ OK' : systemStatus.buildStatus === 'failed' ? '❌ Error' : '⏳ Desconocido'}
  - Memoria: ${systemStatus.memoryUsage} MB
  - Errores: ${systemStatus.errors.length}
  - Retries: ${systemStatus.retries}/${MAX_RETRIES}`);

    // Alertas críticas
    if (systemStatus.errors.length > 5) {
      console.log('🚨 ALERTA: Múltiples errores detectados!');
    }

    if (systemStatus.memoryUsage > 500) {
      console.log('🚨 ALERTA: Alto uso de memoria detectado!');
    }

  } catch (error) {
    console.error('❌ Error en monitoreo:', error.message);
    systemStatus.errors.push(`Monitor error: ${error.message}`);
  }
}

/**
 * Función de limpieza para cerrar procesos
 */
function cleanup() {
  console.log('\n🧹 Limpiando procesos de monitoreo...');
  process.exit(0);
}

// Manejo de señales para limpieza
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Iniciar monitoreo continuo
console.log('🚀 Iniciando sistema de monitoreo GEMODIDA...');
console.log(`⏰ Intervalo de monitoreo: ${MONITOR_INTERVAL/1000}s`);
console.log(`⏱️  Timeout de operaciones: ${HEALTH_CHECK_TIMEOUT/1000}s`);
console.log(`🔨 Timeout de builds: ${BUILD_TIMEOUT/1000}s`);

// Verificación inicial
monitorSystem();

// Monitoreo continuo
setInterval(monitorSystem, MONITOR_INTERVAL);

// Verificación inicial del build
setTimeout(() => {
  console.log('🔨 Ejecutando verificación inicial del build...');
  checkBuildStatus();
}, 2000);