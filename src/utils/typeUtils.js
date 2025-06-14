const { ValidationError } = require('./errorUtils');
const { VALIDATION_TYPES } = require('./constants');

/**
 * Gets the type of a value
 * @param {any} value - Value to get type of
 * @returns {string} Type of the value
 */
function getType(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'date';
  return typeof value;
}

/**
 * Checks if a value is of a specific type
 * @param {any} value - Value to check
 * @param {string} type - Type to check against
 * @returns {boolean} True if the value is of the specified type
 */
function isType(value, type) {
  return getType(value) === type;
}

/**
 * Converts a value to a specific type
 * @param {any} value - Value to convert
 * @param {string} type - Type to convert to
 * @returns {any} Converted value
 * @throws {ValidationError} If the value cannot be converted
 */
function convertToType(value, type) {
  if (value === null || value === undefined) {
    return value;
  }

  try {
    switch (type) {
      case VALIDATION_TYPES.STRING:
        return String(value);
      case VALIDATION_TYPES.NUMBER:
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error('Cannot convert to number');
        }
        return num;
      case VALIDATION_TYPES.BOOLEAN:
        if (typeof value === 'string') {
          const lower = value.toLowerCase();
          if (lower === 'true') return true;
          if (lower === 'false') return false;
          throw new Error('Cannot convert to boolean');
        }
        return Boolean(value);
      case VALIDATION_TYPES.DATE:
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error('Cannot convert to date');
        }
        return date;
      case VALIDATION_TYPES.ARRAY:
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return [value];
          }
        }
        return [value];
      case VALIDATION_TYPES.OBJECT:
        if (typeof value === 'object' && !Array.isArray(value)) return value;
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            throw new Error('Cannot convert to object');
          }
        }
        throw new Error('Cannot convert to object');
      default:
        throw new Error(`Unknown type: ${type}`);
    }
  } catch (error) {
    throw new ValidationError(`Cannot convert value to type ${type}: ${error.message}`);
  }
}

/**
 * Validates that a value is of a specific type
 * @param {any} value - Value to validate
 * @param {string} type - Type to validate against
 * @param {string} name - Name of the parameter
 * @throws {ValidationError} If the value is not of the specified type
 */
function validateType(value, type, name) {
  if (!isType(value, type)) {
    throw new ValidationError(`${name} must be of type ${type}`);
  }
}

/**
 * Gets the type of a value and validates it against an expected type
 * @param {any} value - Value to check
 * @param {string} expectedType - Expected type
 * @param {string} name - Name of the parameter
 * @returns {string} Actual type of the value
 * @throws {ValidationError} If the value is not of the expected type
 */
function getAndValidateType(value, expectedType, name) {
  const actualType = getType(value);
  if (actualType !== expectedType) {
    throw new ValidationError(`${name} must be of type ${expectedType}, got ${actualType}`);
  }
  return actualType;
}

module.exports = {
  getType,
  isType,
  convertToType,
  validateType,
  getAndValidateType
}; 