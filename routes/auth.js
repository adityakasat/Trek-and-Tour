const express = require('express');
const passport = require('passport');
const authController = require('../controllers/auth');

const router = express.Router();

router.post('/register',authController.register);
router.post('/login',authController.login);
router.post('/book',authController.book);

module.exports = router;
