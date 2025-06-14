const fs = require('fs');
const path = require('path');

/**
 * Loads a configuration file
 * @param {string} configPath - Path to the configuration file
 * @returns {Object} Configuration object
 */
function loadConfig(configPath) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return validateConfig(config);
  } catch (error) {
    throw new Error(`Failed to load config from ${configPath}: ${error.message}`);
  }
}

/**
 * Validates a configuration object
 * @param {Object} config - Configuration object to validate
 * @returns {Object} Validated configuration object
 */
function validateConfig(config) {
  if (!config) {
    throw new Error('Configuration is required');
  }

  // Validate required fields
  const requiredFields = ['input', 'output'];
  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Set default values for optional fields
  return {
    ...config,
    sheet: config.sheet || 'Sheet1',
    rowsPerFile: config.rowsPerFile || 1000,
    filters: config.filters || [],
    columns: config.columns || [],
    tableName: config.tableName || 'data',
    statementType: config.statementType || 'INSERT',
    whereColumns: config.whereColumns || []
  };
}

/**
 * Merges command line arguments with configuration
 * @param {Object} config - Base configuration object
 * @param {Object} args - Command line arguments
 * @returns {Object} Merged configuration
 */
function mergeConfigWithArgs(config, args) {
  const merged = { ...config };

  // Override config values with command line arguments if provided
  if (args.input) merged.input = args.input;
  if (args.output) merged.output = args.output;
  if (args.sheet) merged.sheet = args.sheet;
  if (args.rows) merged.rowsPerFile = args.rows;
  if (args.table) merged.tableName = args.table;
  if (args.type) merged.statementType = args.type;

  return merged;
}

/**
 * Gets the default configuration path
 * @param {string} type - Type of configuration (e.g., 'divide', 'filter', 'sql')
 * @returns {string} Default configuration path
 */
function getDefaultConfigPath(type) {
  const configDir = path.join(process.cwd(), 'config');
  return path.join(configDir, `${type}-config.json`);
}

/**
 * Ensures a configuration directory exists
 * @param {string} configDir - Path to the configuration directory
 */
function ensureConfigDir(configDir) {
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
}

/**
 * Creates a default configuration file
 * @param {string} type - Type of configuration
 * @param {Object} defaultConfig - Default configuration object
 */
function createDefaultConfig(type, defaultConfig) {
  const configPath = getDefaultConfigPath(type);
  const configDir = path.dirname(configPath);

  ensureConfigDir(configDir);

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(
      configPath,
      JSON.stringify(defaultConfig, null, 2),
      'utf8'
    );
  }
}

module.exports = {
  loadConfig,
  validateConfig,
  mergeConfigWithArgs,
  getDefaultConfigPath,
  ensureConfigDir,
  createDefaultConfig
}; 