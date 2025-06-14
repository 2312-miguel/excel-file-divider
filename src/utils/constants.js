/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  sheet: 'Sheet1',
  rowsPerFile: 1000,
  filters: [],
  columns: [],
  tableName: 'data',
  statementType: 'INSERT',
  whereColumns: []
};

/**
 * SQL statement types
 */
const SQL_STATEMENT_TYPES = {
  INSERT: 'INSERT',
  UPDATE: 'UPDATE'
};

/**
 * File extensions
 */
const FILE_EXTENSIONS = {
  EXCEL: '.xlsx',
  CSV: '.csv',
  SQL: '.sql',
  JSON: '.json'
};

/**
 * Log levels
 */
const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

/**
 * Error types
 */
const ERROR_TYPES = {
  CONFIG: 'ConfigError',
  FILE: 'FileError',
  EXCEL: 'ExcelError',
  SQL: 'SqlError',
  VALIDATION: 'ValidationError'
};

/**
 * Validation types
 */
const VALIDATION_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  ARRAY: 'array',
  OBJECT: 'object',
  BOOLEAN: 'boolean',
  DATE: 'date'
};

/**
 * Stream types
 */
const STREAM_TYPES = {
  EXCEL: 'excel',
  CSV: 'csv',
  SQL: 'sql'
};

/**
 * Name matching options
 */
const NAME_MATCHING_OPTIONS = {
  DEFAULT_THRESHOLD: 0.8,
  MIN_THRESHOLD: 0.5,
  MAX_THRESHOLD: 1.0
};

/**
 * File size limits
 */
const FILE_SIZE_LIMITS = {
  MAX_EXCEL_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_CSV_SIZE: 50 * 1024 * 1024,    // 50MB
  MAX_SQL_SIZE: 10 * 1024 * 1024     // 10MB
};

/**
 * Log file options
 */
const LOG_FILE_OPTIONS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 5,
  DEFAULT_LOG_DIR: 'logs',
  DEFAULT_LOG_FILE: 'app.log',
  DEFAULT_ERROR_FILE: 'error.log'
};

module.exports = {
  DEFAULT_CONFIG,
  SQL_STATEMENT_TYPES,
  FILE_EXTENSIONS,
  LOG_LEVELS,
  ERROR_TYPES,
  VALIDATION_TYPES,
  STREAM_TYPES,
  NAME_MATCHING_OPTIONS,
  FILE_SIZE_LIMITS,
  LOG_FILE_OPTIONS
}; 