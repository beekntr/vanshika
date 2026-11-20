const express = require('express');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const { register, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', validate(registerSchema), register); // POST /register
router.post('/login', validate(loginSchema), login); // POST /login

module.exports = router;
