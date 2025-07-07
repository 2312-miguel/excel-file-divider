const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Columnas y su mapeo a campos del JSON
const columns = [
  { header: 'Identificacion', key: 'c_nit' },
  { header: 'Servicio', key: 'servicio' },
  { header: 'Serial ONU', key: 'serial_onu' },
  { header: 'Plan', key: 'plan' },
  { header: 'Mikrotik', key: 'server_configuration_id' },
  { header: 'Estado', key: 'estate' },
  { header: 'IP', key: 'ip' },
  { header: 'MAC', key: 'mac' },
  { header: 'Conexion', key: 'conexion' },
  { header: 'Interfaz', key: 'interfaz' },
  { header: 'Segmento', key: 'splitter' },
  { header: 'Nodo', key: 'nodo' },
  { header: 'Access Point', key: 'ap' },
  { header: 'Grupo de Corte', key: 'grupo_corte' },
  { header: 'Facturacion', key: 'facturacion' },
  { header: 'Descuento', key: 'descuento' },
  { header: 'Canal', key: 'canal' },
  { header: 'Oficina', key: 'oficina' },
  { header: 'Tecnologia', key: 'tecnologia' },
  { header: 'Fecha del Contrato', key: 'created_at' },
  { header: 'Cliente en Mikrotik', key: 'name_mk' },
  { header: 'Tipo Contrato', key: 'tipo_contrato' },
  { header: 'Profile', key: 'profile' },
  { header: 'Usuario', key: 'usuario' },
  { header: 'Contrasena', key: 'password' },
];

// Lee el archivo input.json
const inputPath = path.resolve(__dirname, '../input.json');
if (!fs.existsSync(inputPath)) {
  console.error('No se encontró input.json en la raíz del proyecto.');
  process.exit(1);
}
const jsonData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

if (!Array.isArray(jsonData)) {
  console.error('El archivo JSON debe contener un array de objetos.');
  process.exit(1);
}

// Prepara los datos para el Excel
const excelData = jsonData.map(obj => {
  const row = {};
  columns.forEach(col => {
    row[col.header] = obj[col.key] || '';
  });
  return row;
});

// Crea el libro y la hoja de Excel
const wb = xlsx.utils.book_new();
const ws = xlsx.utils.json_to_sheet(excelData, { header: columns.map(c => c.header) });
xlsx.utils.book_append_sheet(wb, ws, 'Datos');

// Asegura que la carpeta output/ existe
const outputDir = path.resolve(__dirname, '../output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Escribe el archivo Excel
const outputPath = path.resolve(outputDir, 'output.xlsx');
xlsx.writeFile(wb, outputPath);
console.log('Archivo Excel generado en:', outputPath); 