#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const ExcelFilter = require('../src/filter/excelFilter');

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
    describe: 'Path to filter configuration file',
    type: 'string',
    default: path.join(__dirname, '../config/filter-config.json')
  })
  .option('sheet', {
    alias: 's',
    describe: 'Sheet name to process',
    type: 'string',
    default: 'Hoja 1'
  })
  .option('output', {
    alias: 'o',
    describe: 'Output file path',
    type: 'string',
    default: path.join(__dirname, '../output/filtered.xlsx')
  })
  .help()
  .argv;

async function main() {
  try {
    // Create filter instance with configuration
    const filter = new ExcelFilter({
      inputFile: path.resolve(argv.input),
      sheetName: argv.sheet,
      outputFile: path.resolve(argv.output),
      filters: [] // Will be loaded from config file if provided
    });

    // If config file is provided, load it
    if (argv.config) {
      try {
        const configPath = path.resolve(argv.config);
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        if (config.filters) {
          filter.config.filters = config.filters;
        }
      } catch (error) {
        console.error(`Error loading config file: ${error.message}`);
        process.exit(1);
      }
    }

    // Process the Excel file
    const success = await filter.processExcel();
    if (!success) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main(); 