const fs = require('fs');
const { formatSqlValue } = require('./fileUtils');

/**
 * Generates an INSERT statement
 * @param {string} tableName - Name of the table
 * @param {Object} data - Object containing column-value pairs
 * @returns {string} INSERT statement
 */
function generateInsertStatement(tableName, data) {
  const columns = Object.keys(data);
  const values = columns.map(col => formatSqlValue(data[col]));
  return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
}

/**
 * Generates an UPDATE statement
 * @param {string} tableName - Name of the table
 * @param {Object} data - Object containing column-value pairs
 * @param {Object} where - Object containing where conditions
 * @returns {string} UPDATE statement
 */
function generateUpdateStatement(tableName, data, where) {
  const setClause = Object.entries(data)
    .map(([col, val]) => `${col} = ${formatSqlValue(val)}`)
    .join(', ');
  const whereClause = Object.entries(where)
    .map(([col, val]) => `${col} = ${formatSqlValue(val)}`)
    .join(' AND ');
  return `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause};`;
}

/**
 * Writes SQL statements to a file
 * @param {string} filePath - Path to write the file
 * @param {Array<string>} statements - Array of SQL statements
 * @returns {Promise<void>}
 */
async function writeSqlStatements(filePath, statements) {
  const content = statements.join('\n');
  await fs.promises.writeFile(filePath, content, 'utf8');
}

/**
 * Escapes a string for SQL
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeSqlString(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/'/g, "''");
}

/**
 * Formats a column name for SQL
 * @param {string} columnName - Column name to format
 * @returns {string} Formatted column name
 */
function formatColumnName(columnName) {
  // Remove special characters and spaces
  return columnName.replace(/[^a-zA-Z0-9_]/g, '_');
}

module.exports = {
  generateInsertStatement,
  generateUpdateStatement,
  writeSqlStatements,
  escapeSqlString,
  formatColumnName
}; 