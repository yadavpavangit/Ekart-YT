const sendVerificationEmail = require("../emailVerify/verifyEmail");
const User = require("../model/user.model");
const Session = require("../model/session.model");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await User.create({ firstName, lastName, email, password });

    const token = newUser.generateToken();
    sendVerificationEmail(token, email);
    newUser.token = token;
    await newUser.save();

    return res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
};

const verificationEmail = async (req, res) => {
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
        return res
          .status(401)
          .json({ message: "Registration token has expired" });
      }
      return res.status(400).json({ message: "Token verification failed" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.token = null;
    user.isVerified = true;
    await user.save();
    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const reverificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const token = user.generateToken();
    sendVerificationEmail(token, email);
    user.token = token;
    await user.save();

    return res
      .status(200)
      .json({ message: "Verification email sent successfully", user: user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, firstName } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { firstName }],
    });

    // CHECKING IF USER EXISTS
    if (!existingUser) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // CHECKING PASSWORD
    const isPasswordValid = await existingUser.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    // CHECKING IF EMAIL IS VERIFIED
    if (!existingUser.isVerified) {
      return res
        .status(401)
        .json({ message: "Please verify your email before logging in" });
    }

    const accessToken = existingUser.generateToken("7d");
    const refreshToken = existingUser.generateToken("30d");

    existingUser.isLoggedIn = true;
    await existingUser.save();

    // TODO: Implement session management and store refresh token in DB
    const existingSession = await Session.findOne({ userId: existingUser._id });

    if (existingSession) {
      await Session.deleteOne({ userId: existingUser._id });
    }

    // CREATING NEW SESSION
    await Session.create({
      userId: existingUser._id,
    });

    return res.status(200).json({
      message: `Welcome, ${existingUser.firstName}! You have logged in successfully`,
      user: existingUser,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    const userId = req.id;

    await Session.deleteMany({ userId: userId });
    await User.findByIdAndUpdate(userId, { isLoggedIn: false });

    return res.status(200).json({ message: "Log out successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  verificationEmail,
  reverificationEmail,
  loginUser,
  logoutUser,
};
