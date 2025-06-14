#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const MatchNames = require('../src/match/matchNames');

/**
 * Validates if a file exists
 * @param {string} filePath - Path to the file
 * @returns {boolean} True if file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const contractsFile = args.find(arg => arg.startsWith('--contracts='))?.split('=')[1];
    const excelFile = args.find(arg => arg.startsWith('--excel='))?.split('=')[1];
    const plansFile = args.find(arg => arg.startsWith('--plans='))?.split('=')[1];
    const outputFile = args.find(arg => arg.startsWith('--output='))?.split('=')[1];

    if (!contractsFile || !excelFile || !plansFile) {
      console.error('❌ Error: Missing required arguments');
      console.log('Usage: npm run match-names -- --contracts=<file> --excel=<file> --plans=<file> [--output=<file>]');
      process.exit(1);
    }

    // Resolve file paths
    const config = {
      contractsFile: path.resolve(process.cwd(), contractsFile),
      excelFile: path.resolve(process.cwd(), excelFile),
      plansFile: path.resolve(process.cwd(), plansFile),
      outputFile: outputFile ? path.resolve(process.cwd(), outputFile) : path.resolve(process.cwd(), 'output/matches.sql')
    };

    // Validate that all input files exist
    const missingFiles = [];
    if (!fileExists(config.contractsFile)) missingFiles.push(`Contracts file: ${config.contractsFile}`);
    if (!fileExists(config.excelFile)) missingFiles.push(`Excel file: ${config.excelFile}`);
    if (!fileExists(config.plansFile)) missingFiles.push(`Plans file: ${config.plansFile}`);

    if (missingFiles.length > 0) {
      console.error('❌ Error: The following files were not found:');
      missingFiles.forEach(file => console.error(`   - ${file}`));
      console.log('\nPlease make sure all files exist and the paths are correct.');
      process.exit(1);
    }

    // Create output directory if it doesn't exist
    const outputDir = path.dirname(config.outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('📁 Using the following files:');
    console.log(`   - Contracts: ${config.contractsFile}`);
    console.log(`   - Excel: ${config.excelFile}`);
    console.log(`   - Plans: ${config.plansFile}`);
    console.log(`   - Output: ${config.outputFile}\n`);

    // Create instance and process files
    const matcher = new MatchNames(config);
    const success = await matcher.processFiles();

    if (!success) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main(); 