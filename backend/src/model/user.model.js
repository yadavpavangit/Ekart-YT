const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    profilePic: { type: String, default: "" },
    profilePicId: { type: String, default: "" },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Good practice for emails
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    token: { type: String, default: null },
    // Changed to Boolean for better logic handling
    isVerified: { type: Boolean, default: false },
    isLoggedIn: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    address: { type: String },
    city: { type: String },
    zipCode: { type: String },
    phone: { type: String },
  },
  { timestamps: true },
);

// HASHING PASSWORD BEFORE SAVING TO DB
userSchema.pre("save", async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
});

// COMPARING PASSWORDS
// FIX: Changed to standard function to access 'this'
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: "10m",
    },
  );
};

const User = model("User", userSchema);

module.exports = User;
