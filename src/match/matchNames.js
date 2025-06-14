const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const readline = require('readline');
const { Transform } = require('stream');

/**
 * Class for matching names between contracts and Excel files
 */
class MatchNames {
  /**
   * @param {Object} config - Configuration object
   */
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.createOutputDir();
  }

  /**
   * Validates that all required configuration fields are present
   */
  validateConfig() {
    const requiredFields = ['contractsFile', 'excelFile', 'plansFile', 'outputFile'];
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
   * Main method to process the files
   * @returns {Promise<boolean>} Success status
   */
  async processFiles() {
    try {
      console.log('📖 Reading files...');
      
      // Read contracts file
      const contractsWorkbook = XLSX.readFile(this.config.contractsFile);
      const contractsSheet = contractsWorkbook.Sheets[contractsWorkbook.SheetNames[0]];
      const contracts = XLSX.utils.sheet_to_json(contractsSheet);
      console.log(`📄 Found ${contracts.length} contracts`);

      // Read Excel file
      const excelWorkbook = XLSX.readFile(this.config.excelFile);
      const excelSheet = excelWorkbook.Sheets[excelWorkbook.SheetNames[0]];
      const excelData = XLSX.utils.sheet_to_json(excelSheet);
      console.log(`📄 Found ${excelData.length} Excel records`);

      // Read plans file
      const plansWorkbook = XLSX.readFile(this.config.plansFile);
      const plansSheet = plansWorkbook.Sheets[plansWorkbook.SheetNames[0]];
      const plans = XLSX.utils.sheet_to_json(plansSheet);
      console.log(`📄 Found ${plans.length} plans`);

      // Process matches
      const matches = this.findMatches(contracts, excelData, plans);
      console.log(`✅ Found ${matches.length} matches`);

      // Generate SQL statements
      const statements = this.generateSqlStatements(matches);
      console.log(`✅ Generated ${statements.length} SQL statements`);

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
   * Finds matches between contracts, Excel data, and plans
   * @param {Array} contracts - Contract records
   * @param {Array} excelData - Excel records
   * @param {Array} plans - Plan records
   * @returns {Array} Matched records
   */
  findMatches(contracts, excelData, plans) {
    const matches = [];

    contracts.forEach(contract => {
      // Find matching Excel record
      const excelMatch = excelData.find(excel => 
        this.normalizeName(excel.nombre) === this.normalizeName(contract.nombre)
      );

      if (excelMatch) {
        // Find matching plan
        const planMatch = plans.find(plan => 
          this.normalizeName(plan.nombre) === this.normalizeName(contract.nombre)
        );

        if (planMatch) {
          matches.push({
            contract,
            excel: excelMatch,
            plan: planMatch
          });
        }
      }
    });

    return matches;
  }

  /**
   * Normalizes a name for comparison
   * @param {string} name - Name to normalize
   * @returns {string} Normalized name
   */
  normalizeName(name) {
    return String(name)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  /**
   * Generates SQL statements for the matches
   * @param {Array} matches - Matched records
   * @returns {Array} SQL statements
   */
  generateSqlStatements(matches) {
    return matches.map(match => {
      const { contract, excel, plan } = match;
      return `UPDATE contratos 
SET nombre_excel = '${this.escapeSql(excel.nombre)}',
    plan_id = ${plan.id}
WHERE id = ${contract.id};`;
    });
  }

  /**
   * Escapes a string for SQL
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  escapeSql(str) {
    return String(str).replace(/'/g, "''");
  }
}

module.exports = MatchNames; 