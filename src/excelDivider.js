const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * ExcelDivider class handles the division of large Excel files into smaller parts
 * while maintaining data integrity and structure.
 */
class ExcelDivider {
  /**
   * Creates an instance of ExcelDivider
   * @param {string} configPath - Path to the configuration file (defaults to 'config.json')
   */
  constructor(configPath = 'config.json') {
    this.loadConfig(configPath);
    this.validateConfig();
    this.createOutputDir();
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
    const requiredFields = ['inputFile', 'sheetName', 'rowsPerFile', 'excludeColumns', 'itemColumnIndex'];
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
   * Main process method to handle Excel file division
   * @returns {boolean} True if process succeeds, false otherwise
   */
  processExcel() {
    try {
      console.log('📖 Reading Excel file...');
      const workbook = XLSX.readFile(this.config.inputFile);
      const sheet = workbook.Sheets[this.config.sheetName];

      if (!sheet) {
        throw new Error(`Sheet "${this.config.sheetName}" not found`);
      }

      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (data.length < 2) {
        throw new Error('Excel file is empty or has insufficient data');
      }

      console.log('🔍 Processing data...');
      const headers = data[0];
      const rows = data.slice(1);

      const cleanData = this.cleanData(headers, rows);
      this.saveFiles(cleanData);

      console.log('✨ Process completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Error:', error.message);
      return false;
    }
  }

  /**
   * Cleans and filters the data according to configuration
   * @param {Array} headers - Header row from Excel file
   * @param {Array} rows - Data rows from Excel file
   * @returns {Array} Cleaned data array including headers
   */
  cleanData(headers, rows) {
    // Sort exclude columns in descending order
    const sortedExcludeColumns = [...this.config.excludeColumns].sort((a, b) => b - a);

    // Clean headers by removing excluded columns
    const cleanHeaders = headers.filter((_, index) =>
      !sortedExcludeColumns.includes(index));

    // Clean and filter rows
    const cleanRows = rows
      .map(row => row.filter((_, index) => !sortedExcludeColumns.includes(index)))
      .filter(row => {
        const item = row[this.config.itemColumnIndex];
        return item !== undefined && item !== null && String(item).trim() !== '';
      });

    return [cleanHeaders, ...cleanRows];
  }

  /**
   * Saves the processed data into multiple Excel files
   * @param {Array} data - Cleaned data to be saved
   */
  saveFiles(data) {
    const headers = data[0];
    const rows = data.slice(1);
    const totalParts = Math.ceil(rows.length / this.config.rowsPerFile);

    console.log(`📁 Dividing into ${totalParts} files...`);

    for (let i = 0; i < totalParts; i++) {
      const start = i * this.config.rowsPerFile;
      const end = start + this.config.rowsPerFile;
      const part = [headers, ...rows.slice(start, end)];

      const sheet = XLSX.utils.aoa_to_sheet(part);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, 'Data');

      const fileName = `${this.config.sheetName}_part_${(i + 1).toString().padStart(3, '0')}.xlsx`;
      const filePath = path.join(this.outputDir, fileName);

      XLSX.writeFile(workbook, filePath);
      console.log(`✅ Saved: ${fileName}`);
    }
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

  divider.processExcel();
}

module.exports = ExcelDivider;
