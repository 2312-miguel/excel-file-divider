const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

/**
 * ExcelToSql class handles converting Excel data to SQL statements with filtering
 */
class ExcelToSql {
  /**
   * Creates an instance of ExcelToSql
   * @param {string} configPath - Path to the configuration file (defaults to 'sql-config.json')
   */
  constructor(configPath = 'sql-config.json') {
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
   * Validates the configuration object
   * @throws {Error} If configuration is invalid
   */
  validateConfig() {
    const requiredFields = ['inputFile', 'sheetName', 'tableName', 'outputDir', 'sqlType'];
    const missingFields = requiredFields.filter(field => !this.config[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required configuration fields: ${missingFields.join(', ')}`);
    }

    if (this.config.sqlType === 'UPDATE' && !this.config.columnMapping) {
      throw new Error('Column mapping is required for UPDATE statements');
    }

    if (this.config.whereCondition) {
      if (!this.config.whereCondition.column || !this.config.whereCondition.excelColumns) {
        throw new Error('Invalid whereCondition configuration');
      }
    }
  }

  /**
   * Creates the output directory if it doesn't exist
   */
  createOutputDir() {
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
  }

  /**
   * Main process method to handle Excel to SQL conversion using streaming
   * @returns {Promise<boolean>} True if process succeeds, false otherwise
   */
  async processExcel() {
    try {
      console.log('📖 Reading Excel file (streaming)...');
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(this.config.inputFile);
      const worksheet = workbook.getWorksheet(this.config.sheetName);
      if (!worksheet) {
        throw new Error(`Sheet "${this.config.sheetName}" not found`);
      }

      // Prepare output SQL file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${this.config.tableName}_${this.config.sqlType.toLowerCase()}_${timestamp}.sql`;
      const filePath = path.join(this.config.outputDir, fileName);
      const sqlStream = fs.createWriteStream(filePath, { encoding: 'utf-8' });

      let headers = null;
      let rowCount = 0;

      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        const values = row.values.slice(1); // Remove first empty element
        if (rowNumber === 1) {
          headers = values;
        } else {
          if (!this.rowPassesFilter(headers, values)) return;
          const sql = this.generateSqlStatement(headers, values);
          sqlStream.write(sql + '\n\n');
          rowCount++;
        }
      });

      sqlStream.end();
      console.log(`✅ Saved SQL statements to: ${fileName} (${rowCount} statements)`);
      return true;
    } catch (error) {
      console.error('❌ Error:', error.message);
      return false;
    }
  }

  /**
   * Checks if a row passes all filters
   * @param {Array} headers - Header row from Excel file
   * @param {Array} row - Data row from Excel file
   * @returns {boolean} True if row passes all filters
   */
  rowPassesFilter(headers, row) {
    if (!this.config.filters || this.config.filters.length === 0) {
      return true;
    }
    return this.config.filters.every(filter => {
      const columnIndex = headers.indexOf(filter.column);
      if (columnIndex === -1) {
        throw new Error(`Column "${filter.column}" not found in headers`);
      }
      const cellValue = String(row[columnIndex] ?? '').toLowerCase();
      switch (filter.operator) {
        case 'equals':
          return cellValue === String(filter.value).toLowerCase();
        case 'contains':
          return cellValue.includes(String(filter.value).toLowerCase());
        case 'containsExclude':
          const requiredValue = String(filter.value).toLowerCase();
          const excludedValue = String(filter.exclude).toLowerCase();
          return cellValue.includes(requiredValue) && !cellValue.includes(excludedValue);
        case 'startsWith':
          return cellValue.startsWith(String(filter.value).toLowerCase());
        case 'endsWith':
          return cellValue.endsWith(String(filter.value).toLowerCase());
        case 'greaterThan':
          return Number(cellValue) > Number(filter.value);
        case 'lessThan':
          return Number(cellValue) < Number(filter.value);
        default:
          throw new Error(`Invalid operator: ${filter.operator}`);
      }
    });
  }

  /**
   * Generates a single SQL statement from a row
   * @param {Array} headers - Column headers
   * @param {Array} row - Data row
   * @returns {string} SQL statement
   */
  generateSqlStatement(headers, row) {
    const tableName = this.config.tableName;
    if (this.config.sqlType === 'UPDATE') {
      const setClauses = [];
      Object.entries(this.config.columnMapping).forEach(([excelColumn, sqlColumn]) => {
        const columnIndex = headers.indexOf(excelColumn);
        if (columnIndex === -1) {
          throw new Error(`Column "${excelColumn}" not found in headers`);
        }
        const value = this.formatSqlValue(row[columnIndex]);
        setClauses.push(`t.\`${sqlColumn}\` = ${value}`);
      });
      if (this.config.whereCondition) {
        const excelConcat = this.concatenateValues(headers, row, this.config.whereCondition.concatenation);
        return (
          `UPDATE ${tableName} t\n` +
          `SET ${setClauses.join(',\n    ')}\n` +
          `WHERE LOWER(t.\`${this.config.whereCondition.column}\`) LIKE LOWER(${this.formatSqlValue(excelConcat + '%')});`
        );
      } else {
        let sqlStatement = `UPDATE ${tableName} t\nSET ${setClauses.join(',\n    ')}`;
        if (this.config.whereColumn) {
          const whereColumnIndex = headers.indexOf(this.config.whereColumn);
          if (whereColumnIndex === -1) {
            throw new Error(`Where column "${this.config.whereColumn}" not found in headers`);
          }
          const whereValue = this.formatSqlValue(row[whereColumnIndex]);
          sqlStatement += `\nWHERE t.\`${this.config.whereColumn}\` = ${whereValue}`;
        }
        sqlStatement += ';';
        return sqlStatement;
      }
    } else {
      // INSERT
      const columnNames = headers.map(header => `\`${header}\``).join(', ');
      const values = row.map(value => this.formatSqlValue(value)).join(', ');
      return `INSERT INTO ${tableName} (${columnNames}) VALUES (${values});`;
    }
  }

  /**
   * Formats a value for SQL
   * @param {any} value - Value to format
   * @returns {string} Formatted value
   */
  formatSqlValue(value) {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    }
    return value;
  }

  /**
   * Concatenates values from a row based on configuration
   * @param {Array} headers - Column headers
   * @param {Array} row - Data row
   * @param {Object} concatConfig - Concatenation configuration
   * @returns {string} Concatenated value
   */
  concatenateValues(headers, row, concatConfig) {
    const values = concatConfig.columns.map(column => {
      const index = headers.indexOf(column);
      if (index === -1) {
        throw new Error(`Column "${column}" not found in headers`);
      }
      return String(row[index] || '').trim();
    }).filter(value => value !== '');

    return values.join(concatConfig.separator);
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
      describe: 'Path to SQL config file',
      type: 'string',
      default: 'sql-config.json'
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
    .option('table', {
      alias: 't',
      describe: 'Target table name',
      type: 'string'
    })
    .option('output', {
      alias: 'o',
      describe: 'Output directory',
      type: 'string'
    })
    .option('type', {
      alias: 'y',
      describe: 'SQL statement type (INSERT or UPDATE)',
      type: 'string',
      choices: ['INSERT', 'UPDATE']
    })
    .help()
    .argv;

  const converter = new ExcelToSql(argv.config);

  // Override config with command line arguments if provided
  if (argv.input) converter.config.inputFile = argv.input;
  if (argv.sheet) converter.config.sheetName = argv.sheet;
  if (argv.table) converter.config.tableName = argv.table;
  if (argv.output) converter.config.outputDir = argv.output;
  if (argv.type) converter.config.sqlType = argv.type;

  converter.processExcel().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = ExcelToSql; 