const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

/**
 * ExcelToSql class handles converting Excel data to SQL statements with filtering
 */
class ExcelToSql {
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
    const requiredFields = ['inputFile', 'sheetName', 'tableName', 'outputFile'];
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

      // Generate SQL statements
      const statements = [];
      rows.forEach(row => {
        const statement = this.generateSqlStatement(headers, row);
        if (statement) {
          statements.push(statement);
        }
      });
      console.log(`✅ Generated ${statements.length} SQL statements`);

      // Create output directory if it doesn't exist
      const outputDir = path.dirname(this.config.outputFile);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Write to output file
      fs.writeFileSync(this.config.outputFile, statements.join('\n'));
      console.log(`✨ Saved SQL statements to: ${this.config.outputFile}`);

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
   * Generates a SQL statement for a single row
   * @param {Array} headers - Column headers
   * @param {Array} row - Data row
   * @returns {string} SQL statement
   */
  generateSqlStatement(headers, row) {
    try {
      // Create mapping from Excel headers to SQL columns
      const columnMappings = this.config.columnMappings || [];
      const values = {};
      
      headers.forEach((header, index) => {
        const mapping = columnMappings.find(m => m.excelColumn === header);
        if (mapping) {
          values[mapping.sqlColumn] = this.formatValue(row[index], mapping.type);
        } else {
          // If no mapping found, use header as is
          const columnName = header.toLowerCase().replace(/\s+/g, '_');
          values[columnName] = this.formatValue(row[index], 'string');
        }
      });

      // Generate statement based on SQL type
      switch (this.config.sqlType.toLowerCase()) {
        case 'insert':
          return this.generateInsert(values);
        case 'update':
          return this.generateUpdate(values);
        case 'merge':
          return this.generateMerge(values);
        default:
          return this.generateInsert(values);
      }
    } catch (error) {
      console.error('Error generating SQL statement:', error);
      return null;
    }
  }

  /**
   * Formats a value according to its SQL type
   * @param {*} value - Value to format
   * @param {string} type - SQL type
   * @returns {string} Formatted value
   */
  formatValue(value, type) {
    if (value === null || value === undefined) return 'NULL';
    
    switch (type.toLowerCase()) {
      case 'string':
        return `'${String(value).replace(/'/g, "''")}'`;
      case 'number':
        return Number(value);
      case 'date':
        return `'${new Date(value).toISOString().split('T')[0]}'`;
      default:
        return `'${String(value).replace(/'/g, "''")}'`;
    }
  }

  /**
   * Generates an INSERT statement
   * @param {Object} values - Column values
   * @returns {string} INSERT statement
   */
  generateInsert(values) {
    const columns = Object.keys(values).join(', ');
    const valueList = Object.values(values).join(', ');
    return `INSERT INTO ${this.config.tableName} (${columns}) VALUES (${valueList});`;
  }

  /**
   * Generates an UPDATE statement
   * @param {Object} values - Column values
   * @returns {string} UPDATE statement
   */
  generateUpdate(values) {
    const setClause = Object.entries(values)
      .filter(([column]) => column !== 'id')
      .map(([column, value]) => `${column} = ${value}`)
      .join(', ');
    return `UPDATE ${this.config.tableName} SET ${setClause} WHERE id = ${values.id};`;
  }

  /**
   * Generates a MERGE statement
   * @param {Object} values - Column values
   * @returns {string} MERGE statement
   */
  generateMerge(values) {
    const columns = Object.keys(values).join(', ');
    const valueList = Object.values(values).join(', ');
    const updateClause = Object.entries(values)
      .filter(([column]) => column !== 'id')
      .map(([column, value]) => `${column} = ${value}`)
      .join(', ');

    return `MERGE INTO ${this.config.tableName} AS target
USING (SELECT ${valueList} AS id) AS source
ON target.id = source.id
WHEN MATCHED THEN
  UPDATE SET ${updateClause}
WHEN NOT MATCHED THEN
  INSERT (${columns}) VALUES (${valueList});`;
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
  if (argv.output) converter.config.outputFile = argv.output;
  if (argv.type) converter.config.sqlType = argv.type;

  converter.processExcel().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = ExcelToSql; 