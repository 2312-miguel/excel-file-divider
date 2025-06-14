const { ValidationError } = require('./errorUtils');

/**
 * Validates a string
 * @param {string} value - Value to validate
 * @param {string} name - Name of the parameter
 * @param {Object} options - Validation options
 * @throws {ValidationError} If the value is invalid
 */
function validateString(value, name, options = {}) {
  if (value === undefined || value === null) {
    if (options.required) {
      throw new ValidationError(`${name} is required`);
    }
    return;
  }

  if (typeof value !== 'string') {
    throw new ValidationError(`${name} must be a string`);
  }

  if (options.minLength !== undefined && value.length < options.minLength) {
    throw new ValidationError(`${name} must be at least ${options.minLength} characters long`);
  }

  if (options.maxLength !== undefined && value.length > options.maxLength) {
    throw new ValidationError(`${name} must be at most ${options.maxLength} characters long`);
  }

  if (options.pattern !== undefined && !options.pattern.test(value)) {
    throw new ValidationError(`${name} must match pattern ${options.pattern}`);
  }
}

/**
 * Validates an array
 * @param {Array} value - Value to validate
 * @param {string} name - Name of the parameter
 * @param {Object} options - Validation options
 * @throws {ValidationError} If the value is invalid
 */
function validateArray(value, name, options = {}) {
  if (value === undefined || value === null) {
    if (options.required) {
      throw new ValidationError(`${name} is required`);
    }
    return;
  }

  if (!Array.isArray(value)) {
    throw new ValidationError(`${name} must be an array`);
  }

  if (options.minLength !== undefined && value.length < options.minLength) {
    throw new ValidationError(`${name} must have at least ${options.minLength} items`);
  }

  if (options.maxLength !== undefined && value.length > options.maxLength) {
    throw new ValidationError(`${name} must have at most ${options.maxLength} items`);
  }

  if (options.itemType !== undefined) {
    value.forEach((item, index) => {
      if (typeof item !== options.itemType) {
        throw new ValidationError(`${name}[${index}] must be of type ${options.itemType}`);
      }
    });
  }
}

/**
 * Validates an object
 * @param {Object} value - Value to validate
 * @param {string} name - Name of the parameter
 * @param {Object} options - Validation options
 * @throws {ValidationError} If the value is invalid
 */
function validateObject(value, name, options = {}) {
  if (value === undefined || value === null) {
    if (options.required) {
      throw new ValidationError(`${name} is required`);
    }
    return;
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError(`${name} must be an object`);
  }

  if (options.properties !== undefined) {
    Object.entries(options.properties).forEach(([propName, propOptions]) => {
      validateValue(value[propName], `${name}.${propName}`, propOptions);
    });
  }
}

/**
 * Validates a value based on its type
 * @param {any} value - Value to validate
 * @param {string} name - Name of the parameter
 * @param {Object} options - Validation options
 * @throws {ValidationError} If the value is invalid
 */
function validateValue(value, name, options = {}) {
  if (options.type === 'string') {
    validateString(value, name, options);
  } else if (options.type === 'number') {
    validateNumber(value, name, options);
  } else if (options.type === 'array') {
    validateArray(value, name, options);
  } else if (options.type === 'object') {
    validateObject(value, name, options);
  } else if (options.type === 'boolean') {
    validateBoolean(value, name, options);
  } else if (options.type === 'date') {
    validateDate(value, name, options);
  } else {
    throw new ValidationError(`Unknown type: ${options.type}`);
  }
}

/**
 * Validates a boolean
 * @param {boolean} value - Value to validate
 * @param {string} name - Name of the parameter
 * @param {Object} options - Validation options
 * @throws {ValidationError} If the value is invalid
 */
function validateBoolean(value, name, options = {}) {
  if (value === undefined || value === null) {
    if (options.required) {
      throw new ValidationError(`${name} is required`);
    }
    return;
  }

  if (typeof value !== 'boolean') {
    throw new ValidationError(`${name} must be a boolean`);
  }
}

/**
 * Validates a date
 * @param {Date|string} value - Value to validate
 * @param {string} name - Name of the parameter
 * @param {Object} options - Validation options
 * @throws {ValidationError} If the value is invalid
 */
function validateDate(value, name, options = {}) {
  if (value === undefined || value === null) {
    if (options.required) {
      throw new ValidationError(`${name} is required`);
    }
    return;
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new ValidationError(`${name} must be a valid date`);
  }

  if (options.min !== undefined && date < new Date(options.min)) {
    throw new ValidationError(`${name} must be after ${options.min}`);
  }

  if (options.max !== undefined && date > new Date(options.max)) {
    throw new ValidationError(`${name} must be before ${options.max}`);
  }
}

module.exports = {
  validateString,
  validateArray,
  validateObject,
  validateValue,
  validateBoolean,
  validateDate
}; 