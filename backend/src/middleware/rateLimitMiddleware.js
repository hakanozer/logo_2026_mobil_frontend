const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin." },
});

const authLimiter = rateLimit({
  windowMs: 5 * 1000,
  max: 2,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Çok fazla giriş denemesi yapıldı, lütfen daha sonra tekrar deneyin." },
  // mesajı logger içerisinde yazdırmak için handler fonksiyonu ekleyebilirsiniz
  handler: (req, res, next, options) => {
    // Burada logger'ı kullanarak mesajı yazdırabilirsiniz
    logger.warn(`Rate limit exceeded for ${req.ip}: ${options.message.message}`);
    res.status(options.statusCode).json(options.message);
  },
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Çok fazla ödeme denemesi yapıldı, lütfen daha sonra tekrar deneyin." },
});

module.exports = { generalLimiter, authLimiter, paymentLimiter };
