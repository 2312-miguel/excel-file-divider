/**
 * Custom error class for configuration errors
 */
class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigError';
  }
}

/**
 * Custom error class for file operation errors
 */
class FileError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FileError';
  }
}

/**
 * Custom error class for Excel operation errors
 */
class ExcelError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ExcelError';
  }
}

/**
 * Custom error class for SQL operation errors
 */
class SqlError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SqlError';
  }
}

/**
 * Custom error class for validation errors
 */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Handles an error and returns a formatted error message
 * @param {Error} error - Error to handle
 * @returns {string} Formatted error message
 */
function handleError(error) {
  if (error instanceof ConfigError) {
    return `Configuration error: ${error.message}`;
  }
  if (error instanceof FileError) {
    return `File operation error: ${error.message}`;
  }
  if (error instanceof ExcelError) {
    return `Excel operation error: ${error.message}`;
  }
  if (error instanceof SqlError) {
    return `SQL operation error: ${error.message}`;
  }
  if (error instanceof ValidationError) {
    return `Validation error: ${error.message}`;
  }
  return `Unexpected error: ${error.message}`;
}

/**
 * Checks if an error is fatal
 * @param {Error} error - Error to check
 * @returns {boolean} True if the error is fatal
 */
function isFatalError(error) {
  return error instanceof ConfigError || error instanceof FileError;
}

/**
 * Validates a required parameter
 * @param {any} value - Value to validate
 * @param {string} name - Name of the parameter
 * @throws {ValidationError} If the value is invalid
 */
function validateRequired(value, name) {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(`${name} is required`);
  }
}

/**
 * Validates a file path
 * @param {string} path - Path to validate
 * @param {string} name - Name of the parameter
 * @throws {ValidationError} If the path is invalid
 */
function validateFilePath(path, name) {
  validateRequired(path, name);
  if (typeof path !== 'string') {
    throw new ValidationError(`${name} must be a string`);
  }
}

/**
 * Validates a number
 * @param {number} value - Value to validate
 * @param {string} name - Name of the parameter
 * @param {Object} options - Validation options
 * @throws {ValidationError} If the value is invalid
 */
function validateNumber(value, name, options = {}) {
  validateRequired(value, name);
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`${name} must be a number`);
  }
  if (options.min !== undefined && value < options.min) {
    throw new ValidationError(`${name} must be greater than or equal to ${options.min}`);
  }
  if (options.max !== undefined && value > options.max) {
    throw new ValidationError(`${name} must be less than or equal to ${options.max}`);
  }
}

module.exports = {
  ConfigError,
  FileError,
  ExcelError,
  SqlError,
  ValidationError,
  handleError,
  isFatalError,
  validateRequired,
  validateFilePath,
  validateNumber
}; 