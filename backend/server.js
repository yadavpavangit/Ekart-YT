const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/DB/db");

dotenv.config();

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(
      `server is running on port http://localhost:${process.env.PORT}`,
    );
  });
});
