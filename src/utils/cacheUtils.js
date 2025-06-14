const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Creates a cache key from a string
 * @param {string} str - String to create key from
 * @returns {string} Cache key
 */
function createCacheKey(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * Cache class for storing and retrieving data
 */
class Cache {
  /**
   * Creates a new cache
   * @param {Object} options - Cache options
   */
  constructor(options = {}) {
    this.dir = options.dir || path.join(process.cwd(), 'cache');
    this.ttl = options.ttl || 3600000; // 1 hour
    this.maxSize = options.maxSize || 100 * 1024 * 1024; // 100MB
    this.ensureCacheDir();
  }

  /**
   * Ensures the cache directory exists
   */
  ensureCacheDir() {
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }
  }

  /**
   * Gets the path for a cache key
   * @param {string} key - Cache key
   * @returns {string} Cache file path
   */
  getCachePath(key) {
    return path.join(this.dir, `${key}.json`);
  }

  /**
   * Gets data from the cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached data
   */
  async get(key) {
    const cacheKey = createCacheKey(key);
    const cachePath = this.getCachePath(cacheKey);

    try {
      const stats = await fs.promises.stat(cachePath);
      if (Date.now() - stats.mtimeMs > this.ttl) {
        await this.delete(key);
        return null;
      }

      const data = await fs.promises.readFile(cachePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Sets data in the cache
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @returns {Promise<void>}
   */
  async set(key, data) {
    const cacheKey = createCacheKey(key);
    const cachePath = this.getCachePath(cacheKey);

    try {
      const json = JSON.stringify(data);
      await fs.promises.writeFile(cachePath, json, 'utf8');
      await this.cleanup();
    } catch (error) {
      throw new Error(`Failed to cache data: ${error.message}`);
    }
  }

  /**
   * Deletes data from the cache
   * @param {string} key - Cache key
   * @returns {Promise<void>}
   */
  async delete(key) {
    const cacheKey = createCacheKey(key);
    const cachePath = this.getCachePath(cacheKey);

    try {
      await fs.promises.unlink(cachePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Clears all data from the cache
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      const files = await fs.promises.readdir(this.dir);
      await Promise.all(
        files.map(file => fs.promises.unlink(path.join(this.dir, file)))
      );
    } catch (error) {
      throw new Error(`Failed to clear cache: ${error.message}`);
    }
  }

  /**
   * Cleans up old cache files
   * @returns {Promise<void>}
   */
  async cleanup() {
    try {
      const files = await fs.promises.readdir(this.dir);
      const stats = await Promise.all(
        files.map(async file => {
          const filePath = path.join(this.dir, file);
          const stat = await fs.promises.stat(filePath);
          return { file, stat };
        })
      );

      // Sort by modification time (oldest first)
      stats.sort((a, b) => a.stat.mtimeMs - b.stat.mtimeMs);

      // Calculate total size
      let totalSize = stats.reduce((sum, { stat }) => sum + stat.size, 0);

      // Remove old files if total size exceeds maxSize
      for (const { file, stat } of stats) {
        if (totalSize <= this.maxSize) break;
        await fs.promises.unlink(path.join(this.dir, file));
        totalSize -= stat.size;
      }
    } catch (error) {
      throw new Error(`Failed to cleanup cache: ${error.message}`);
    }
  }
}

/**
 * Creates a memoized function
 * @template T - Function return type
 * @param {Function} fn - Function to memoize
 * @param {Object} options - Memoization options
 * @returns {Function} Memoized function
 */
function memoize(fn, options = {}) {
  const cache = new Cache(options);
  const keyFn = options.keyFn || ((...args) => JSON.stringify(args));

  return async function memoized(...args) {
    const key = keyFn(...args);
    const cached = await cache.get(key);
    if (cached !== null) {
      return cached;
    }

    const result = await fn(...args);
    await cache.set(key, result);
    return result;
  };
}

module.exports = {
  Cache,
  memoize,
  createCacheKey
}; 