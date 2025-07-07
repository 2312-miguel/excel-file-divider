#!/usr/bin/env node
// Ejecutable CLI para formatear nombres desde Excel
const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const scriptPath = path.join(__dirname, '../src/formatNames.js');

const child = spawn('node', [scriptPath, ...args], { stdio: 'inherit' });

child.on('exit', code => {
  process.exit(code);
}); 