const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Tamaños de iconos necesarios para PWA
const iconSizes = [16, 32, 48, 72, 96, 128, 144, 152, 192, 384, 512];

// Función para crear directorios si no existen
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Ruta de la imagen de origen y directorios de destino
const sourceImage = path.join(__dirname, '../public/imgs/Logo_GEMODIDA.png');
const iconsDir = path.join(__dirname, '../public/icons');
const manifestDir = path.join(__dirname, '../public/manifest');

// Asegurarse de que los directorios existan
ensureDirectoryExists(iconsDir);
ensureDirectoryExists(manifestDir);

// Generar iconos en diferentes tamaños
async function generateIcons() {
  try {
    console.log('Generando iconos para PWA...');
    
    // Generar cada tamaño de icono
    const iconPromises = iconSizes.map(async (size) => {
      const outputFile = path.join(iconsDir, `icon-${size}x${size}.png`);
      
      await sharp(sourceImage)
        .resize(size, size)
        .toFile(outputFile);
      
      console.log(`Icono generado: ${outputFile}`);
    });

    // Generar favicon.ico (necesita un formato especial)
    const faviconOutput = path.join(__dirname, '../public/favicon.ico');
    await sharp(sourceImage)
      .resize(32, 32)
      .toFile(faviconOutput);
    console.log(`Favicon generado: ${faviconOutput}`);

    // Esperar a que todos los iconos se generen
    await Promise.all(iconPromises);
    
    console.log('¡Todos los iconos se han generado correctamente!');
  } catch (error) {
    console.error('Error al generar los iconos:', error);
    process.exit(1);
  }
}

// Ejecutar la generación de iconos
generateIcons();
