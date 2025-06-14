const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

/**
 * ExcelFilter class handles filtering Excel files based on column criteria and matches
 */
class ExcelFilter {
  /**
   * @param {string|Object} config - Path to config file or config object
   */
  constructor(config) {
    this.config = typeof config === 'string' ? this.loadConfig(config) : config;
    this.validateConfig();
    this.createOutputDir();
  }

  /**
   * Loads and parses the configuration file
   * @param {string} configPath - Path to the configuration file
   * @returns {Object} Parsed configuration
   */
  loadConfig(configPath) {
    try {
      const configFile = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configFile);
    } catch (error) {
      throw new Error(`Error loading configuration: ${error.message}`);
    }
  }

  /**
   * Validates that all required configuration fields are present
   */
  validateConfig() {
    const requiredFields = ['inputFile', 'sheetName', 'filters'];
    const missingFields = requiredFields.filter(field => !this.config[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required configuration fields: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Creates the output directory if it doesn't exist
   */
  createOutputDir() {
    const outputDir = path.dirname(this.config.outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
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

      // Filter rows
      const filteredRows = rows.filter(row => this.applyFilters(row, headers));
      console.log(`✅ Filtered to ${filteredRows.length} rows`);

      // Create new workbook with filtered data
      const newWorkbook = new ExcelJS.Workbook();
      const worksheet = newWorkbook.addWorksheet('Data');
      
      // Add headers
      worksheet.addRow(headers);
      
      // Add filtered rows
      filteredRows.forEach(row => {
        worksheet.addRow(this.cleanRow(row));
      });

      // Save the filtered workbook
      await newWorkbook.xlsx.writeFile(this.config.outputFile);
      console.log(`✨ Saved filtered data to: ${this.config.outputFile}`);

      return true;
    } catch (error) {
      console.error('❌ Error:', error.message);
      return false;
    }
  }

  /**
   * Applies all filters to a row
   * @param {Array} row - Data row
   * @param {Array} headers - Column headers
   * @returns {boolean} True if row passes all filters
   */
  applyFilters(row, headers) {
    return this.config.filters.every(filter => {
      const columnIndex = headers.indexOf(filter.column);
      if (columnIndex === -1) {
        console.warn(`Warning: Column "${filter.column}" not found in headers`);
        return true;
      }

      const value = row[columnIndex];
      switch (filter.operator) {
        case 'equals':
          return value === filter.value;
        case 'contains':
          return String(value).includes(String(filter.value));
        case 'greaterThan':
          return Number(value) > Number(filter.value);
        case 'lessThan':
          return Number(value) < Number(filter.value);
        default:
          console.warn(`Warning: Unknown operator "${filter.operator}"`);
          return true;
      }
    });
  }

  /**
   * Cleans a row by removing empty cells and converting to proper types
   * @param {Array} row - Data row
   * @returns {Array} Cleaned row
   */
  cleanRow(row) {
    return row.map(cell => {
      if (cell === null || cell === undefined) return '';
      if (typeof cell === 'string') return cell.trim();
      return cell;
    });
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
      describe: 'Path to filter config file',
      type: 'string',
      default: 'filter-config.json'
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
    .option('output', {
      alias: 'o',
      describe: 'Output file',
      type: 'string'
    })
    .help()
    .argv;

  const filter = new ExcelFilter(argv.config);

  // Override config with command line arguments if provided
  if (argv.input) filter.config.inputFile = argv.input;
  if (argv.sheet) filter.config.sheetName = argv.sheet;
  if (argv.output) filter.config.outputFile = argv.output;

  filter.processExcel().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = ExcelFilter; 