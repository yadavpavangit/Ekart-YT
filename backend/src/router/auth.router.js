const express = require("express");

const authController = require("../controllers/auth.cotroller");

const router = express.Router();

router.post("/register", authController.registerUser);

module.exports = router;
