const { Transform } = require('stream');
const { ExcelError } = require('./errorUtils');

/**
 * Creates a transform stream for processing Excel rows
 * @param {Function} processRow - Function to process each row
 * @returns {Transform} Transform stream
 */
function createExcelTransformStream(processRow) {
  return new Transform({
    objectMode: true,
    transform(row, encoding, callback) {
      try {
        const result = processRow(row);
        callback(null, result);
      } catch (error) {
        callback(new ExcelError(`Error processing row: ${error.message}`));
      }
    }
  });
}

/**
 * Creates a transform stream for processing CSV rows
 * @param {Function} processRow - Function to process each row
 * @returns {Transform} Transform stream
 */
function createCsvTransformStream(processRow) {
  return new Transform({
    objectMode: true,
    transform(row, encoding, callback) {
      try {
        const result = processRow(row);
        callback(null, result);
      } catch (error) {
        callback(new Error(`Error processing row: ${error.message}`));
      }
    }
  });
}

/**
 * Creates a transform stream for processing SQL statements
 * @param {Function} processStatement - Function to process each statement
 * @returns {Transform} Transform stream
 */
function createSqlTransformStream(processStatement) {
  return new Transform({
    objectMode: true,
    transform(statement, encoding, callback) {
      try {
        const result = processStatement(statement);
        callback(null, result);
      } catch (error) {
        callback(new Error(`Error processing statement: ${error.message}`));
      }
    }
  });
}

/**
 * Creates a transform stream for filtering rows
 * @param {Function} filterFn - Function to filter rows
 * @returns {Transform} Transform stream
 */
function createFilterStream(filterFn) {
  return new Transform({
    objectMode: true,
    transform(row, encoding, callback) {
      try {
        if (filterFn(row)) {
          callback(null, row);
        } else {
          callback();
        }
      } catch (error) {
        callback(new Error(`Error filtering row: ${error.message}`));
      }
    }
  });
}

/**
 * Creates a transform stream for mapping rows
 * @param {Function} mapFn - Function to map rows
 * @returns {Transform} Transform stream
 */
function createMapStream(mapFn) {
  return new Transform({
    objectMode: true,
    transform(row, encoding, callback) {
      try {
        const result = mapFn(row);
        callback(null, result);
      } catch (error) {
        callback(new Error(`Error mapping row: ${error.message}`));
      }
    }
  });
}

/**
 * Creates a transform stream for reducing rows
 * @param {Function} reduceFn - Function to reduce rows
 * @param {any} initialValue - Initial value for reduction
 * @returns {Transform} Transform stream
 */
function createReduceStream(reduceFn, initialValue) {
  let accumulator = initialValue;
  return new Transform({
    objectMode: true,
    transform(row, encoding, callback) {
      try {
        accumulator = reduceFn(accumulator, row);
        callback();
      } catch (error) {
        callback(new Error(`Error reducing row: ${error.message}`));
      }
    },
    flush(callback) {
      callback(null, accumulator);
    }
  });
}

module.exports = {
  createExcelTransformStream,
  createCsvTransformStream,
  createSqlTransformStream,
  createFilterStream,
  createMapStream,
  createReduceStream
}; 