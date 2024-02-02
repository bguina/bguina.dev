const isDevelopment = process.env.NODE_ENV !== 'production';
const isProduction = !isDevelopment;

module.exports = {
  isDevelopment,
  isProduction,
};
