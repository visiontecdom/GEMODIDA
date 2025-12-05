#!/usr/bin/env node

/**
 * Script de verificación de la nueva navegación
 * Verifica que todas las rutas y componentes estén correctamente implementados
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICACIÓN DEL SISTEMA DE NAVEGACIÓN\n');

// Verificar archivos principales
const checks = [
  {
    file: 'src/app/elegir-panel/page.tsx',
    description: 'Página Elegir Panel creada'
  },
  {
    file: 'src/app/page.tsx',
    description: 'Página principal restaurada'
  },
  {
    file: 'src/components/auth/AuthForm.tsx',
    description: 'AuthForm modificado para redirigir a elegir-panel'
  },
  {
    file: 'src/app/(dashboard)/admin-general/page.tsx',
    description: 'Panel admin-general creado'
  }
];

let allGood = true;

checks.forEach(check => {
  const filePath = path.join(__dirname, check.file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${check.description}`);
  } else {
    console.log(`❌ ${check.description} - ARCHIVO NO ENCONTRADO`);
    allGood = false;
  }
});

// Verificar rutas de paneles
console.log('\n📂 VERIFICACIÓN DE RUTAS DE PANELES:');
const panelChecks = [
  { name: 'monitoreo-gerencia', path: 'src/app/(dashboard)/monitoreo-gerencia' },
  { name: 'monitoreo-operaciones', path: 'src/app/(dashboard)/monitoreo-operaciones' },
  { name: 'monitoreo-encuestas', path: 'src/app/(dashboard)/monitoreo-encuestas' },
  { name: 'promociones-gerencia', path: 'src/app/(dashboard)/promociones-gerencia' },
  { name: 'promociones-operaciones', path: 'src/app/(dashboard)/promociones-operaciones' },
  { name: 'admin-general', path: 'src/app/(dashboard)/admin-general' },
  { name: 'principal-dashboard', path: 'src/app/principal-dashboard' }
];

panelChecks.forEach(panel => {
  const panelPath = path.join(__dirname, panel.path);
  if (fs.existsSync(panelPath)) {
    console.log(`✅ Panel ${panel.name} existe`);
  } else {
    console.log(`❌ Panel ${panel.name} NO existe en ${panel.path}`);
    allGood = false;
  }
});

// Verificar contenido de archivos clave
console.log('\n📄 VERIFICACIÓN DE CONTENIDO:');

// Verificar que elegir-panel tenga la lógica de permisos
const elegirPanelPath = path.join(__dirname, 'src/app/elegir-panel/page.tsx');
if (fs.existsSync(elegirPanelPath)) {
  const content = fs.readFileSync(elegirPanelPath, 'utf8');
  if (content.includes('useRoleSystem') && content.includes('hasGroup')) {
    console.log('✅ Elegir-panel tiene lógica de permisos');
  } else {
    console.log('❌ Elegir-panel NO tiene lógica de permisos');
    allGood = false;
  }

  if (content.includes('SEGURIDAD Y DESARROLLO')) {
    console.log('✅ Nueva tarjeta de desarrollo agregada');
  } else {
    console.log('❌ Nueva tarjeta de desarrollo NO encontrada');
    allGood = false;
  }
}

// Verificar que la página principal tenga botones de login
const homePath = path.join(__dirname, 'src/app/page.tsx');
if (fs.existsSync(homePath)) {
  const content = fs.readFileSync(homePath, 'utf8');
  if (content.includes('Iniciar Sesión') && content.includes('Solicitar Acceso')) {
    console.log('✅ Página principal tiene botones de login');
  } else {
    console.log('❌ Página principal NO tiene botones de login');
    allGood = false;
  }

  if (!content.includes('GESTIÓN DE MONITOREO') || !content.includes('Selecciona el área de trabajo')) {
    console.log('✅ Tarjetas de selección movidas de página principal');
  } else {
    console.log('❌ Tarjetas de selección AÚN en página principal');
    allGood = false;
  }
}

// Verificar AuthForm redirige a elegir-panel
const authFormPath = path.join(__dirname, 'src/components/auth/AuthForm.tsx');
if (fs.existsSync(authFormPath)) {
  const content = fs.readFileSync(authFormPath, 'utf8');
  if (content.includes('/elegir-panel')) {
    console.log('✅ AuthForm redirige a elegir-panel');
  } else {
    console.log('❌ AuthForm NO redirige a elegir-panel');
    allGood = false;
  }
}

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 ¡TODOS LOS CAMBIOS IMPLEMENTADOS CORRECTAMENTE!');
  console.log('\n🚀 El sistema de navegación mejorado está listo para usar.');
  console.log('\n📋 PRUEBAS RECOMENDADAS:');
  console.log('1. Visitar http://localhost:3003');
  console.log('2. Verificar botones "Iniciar Sesión" y "Solicitar Acceso"');
  console.log('3. Iniciar sesión y verificar redirección a /elegir-panel');
  console.log('4. Verificar que solo se habiliten paneles según permisos del usuario');
} else {
  console.log('⚠️  ALGUNOS CAMBIOS NO SE IMPLEMENTARON CORRECTAMENTE');
  console.log('Revisa los errores arriba y corrige antes de continuar.');
}
console.log('='.repeat(50));