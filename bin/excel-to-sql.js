#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const ExcelToSql = require('../src/sql/excelToSql');

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 --input <file> [options]')
  .option('input', {
    alias: 'i',
    describe: 'Input Excel file',
    type: 'string',
    demandOption: true
  })
  .option('config', {
    alias: 'c',
    describe: 'Path to SQL configuration file',
    type: 'string',
    default: path.join(__dirname, '../config/sql-config.json')
  })
  .option('sheet', {
    alias: 's',
    describe: 'Sheet name to process',
    type: 'string',
    default: 'Hoja 1'
  })
  .option('table', {
    alias: 't',
    describe: 'Target table name',
    type: 'string',
    demandOption: true
  })
  .option('output', {
    alias: 'o',
    describe: 'Output SQL file path',
    type: 'string',
    default: path.join(__dirname, '../output/inserts.sql')
  })
  .option('type', {
    describe: 'SQL type (insert, update, merge)',
    type: 'string',
    choices: ['insert', 'update', 'merge'],
    default: 'insert'
  })
  .help()
  .argv;

async function main() {
  try {
    // Create converter instance with configuration
    const converter = new ExcelToSql({
      inputFile: path.resolve(argv.input),
      sheetName: argv.sheet,
      tableName: argv.table,
      outputFile: path.resolve(argv.output),
      sqlType: argv.type,
      columnMappings: [] // Will be loaded from config file if provided
    });

    // If config file is provided, load it
    if (argv.config) {
      try {
        const configPath = path.resolve(argv.config);
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        if (config.columnMappings) {
          converter.config.columnMappings = config.columnMappings;
        }
      } catch (error) {
        console.error(`Error loading config file: ${error.message}`);
        process.exit(1);
      }
    }

    // Process the Excel file
    const success = await converter.processExcel();
    if (!success) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main(); 