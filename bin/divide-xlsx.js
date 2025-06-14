#!/usr/bin/env node

const path = require('path');
const ExcelDivider = require('../src/divider/excelDivider');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
  .option('config', {
    alias: 'c',
    description: 'Path to config file',
    type: 'string',
    default: path.join(__dirname, '../config/config.json')
  })
  .option('input', {
    alias: 'i',
    description: 'Input Excel file',
    type: 'string',
    demandOption: true
  })
  .option('sheet', {
    alias: 's',
    description: 'Sheet name',
    type: 'string',
    default: 'Hoja 1'
  })
  .option('rows', {
    alias: 'r',
    description: 'Number of rows per file',
    type: 'number',
    default: 1000
  })
  .option('output', {
    alias: 'o',
    description: 'Output directory',
    type: 'string',
    default: path.join(__dirname, '../output')
  })
  .help()
  .alias('help', 'h')
  .argv;

async function main() {
  try {
    const config = require(path.resolve(argv.config));
    const divider = new ExcelDivider(config);

    // Override config with command line arguments if provided
    if (argv.input) divider.config.inputFile = path.resolve(argv.input);
    if (argv.sheet) divider.config.sheetName = argv.sheet;
    if (argv.rows) divider.config.rowsPerFile = argv.rows;
    if (argv.output) divider.config.outputDir = path.resolve(argv.output);

    await divider.processExcel();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main(); 