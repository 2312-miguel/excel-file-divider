/**
 * Executes a function with retries
 * @param {Function} fn - Function to execute
 * @param {Object} options - Retry options
 * @returns {Promise<any>} Result of the function
 */
async function withRetry(fn, options = {}) {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    onRetry = () => {}
  } = options;

  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const waitTime = delay * Math.pow(backoff, i);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        onRetry(error, i + 1);
      }
    }
  }
  throw lastError;
}

/**
 * Executes functions in parallel with a concurrency limit
 * @param {Array<Function>} fns - Array of functions to execute
 * @param {number} concurrency - Maximum number of concurrent executions
 * @returns {Promise<Array<any>>} Results of the functions
 */
async function parallelWithLimit(fns, concurrency) {
  const results = [];
  const executing = new Set();

  for (const fn of fns) {
    const promise = fn();
    results.push(promise);
    executing.add(promise);

    const clean = () => executing.delete(promise);
    promise.then(clean).catch(clean);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

/**
 * Executes functions in sequence
 * @param {Array<Function>} fns - Array of functions to execute
 * @returns {Promise<Array<any>>} Results of the functions
 */
async function sequence(fns) {
  const results = [];
  for (const fn of fns) {
    results.push(await fn());
  }
  return results;
}

/**
 * Creates a promise that resolves after a delay
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a promise that rejects after a timeout
 * @param {Promise} promise - Promise to timeout
 * @param {number} ms - Timeout in milliseconds
 * @param {string} [message] - Timeout message
 * @returns {Promise<any>} Result of the promise
 */
function timeout(promise, ms, message = 'Operation timed out') {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))
  ]);
}

/**
 * Executes a function with a timeout
 * @param {Function} fn - Function to execute
 * @param {number} ms - Timeout in milliseconds
 * @param {string} [message] - Timeout message
 * @returns {Promise<any>} Result of the function
 */
async function withTimeout(fn, ms, message) {
  return timeout(Promise.resolve().then(fn), ms, message);
}

/**
 * Creates a promise that resolves when a condition is met
 * @param {Function} condition - Function that returns a boolean
 * @param {Object} options - Options
 * @returns {Promise<void>}
 */
async function waitFor(condition, options = {}) {
  const {
    interval = 100,
    timeout = 5000,
    message = 'Condition not met within timeout'
  } = options;

  const start = Date.now();
  while (!(await condition())) {
    if (Date.now() - start > timeout) {
      throw new Error(message);
    }
    await delay(interval);
  }
}

module.exports = {
  withRetry,
  parallelWithLimit,
  sequence,
  delay,
  timeout,
  withTimeout,
  waitFor
}; 