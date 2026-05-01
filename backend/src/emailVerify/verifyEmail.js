const nodemailer = require("nodemailer");

const sendVerificationEmail = (verificationToken, userEmail) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let mailConfiguration = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "Email verification",
    text: `Hi, Please click on the following link to verify your email: http://localhost:5173/verify/${verificationToken}`,
  };

  transporter.sendMail(mailConfiguration, function (error, info) {
    if (error) {
      throw Error(error);
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendVerificationEmail;
