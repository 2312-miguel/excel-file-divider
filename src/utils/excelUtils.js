const ExcelJS = require('exceljs');
const { ensureDirectoryExists } = require('./fileUtils');

/**
 * Gets the worksheet from a workbook
 * @param {ExcelJS.Workbook} workbook - Excel workbook
 * @param {string} sheetName - Name of the sheet to get
 * @returns {ExcelJS.Worksheet} The worksheet
 */
function getWorksheet(workbook, sheetName) {
  if (sheetName) {
    const worksheet = workbook.getWorksheet(sheetName);
    if (!worksheet) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }
    return worksheet;
  }
  return workbook.worksheets[0];
}

/**
 * Creates a new workbook with headers
 * @param {Array<string>} headers - Array of header names
 * @returns {ExcelJS.Workbook} New workbook with headers
 */
function createWorkbookWithHeaders(headers) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');
  worksheet.addRow(headers);
  return workbook;
}

/**
 * Saves a workbook to a file
 * @param {ExcelJS.Workbook} workbook - Workbook to save
 * @param {string} filePath - Path to save the file
 * @returns {Promise<void>}
 */
async function saveWorkbook(workbook, filePath) {
  ensureDirectoryExists(path.dirname(filePath));
  await workbook.xlsx.writeFile(filePath);
}

/**
 * Gets the column index for a header
 * @param {ExcelJS.Worksheet} worksheet - Worksheet to search
 * @param {string} headerName - Name of the header to find
 * @returns {number} Column index (1-based)
 */
function getColumnIndex(worksheet, headerName) {
  const headerRow = worksheet.getRow(1);
  for (let i = 1; i <= headerRow.cellCount; i++) {
    const cell = headerRow.getCell(i);
    if (cell.value === headerName) {
      return i;
    }
  }
  throw new Error(`Column "${headerName}" not found`);
}

/**
 * Gets the value of a cell
 * @param {ExcelJS.Cell} cell - Cell to get value from
 * @returns {any} Cell value
 */
function getCellValue(cell) {
  if (!cell) return null;
  return cell.value;
}

/**
 * Sets the value of a cell
 * @param {ExcelJS.Cell} cell - Cell to set value for
 * @param {any} value - Value to set
 */
function setCellValue(cell, value) {
  if (cell) {
    cell.value = value;
  }
}

module.exports = {
  getWorksheet,
  createWorkbookWithHeaders,
  saveWorkbook,
  getColumnIndex,
  getCellValue,
  setCellValue
}; 