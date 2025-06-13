/**
 * Interface for logging operations
 * @interface Logger
 * @property {Function} info - Log an info message
 * @property {Function} success - Log a success message
 * @property {Function} warn - Log a warning message
 * @property {Function} error - Log an error message
 */
export interface Logger {
  /**
   * Log a debug message
   * @param {string} msg - The message to log
   */
  debug(msg: string): void;

  /**
   * Log an info message
   * @param {string} msg - The message to log
   */
  info(msg: string): void;

  /**
   * Log a success message
   * @param {string} msg - The message to log
   */
  success(msg: string): void;

  /**
   * Log a warning message
   * @param {string} msg - The message to log
   */
  warn(msg: string): void;

  /**
   * Log an error message
   * @param {string} msg - The message to log
   */
  error(msg: string): void;
}
