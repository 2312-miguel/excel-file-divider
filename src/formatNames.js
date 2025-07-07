#!/usr/bin/env node
// Script para formatear nombres y apellidos desde un archivo Excel
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Utilidad para parsear argumentos CLI
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].replace(/^--/, '');
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      result[key] = value;
      if (value !== true) i++;
    }
  }
  return result;
}

// Leer configuración desde archivo JSON
function readConfig(configPath) {
  try {
    const configRaw = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configRaw);
  } catch (e) {
    return {};
  }
}

// Lógica para separar nombres y apellidos
function splitName(fullName) {
  if (!fullName || typeof fullName !== 'string') return { nombres: '', apellido1: '', apellido2: '' };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { nombres: parts[0], apellido1: '', apellido2: '' };
  } else if (parts.length === 2) {
    return { nombres: parts[0], apellido1: parts[1], apellido2: '' };
  } else {
    return {
      nombres: parts.slice(0, parts.length - 2).join(' '),
      apellido1: parts[parts.length - 2],
      apellido2: parts[parts.length - 1],
    };
  }
}

// Eliminar duplicados por columna
function dedupeByColumn(data, column) {
  const seen = new Set();
  return data.filter(row => {
    const val = row[column];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}

// Convertir letra de columna a índice (A=0, B=1, etc.)
function columnLetterToIndex(letter) {
  let result = 0;
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + letter.charCodeAt(i) - 64;
  }
  return result - 1;
}

// Convertir índice a letra de columna (0=A, 1=B, etc.)
function columnIndexToLetter(index) {
  let result = '';
  while (index >= 0) {
    result = String.fromCharCode(65 + (index % 26)) + result;
    index = Math.floor(index / 26) - 1;
  }
  return result;
}

// Formatear número con separadores de miles
function formatNumberWithThousands(value) {
  if (!value) return '';
  
  // Convertir a string y limpiar caracteres no numéricos
  const cleanValue = String(value).replace(/[^\d]/g, '');
  
  if (!cleanValue) return value; // Si no hay números, devolver el valor original
  
  // Convertir a número y formatear con puntos
  const number = parseInt(cleanValue, 10);
  return number.toLocaleString('es-ES'); // Usa formato español (puntos para miles)
}

// Concatenar dos columnas con formato específico (por nombre o posición)
function concatenateColumns(data, column1, column2, newColumnName) {
  return data.map(row => {
    let val1, val2;
    
    // Si son letras de columna (A, B, C...), obtener por posición
    if (typeof column1 === 'string' && /^[A-Z]+$/i.test(column1)) {
      const index1 = columnLetterToIndex(column1.toUpperCase());
      val1 = Object.values(row)[index1] || '';
    } else {
      val1 = row[column1] || '';
    }
    
    if (typeof column2 === 'string' && /^[A-Z]+$/i.test(column2)) {
      const index2 = columnLetterToIndex(column2.toUpperCase());
      val2 = Object.values(row)[index2] || '';
    } else {
      val2 = row[column2] || '';
    }
    
    // Formatear el segundo valor con separadores de miles
    const formattedVal2 = formatNumberWithThousands(val2);
    
    return {
      ...row,
      [newColumnName]: `${val1} (${formattedVal2})`
    };
  });
}

// Asegurar que el directorio de salida existe
function ensureOutputDirectory(outputPath) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function main() {
  // 1. Leer argumentos y config
  const args = parseArgs();
  const configPath = args.config || path.join(__dirname, '../config/format-names-config.json');
  const config = readConfig(configPath);

  // 2. Prioridad: argumentos CLI > config file
  const input = args.input || config.input;
  const sheet = args.sheet || config.sheet;
  const column = args.column || config.column;
  const output = args.output || config.output;
  const dedupeBy = args['dedupe-by'] || config.dedupeBy;
  const concatColumn1 = args['concat-column1'] || config.concatColumn1;
  const concatColumn2 = args['concat-column2'] || config.concatColumn2;
  const concatNewColumn = args['concat-new-column'] || config.concatNewColumn;

  if (!input || !sheet || !column || !output) {
    console.error('Faltan parámetros requeridos. Debes especificar input, sheet, column y output (por CLI o config).');
    process.exit(1);
  }

  // 3. Leer Excel
  if (!fs.existsSync(input)) {
    console.error(`El archivo de entrada no existe: ${input}`);
    process.exit(1);
  }
  const workbook = XLSX.readFile(input);
  if (!workbook.Sheets[sheet]) {
    console.error(`La hoja '${sheet}' no existe en el archivo.`);
    process.exit(1);
  }
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

  // 4. Procesar y separar nombres
  let formatted = data.map(row => {
    const split = splitName(row[column]);
    return {
      ...row,
      NOMBRES: split.nombres,
      APELLIDO_1: split.apellido1,
      APELLIDO_2: split.apellido2,
    };
  });
  
  // Concatenar columnas si se especifica
  if (concatColumn1 && concatColumn2 && concatNewColumn) {
    formatted = concatenateColumns(formatted, concatColumn1, concatColumn2, concatNewColumn);
    console.log(`Columnas concatenadas: ${concatColumn1} + ${concatColumn2} → ${concatNewColumn}`);
  }
  
  // Eliminar duplicados si se especifica
  if (dedupeBy) {
    formatted = dedupeByColumn(formatted, dedupeBy);
    console.log(`Filas duplicadas eliminadas por la columna: ${dedupeBy}`);
  }

  // 5. Guardar nuevo Excel
  ensureOutputDirectory(output);
  const newSheet = XLSX.utils.json_to_sheet(formatted);
  const newWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheet);
  XLSX.writeFile(newWorkbook, output);
  console.log(`Archivo formateado guardado en: ${output}`);
}

if (require.main === module) {
  main();
} 