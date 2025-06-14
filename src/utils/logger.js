const fs = require('fs');
const path = require('path');
const { ensureDirectoryExists } = require('./fileUtils');

class Logger {
  constructor(options = {}) {
    this.logDir = options.logDir || 'logs';
    this.logFile = options.logFile || 'app.log';
    this.errorFile = options.errorFile || 'error.log';
    this.maxFileSize = options.maxFileSize || 5 * 1024 * 1024; // 5MB
    this.maxFiles = options.maxFiles || 5;
    
    ensureDirectoryExists(this.logDir);
    this.logPath = path.join(this.logDir, this.logFile);
    this.errorPath = path.join(this.logDir, this.errorFile);
  }

  /**
   * Rotates log files if they exceed the maximum size
   * @param {string} filePath - Path to the log file
   */
  async rotateLogFile(filePath) {
    try {
      const stats = await fs.promises.stat(filePath);
      if (stats.size >= this.maxFileSize) {
        const dir = path.dirname(filePath);
        const ext = path.extname(filePath);
        const base = path.basename(filePath, ext);
        
        // Rotate existing files
        for (let i = this.maxFiles - 1; i > 0; i--) {
          const oldPath = path.join(dir, `${base}.${i}${ext}`);
          const newPath = path.join(dir, `${base}.${i + 1}${ext}`);
          try {
            await fs.promises.rename(oldPath, newPath);
          } catch (err) {
            if (err.code !== 'ENOENT') throw err;
          }
        }
        
        // Rename current file
        const newPath = path.join(dir, `${base}.1${ext}`);
        await fs.promises.rename(filePath, newPath);
      }
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }

  /**
   * Writes a message to a log file
   * @param {string} filePath - Path to the log file
   * @param {string} message - Message to write
   */
  async writeToFile(filePath, message) {
    await this.rotateLogFile(filePath);
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    await fs.promises.appendFile(filePath, logMessage, 'utf8');
  }

  /**
   * Logs an info message
   * @param {string} message - Message to log
   */
  async info(message) {
    console.log(message);
    await this.writeToFile(this.logPath, `[INFO] ${message}`);
  }

  /**
   * Logs a warning message
   * @param {string} message - Message to log
   */
  async warn(message) {
    console.warn(message);
    await this.writeToFile(this.logPath, `[WARN] ${message}`);
  }

  /**
   * Logs an error message
   * @param {string} message - Message to log
   * @param {Error} [error] - Error object
   */
  async error(message, error) {
    console.error(message);
    if (error) console.error(error);
    
    const errorMessage = error 
      ? `${message}\n${error.stack || error.message}`
      : message;
    
    await this.writeToFile(this.errorPath, `[ERROR] ${errorMessage}`);
    await this.writeToFile(this.logPath, `[ERROR] ${message}`);
  }

  /**
   * Logs a debug message
   * @param {string} message - Message to log
   */
  async debug(message) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(message);
      await this.writeToFile(this.logPath, `[DEBUG] ${message}`);
    }
  }
}

module.exports = Logger; 