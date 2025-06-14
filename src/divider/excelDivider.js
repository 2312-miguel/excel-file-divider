const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { Transform } = require('stream');
const ExcelJS = require('exceljs');

/**
 * ExcelDivider class handles the division of large Excel files into smaller parts
 * while maintaining data integrity and structure.
 */
class ExcelDivider {
  /**
   * Creates an instance of ExcelDivider
   * @param {string|Object} config - Path to the configuration file or configuration object
   */
  constructor(config) {
    if (typeof config === 'string') {
      this.loadConfig(config);
    } else {
      this.config = config;
    }
    this.validateConfig();
    this.createOutputDir();
    this.currentPart = 1;
    this.rowsInCurrentPart = 0;
    this.currentWorkbook = null;
    this.rowCount = 0;
  }

  /**
   * Loads and parses the configuration file
   * @param {string} configPath - Path to the configuration file
   * @throws {Error} If configuration file cannot be loaded or parsed
   */
  loadConfig(configPath) {
    try {
      const configFile = fs.readFileSync(configPath, 'utf8');
      this.config = JSON.parse(configFile);
    } catch (error) {
      throw new Error(`Error loading configuration: ${error.message}`);
    }
  }

  /**
   * Validates that all required configuration fields are present
   * @throws {Error} If any required field is missing
   */
  validateConfig() {
    const requiredFields = ['inputFile', 'sheetName', 'rowsPerFile'];
    for (const field of requiredFields) {
      if (!(field in this.config)) {
        throw new Error(`Missing required configuration field: ${field}`);
      }
    }
  }

  /**
   * Creates the output directory if it doesn't exist
   */
  createOutputDir() {
    const outputDir = this.config.outputDir || 'output';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    this.outputDir = outputDir;
  }

  /**
   * Main method to process the Excel file
   * @returns {Promise<boolean>} Success status
   */
  async processExcel() {
    try {
      console.log('📖 Reading Excel file...');
      
      // Read the Excel file
      const workbook = XLSX.readFile(this.config.inputFile);
      const sheet = workbook.Sheets[this.config.sheetName];

      if (!sheet) {
        throw new Error(`Sheet "${this.config.sheetName}" not found`);
      }

      // Convert to JSON with headers
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      if (data.length < 2) {
        throw new Error('Excel file is empty or has insufficient data');
      }

      const headers = data[0];
      const rows = data.slice(1);
      console.log(`🔍 Processing ${rows.length} rows...`);

      // Process rows in batches
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        await this.processRow(row, headers);
        this.rowCount++;
        
        if (this.rowCount % 100 === 0 || this.rowCount === rows.length) {
          console.log(`Progress: ${this.rowCount}/${rows.length} rows processed`);
        }
      }

      // Save any remaining rows
      if (this.currentWorkbook) {
        await this.saveCurrentWorkbook();
      }

      console.log(`✨ Process completed successfully. Total rows: ${this.rowCount}`);
      return true;
    } catch (error) {
      console.error('❌ Error:', error.message);
      return false;
    }
  }

  /**
   * Processes a single row and writes it to the appropriate output file
   * @param {Array} row - Data row
   * @param {Array} headers - Column headers
   */
  async processRow(row, headers) {
    try {
      // Clean and filter the row
      const cleanRow = this.cleanRow(row);

      // Check if we need to start a new file
      if (this.rowsInCurrentPart >= this.config.rowsPerFile) {
        await this.saveCurrentWorkbook();
        this.currentPart++;
        this.rowsInCurrentPart = 0;
        this.currentWorkbook = null;
      }

      // Initialize new workbook if needed
      if (!this.currentWorkbook) {
        this.currentWorkbook = new ExcelJS.Workbook();
        const worksheet = this.currentWorkbook.addWorksheet('Data');
        worksheet.addRow(headers);
      }

      // Add the row
      this.currentWorkbook.getWorksheet('Data').addRow(cleanRow);
      this.rowsInCurrentPart++;
    } catch (error) {
      console.error('Error processing row:', error);
      throw error;
    }
  }

  /**
   * Saves the current workbook to a file
   */
  async saveCurrentWorkbook() {
    if (!this.currentWorkbook) return;

    const fileName = `${this.config.sheetName}_part_${this.currentPart.toString().padStart(3, '0')}.xlsx`;
    const filePath = path.join(this.outputDir, fileName);
    
    await this.currentWorkbook.xlsx.writeFile(filePath);
    console.log(`✅ Saved: ${fileName}`);
  }

  /**
   * Cleans and filters a single row according to configuration
   * @param {Array} row - Data row to clean
   * @returns {Array} Cleaned row
   */
  cleanRow(row) {
    // Sort exclude columns in descending order
    const sortedExcludeColumns = [...this.config.excludeColumns].sort((a, b) => b - a);

    // Clean row by removing excluded columns
    return row.filter((_, index) => !sortedExcludeColumns.includes(index));
  }
}

// Execute the program if run directly
if (require.main === module) {
  const yargs = require('yargs/yargs');
  const { hideBin } = require('yargs/helpers');

  const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .option('config', {
      alias: 'c',
      describe: 'Path to config file',
      type: 'string',
      default: 'config.json'
    })
    .option('input', {
      alias: 'i',
      describe: 'Input Excel file',
      type: 'string'
    })
    .option('sheet', {
      alias: 's',
      describe: 'Sheet name',
      type: 'string'
    })
    .option('rows', {
      alias: 'r',
      describe: 'Rows per file',
      type: 'number'
    })
    .option('output', {
      alias: 'o',
      describe: 'Output directory',
      type: 'string'
    })
    .help()
    .argv;

  const divider = new ExcelDivider(argv.config);

  // Override config with command line arguments if provided
  if (argv.input) divider.config.inputFile = argv.input;
  if (argv.sheet) divider.config.sheetName = argv.sheet;
  if (argv.rows) divider.config.rowsPerFile = argv.rows;
  if (argv.output) divider.config.outputDir = argv.output;

  divider.processExcel().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = ExcelDivider;
