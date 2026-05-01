const express = require("express");

const authController = require("../controllers/auth.cotroller");

const router = express.Router();

router.post("/register", authController.registerUser);
router.post("/verify-email", authController.verificationEmail);
router.post("/reverify-email", authController.reverificationEmail);
router.post("/login", authController.loginUser);

module.exports = router;
