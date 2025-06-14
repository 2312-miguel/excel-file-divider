const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const readline = require('readline');

// Function to clean and normalize names
function cleanName(name) {
    if (!name) return '';
    return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

// Function to read CSV file as a stream and build a map
async function readCSVMap(filePath, keyField, valueField) {
    return new Promise((resolve, reject) => {
        const map = new Map();
        const rl = readline.createInterface({
            input: fs.createReadStream(filePath),
            crlfDelay: Infinity
        });
        let headers = [];
        rl.on('line', (line) => {
            if (!headers.length) {
                headers = line.replace(/"/g, '').split(',');
            } else {
                const values = line.replace(/"/g, '').split(',');
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = values[index];
                });
                if (obj[keyField]) {
                    map.set(cleanName(obj[keyField]), obj[valueField]);
                }
            }
        });
        rl.on('close', () => resolve(map));
        rl.on('error', reject);
    });
}

// Function to read Excel file as a stream and build a map
async function readExcelMap(filePath, nameFields, valueField) {
    const map = new Map();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];
    let headers = null;
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        const values = row.values.slice(1);
        if (rowNumber === 1) {
            headers = values;
        } else {
            const obj = {};
            headers.forEach((header, idx) => {
                obj[header] = values[idx];
            });
            if (obj[nameFields[0]] && obj[nameFields[1]]) {
                const fullName = cleanName(`${obj[nameFields[0]]} ${obj[nameFields[1]]}`);
                map.set(fullName, obj[valueField]);
            }
        }
    });
    return map;
}

// Function to read Excel file as a stream and build a plan map
async function readExcelPlanMap(filePath, nameField, idField) {
    const map = new Map();
    const rl = readline.createInterface({
        input: fs.createReadStream(filePath),
        crlfDelay: Infinity
    });
    let headers = [];
    rl.on('line', (line) => {
        if (!headers.length) {
            headers = line.replace(/"/g, '').split(',');
        } else {
            const values = line.replace(/"/g, '').split(',');
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index];
            });
            if (obj[nameField]) {
                const planName = cleanName(obj[nameField]);
                map.set(planName, obj[idField]);
            }
        }
    });
    return new Promise((resolve, reject) => {
        rl.on('close', () => resolve(map));
        rl.on('error', reject);
    });
}

// Main function
async function main() {
    try {
        // Read contracts.csv as a stream
        const contractsPath = path.join(__dirname, '../data/contracts.csv');
        const contracts = [];
        const rlContracts = readline.createInterface({
            input: fs.createReadStream(contractsPath),
            crlfDelay: Infinity
        });
        let headers = [];
        rlContracts.on('line', (line) => {
            if (!headers.length) {
                headers = line.replace(/"/g, '').split(',');
            } else {
                const values = line.replace(/"/g, '').split(',');
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = values[index];
                });
                contracts.push(obj);
            }
        });
        await new Promise((resolve, reject) => {
            rlContracts.on('close', resolve);
            rlContracts.on('error', reject);
        });
        console.log('Number of contracts read:', contracts.length);

        // Read Excel data as a map
        const excelDataPath = path.join(__dirname, '../data/Hoja de cálculo sin título.xlsx');
        const excelMap = await readExcelMap(excelDataPath, ['Nombre', 'Apellido'], 'Cod');
        console.log('Number of names mapped:', excelMap.size);

        // Read planes_velocidad.csv as a map
        const planesVelocidadPath = path.join(__dirname, '../data/planes_velocidad.csv');
        const planesMap = await readExcelPlanMap(planesVelocidadPath, 'name', 'id');
        console.log('Number of plans mapped:', planesMap.size);

        // Read Excel file for plan lookup
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(excelDataPath);
        const worksheet = workbook.worksheets[0];
        let excelRows = [];
        let excelHeaders = null;
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            const values = row.values.slice(1);
            if (rowNumber === 1) {
                excelHeaders = values;
            } else {
                const obj = {};
                excelHeaders.forEach((header, idx) => {
                    obj[header] = values[idx];
                });
                excelRows.push(obj);
            }
        });

        // Prepare output stream
        const outputPath = path.join(__dirname, '../update_statements.sql');
        const sqlStream = fs.createWriteStream(outputPath, { encoding: 'utf-8' });
        let sqlCount = 0;

        // Generate SQL statements in streaming fashion
        for (const contract of contracts) {
            if (contract.nombre) {
                const cleanContractName = cleanName(contract.nombre);
                const cod = excelMap.get(cleanContractName);
                if (cod) {
                    // Buscar el plan correspondiente en el Excel
                    const excelRow = excelRows.find(row => row.Cod === cod);
                    if (excelRow && excelRow.Plan) {
                        const planName = cleanName(excelRow.Plan);
                        const planId = planesMap.get(planName);
                        if (planId) {
                            const sql = `UPDATE contracts c SET c.nro = '${cod}', c.plan_id = ${planId} WHERE c.id = ${contract.id};`;
                            sqlStream.write(sql + '\n');
                        } else {
                            const sql = `UPDATE contracts c SET c.nro = '${cod}' WHERE c.id = ${contract.id};`;
                            sqlStream.write(sql + '\n');
                        }
                    } else {
                        const sql = `UPDATE contracts c SET c.nro = '${cod}' WHERE c.id = ${contract.id};`;
                        sqlStream.write(sql + '\n');
                    }
                    sqlCount++;
                }
            }
        }
        sqlStream.end();
        console.log(`Generated ${sqlCount} SQL statements`);
        console.log('SQL statements written to:', outputPath);
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

main(); 