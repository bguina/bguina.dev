const winston = require('winston');
const env = require('./env');

const logger = winston.createLogger({
  level: env.isProduction ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

const wrapper = {
  debug(message) {
    logger.debug(message);
  },
  verbose(message) {
    logger.verbose(message);
  },
  info(message) {
    logger.debug(message);
  },
  warn(message) {
    logger.warn(message);
  },
  error(message) {
    logger.error(message);
  },
};

module.exports = wrapper;
