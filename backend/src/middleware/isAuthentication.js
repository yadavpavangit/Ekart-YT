const User = require("../model/user.model");
const jwt = require("jsonwebtoken");

const isAuthentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization token missing or invalid" });
    }
    const token = authHeader.split(" ")[1];
    // TOKEN VERIFICATION
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token has expired" });
      }
      return res
        .status(400)
        .json({ message: "Access token invalid or missing" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.id = user._id;
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = isAuthentication;
