const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const readline = require('readline');

/**
 * Creates a directory if it doesn't exist
 * @param {string} dirPath - Path to create
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Reads a CSV file as a stream and builds a map
 * @param {string} filePath - Path to CSV file
 * @param {string} keyField - Field to use as key
 * @param {string} valueField - Field to use as value
 * @param {Function} keyTransform - Optional function to transform key
 * @returns {Promise<Map>} Map of key-value pairs
 */
async function readCSVMap(filePath, keyField, valueField, keyTransform = (k) => k) {
  return new Promise((resolve, reject) => {
    const map = new Map();
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity
    });
    let headers = [];
    rl.on('line', (line) => {
      if (!headers.length) {
        headers = line.replace(/"/g, '').split(',');
      } else {
        const values = line.replace(/"/g, '').split(',');
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = values[index];
        });
        if (obj[keyField]) {
          map.set(keyTransform(obj[keyField]), obj[valueField]);
        }
      }
    });
    rl.on('close', () => resolve(map));
    rl.on('error', reject);
  });
}

/**
 * Reads an Excel file as a stream and builds a map
 * @param {string} filePath - Path to Excel file
 * @param {Array<string>} nameFields - Fields to use for name construction
 * @param {string} valueField - Field to use as value
 * @param {Function} keyTransform - Optional function to transform key
 * @returns {Promise<Map>} Map of key-value pairs
 */
async function readExcelMap(filePath, nameFields, valueField, keyTransform = (k) => k) {
  const map = new Map();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  let headers = null;
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const values = row.values.slice(1);
    if (rowNumber === 1) {
      headers = values;
    } else {
      const obj = {};
      headers.forEach((header, idx) => {
        obj[header] = values[idx];
      });
      if (nameFields.every(field => obj[field])) {
        const key = keyTransform(nameFields.map(field => obj[field]).join(' '));
        map.set(key, obj[valueField]);
      }
    }
  });
  return map;
}

/**
 * Formats a value for SQL
 * @param {any} value - Value to format
 * @returns {string} Formatted value
 */
function formatSqlValue(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''")}'`;
  }
  return value;
}

module.exports = {
  ensureDirectoryExists,
  readCSVMap,
  readExcelMap,
  formatSqlValue
}; 