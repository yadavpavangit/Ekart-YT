const express = require("express");
const authController = require("../controllers/auth.cotroller");
const isAuthentication = require("../middleware/isAuthentication");

const router = express.Router();

router.post("/register", authController.registerUser);
router.post("/verify-email", authController.verificationEmail);
router.post("/reverify-email", authController.reverificationEmail);
router.post("/login", authController.loginUser);
router.post("/logout", isAuthentication, authController.logoutUser);

module.exports = router;
