const { EventEmitter } = require('events');

/**
 * Creates an event emitter with typed events
 * @template {Record<string, any>} T - Event types and their data
 */
class TypedEventEmitter extends EventEmitter {
  /**
   * Emits a typed event
   * @template {keyof T} K - Event type
   * @param {K} event - Event type
   * @param {T[K]} data - Event data
   * @returns {boolean} True if the event had listeners
   */
  emit(event, data) {
    return super.emit(event, data);
  }

  /**
   * Adds a listener for a typed event
   * @template {keyof T} K - Event type
   * @param {K} event - Event type
   * @param {(data: T[K]) => void} listener - Event listener
   * @returns {this}
   */
  on(event, listener) {
    return super.on(event, listener);
  }

  /**
   * Adds a one-time listener for a typed event
   * @template {keyof T} K - Event type
   * @param {K} event - Event type
   * @param {(data: T[K]) => void} listener - Event listener
   * @returns {this}
   */
  once(event, listener) {
    return super.once(event, listener);
  }

  /**
   * Removes a listener for a typed event
   * @template {keyof T} K - Event type
   * @param {K} event - Event type
   * @param {(data: T[K]) => void} listener - Event listener
   * @returns {this}
   */
  off(event, listener) {
    return super.off(event, listener);
  }
}

/**
 * Creates a promise that resolves when an event is emitted
 * @template {Record<string, any>} T - Event types and their data
 * @template {keyof T} K - Event type
 * @param {TypedEventEmitter<T>} emitter - Event emitter
 * @param {K} event - Event type
 * @param {Object} options - Options
 * @returns {Promise<T[K]>} Event data
 */
function waitForEvent(emitter, event, options = {}) {
  const {
    timeout = 5000,
    message = `Event ${String(event)} not emitted within timeout`
  } = options;

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      emitter.off(event, onEvent);
      reject(new Error(message));
    }, timeout);

    function onEvent(data) {
      clearTimeout(timeoutId);
      resolve(data);
    }

    emitter.once(event, onEvent);
  });
}

/**
 * Creates a promise that resolves when multiple events are emitted
 * @template {Record<string, any>} T - Event types and their data
 * @template {Array<keyof T>} K - Event types
 * @param {TypedEventEmitter<T>} emitter - Event emitter
 * @param {K} events - Event types
 * @param {Object} options - Options
 * @returns {Promise<Record<K[number], T[K[number]]>>} Event data
 */
function waitForEvents(emitter, events, options = {}) {
  const {
    timeout = 5000,
    message = `Events not emitted within timeout`
  } = options;

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      for (const event of events) {
        emitter.off(event, onEvent);
      }
      reject(new Error(message));
    }, timeout);

    const results = {};
    let remaining = events.length;

    function onEvent(event, data) {
      results[event] = data;
      remaining--;
      if (remaining === 0) {
        clearTimeout(timeoutId);
        resolve(results);
      }
    }

    for (const event of events) {
      emitter.once(event, data => onEvent(event, data));
    }
  });
}

/**
 * Creates a promise that resolves when an event is emitted with a condition
 * @template {Record<string, any>} T - Event types and their data
 * @template {keyof T} K - Event type
 * @param {TypedEventEmitter<T>} emitter - Event emitter
 * @param {K} event - Event type
 * @param {(data: T[K]) => boolean} condition - Condition to check
 * @param {Object} options - Options
 * @returns {Promise<T[K]>} Event data
 */
function waitForEventWithCondition(emitter, event, condition, options = {}) {
  const {
    timeout = 5000,
    message = `Event ${String(event)} with condition not emitted within timeout`
  } = options;

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      emitter.off(event, onEvent);
      reject(new Error(message));
    }, timeout);

    function onEvent(data) {
      if (condition(data)) {
        clearTimeout(timeoutId);
        emitter.off(event, onEvent);
        resolve(data);
      }
    }

    emitter.on(event, onEvent);
  });
}

module.exports = {
  TypedEventEmitter,
  waitForEvent,
  waitForEvents,
  waitForEventWithCondition
}; 