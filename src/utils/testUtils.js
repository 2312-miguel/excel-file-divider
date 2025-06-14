const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');

const execAsync = promisify(exec);

/**
 * Creates a temporary directory for testing
 * @param {string} [prefix='test-'] - Prefix for the directory name
 * @returns {Promise<string>} Path to the temporary directory
 */
async function createTempDir(prefix = 'test-') {
  const tempDir = path.join(process.cwd(), 'temp', `${prefix}${Date.now()}`);
  await fs.promises.mkdir(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Removes a temporary directory
 * @param {string} dir - Path to the directory
 * @returns {Promise<void>}
 */
async function removeTempDir(dir) {
  try {
    await fs.promises.rm(dir, { recursive: true, force: true });
  } catch (error) {
    console.error(`Failed to remove temp directory ${dir}:`, error);
  }
}

/**
 * Creates a test file
 * @param {string} dir - Directory to create the file in
 * @param {string} name - Name of the file
 * @param {string} content - Content of the file
 * @returns {Promise<string>} Path to the created file
 */
async function createTestFile(dir, name, content) {
  const filePath = path.join(dir, name);
  await fs.promises.writeFile(filePath, content, 'utf8');
  return filePath;
}

/**
 * Creates a test Excel file
 * @param {string} dir - Directory to create the file in
 * @param {string} name - Name of the file
 * @param {Array<Array<any>>} data - Data to write to the file
 * @returns {Promise<string>} Path to the created file
 */
async function createTestExcelFile(dir, name, data) {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');
  
  data.forEach(row => worksheet.addRow(row));
  
  const filePath = path.join(dir, name);
  await workbook.xlsx.writeFile(filePath);
  return filePath;
}

/**
 * Creates a test CSV file
 * @param {string} dir - Directory to create the file in
 * @param {string} name - Name of the file
 * @param {Array<Array<any>>} data - Data to write to the file
 * @returns {Promise<string>} Path to the created file
 */
async function createTestCsvFile(dir, name, data) {
  const content = data.map(row => row.join(',')).join('\n');
  return createTestFile(dir, name, content);
}

/**
 * Creates a test SQL file
 * @param {string} dir - Directory to create the file in
 * @param {string} name - Name of the file
 * @param {Array<string>} statements - SQL statements to write
 * @returns {Promise<string>} Path to the created file
 */
async function createTestSqlFile(dir, name, statements) {
  const content = statements.join('\n');
  return createTestFile(dir, name, content);
}

/**
 * Runs a command and returns its output
 * @param {string} command - Command to run
 * @param {Object} [options] - Command options
 * @returns {Promise<{stdout: string, stderr: string}>} Command output
 */
async function runCommand(command, options = {}) {
  try {
    return await execAsync(command, options);
  } catch (error) {
    return {
      stdout: error.stdout,
      stderr: error.stderr
    };
  }
}

/**
 * Waits for a file to exist
 * @param {string} filePath - Path to the file
 * @param {Object} [options] - Wait options
 * @returns {Promise<void>}
 */
async function waitForFile(filePath, options = {}) {
  const {
    timeout = 5000,
    interval = 100,
    message = `File ${filePath} not found within timeout`
  } = options;

  const start = Date.now();
  while (!fs.existsSync(filePath)) {
    if (Date.now() - start > timeout) {
      throw new Error(message);
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

/**
 * Compares two files
 * @param {string} file1 - Path to first file
 * @param {string} file2 - Path to second file
 * @returns {Promise<boolean>} True if files are equal
 */
async function compareFiles(file1, file2) {
  const [content1, content2] = await Promise.all([
    fs.promises.readFile(file1, 'utf8'),
    fs.promises.readFile(file2, 'utf8')
  ]);
  return content1 === content2;
}

/**
 * Compares two Excel files
 * @param {string} file1 - Path to first file
 * @param {string} file2 - Path to second file
 * @returns {Promise<boolean>} True if files are equal
 */
async function compareExcelFiles(file1, file2) {
  const ExcelJS = require('exceljs');
  const [workbook1, workbook2] = await Promise.all([
    ExcelJS.Workbook().xlsx.readFile(file1),
    ExcelJS.Workbook().xlsx.readFile(file2)
  ]);

  const worksheet1 = workbook1.worksheets[0];
  const worksheet2 = workbook2.worksheets[0];

  if (worksheet1.rowCount !== worksheet2.rowCount) {
    return false;
  }

  for (let i = 1; i <= worksheet1.rowCount; i++) {
    const row1 = worksheet1.getRow(i);
    const row2 = worksheet2.getRow(i);

    if (row1.cellCount !== row2.cellCount) {
      return false;
    }

    for (let j = 1; j <= row1.cellCount; j++) {
      const cell1 = row1.getCell(j);
      const cell2 = row2.getCell(j);

      if (cell1.value !== cell2.value) {
        return false;
      }
    }
  }

  return true;
}

module.exports = {
  createTempDir,
  removeTempDir,
  createTestFile,
  createTestExcelFile,
  createTestCsvFile,
  createTestSqlFile,
  runCommand,
  waitForFile,
  compareFiles,
  compareExcelFiles
}; 