const express = require("express");
const authController = require("../controllers/authController");
const { validateRegister } = require("../validators/authValidators");
const { validateZod } = require("../middleware/validateMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const loginUserSchema = require("../schemas/loginSchema").default;
const { authLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

router.post("/register", authLimiter, validate(validateRegister), authController.register);
router.post("/login", authLimiter, validateZod(loginUserSchema), authController.login);

module.exports = router;