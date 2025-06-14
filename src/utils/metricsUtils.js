const fs = require('fs');
const path = require('path');
const { TypedEventEmitter } = require('./eventUtils');

/**
 * Event types for metrics
 */
const METRIC_EVENTS = {
  COUNTER: 'counter',
  GAUGE: 'gauge',
  HISTOGRAM: 'histogram',
  TIMER: 'timer'
};

/**
 * Metrics class for collecting and reporting metrics
 */
class Metrics extends TypedEventEmitter {
  /**
   * Creates a new metrics collector
   * @param {Object} options - Metrics options
   */
  constructor(options = {}) {
    super();
    this.dir = options.dir || path.join(process.cwd(), 'metrics');
    this.interval = options.interval || 60000; // 1 minute
    this.counters = new Map();
    this.gauges = new Map();
    this.histograms = new Map();
    this.timers = new Map();
    this.ensureMetricsDir();
    this.startReporting();
  }

  /**
   * Ensures the metrics directory exists
   */
  ensureMetricsDir() {
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }
  }

  /**
   * Starts the metrics reporting interval
   */
  startReporting() {
    setInterval(() => this.report(), this.interval);
  }

  /**
   * Increments a counter
   * @param {string} name - Counter name
   * @param {number} [value=1] - Value to increment by
   * @param {Object} [labels={}] - Labels for the counter
   */
  increment(name, value = 1, labels = {}) {
    const key = this.getKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
    this.emit(METRIC_EVENTS.COUNTER, { name, value, labels });
  }

  /**
   * Sets a gauge value
   * @param {string} name - Gauge name
   * @param {number} value - Gauge value
   * @param {Object} [labels={}] - Labels for the gauge
   */
  setGauge(name, value, labels = {}) {
    const key = this.getKey(name, labels);
    this.gauges.set(key, value);
    this.emit(METRIC_EVENTS.GAUGE, { name, value, labels });
  }

  /**
   * Records a value in a histogram
   * @param {string} name - Histogram name
   * @param {number} value - Value to record
   * @param {Object} [labels={}] - Labels for the histogram
   */
  recordHistogram(name, value, labels = {}) {
    const key = this.getKey(name, labels);
    const values = this.histograms.get(key) || [];
    values.push(value);
    this.histograms.set(key, values);
    this.emit(METRIC_EVENTS.HISTOGRAM, { name, value, labels });
  }

  /**
   * Starts a timer
   * @param {string} name - Timer name
   * @param {Object} [labels={}] - Labels for the timer
   * @returns {Function} Function to stop the timer
   */
  startTimer(name, labels = {}) {
    const start = process.hrtime();
    return () => {
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds
      this.recordHistogram(name, duration, labels);
      this.emit(METRIC_EVENTS.TIMER, { name, duration, labels });
    };
  }

  /**
   * Gets a key for a metric
   * @param {string} name - Metric name
   * @param {Object} labels - Metric labels
   * @returns {string} Metric key
   */
  getKey(name, labels) {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return labelStr ? `${name}{${labelStr}}` : name;
  }

  /**
   * Reports metrics to a file
   */
  async report() {
    const timestamp = new Date().toISOString();
    const metrics = {
      timestamp,
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: Object.fromEntries(
        Array.from(this.histograms.entries()).map(([key, values]) => [
          key,
          {
            count: values.length,
            sum: values.reduce((a, b) => a + b, 0),
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((a, b) => a + b, 0) / values.length
          }
        ])
      )
    };

    const filePath = path.join(this.dir, `${timestamp.split('T')[0]}.json`);
    try {
      let existing = {};
      if (fs.existsSync(filePath)) {
        const content = await fs.promises.readFile(filePath, 'utf8');
        existing = JSON.parse(content);
      }

      const updated = {
        ...existing,
        [timestamp]: metrics
      };

      await fs.promises.writeFile(filePath, JSON.stringify(updated, null, 2));
    } catch (error) {
      console.error('Failed to write metrics:', error);
    }
  }

  /**
   * Resets all metrics
   */
  reset() {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.timers.clear();
  }
}

/**
 * Creates a metrics collector
 * @param {Object} options - Metrics options
 * @returns {Metrics} Metrics collector
 */
function createMetrics(options) {
  return new Metrics(options);
}

module.exports = {
  Metrics,
  createMetrics,
  METRIC_EVENTS
}; 