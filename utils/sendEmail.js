const nodemailer = require("nodemailer");
const nodemailerMailgunTransport = require("nodemailer-mailgun-transport");
require("dotenv").config();
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const auth = {
  auth: {
    api_key: process.env.MAILGUN_APIKEY,
    domain: process.env.MAILGUN_DOMAIN,
  },
};

const transporter = nodemailer.createTransport(
  nodemailerMailgunTransport(auth)
);

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("ready for message transport");
    console.log(success);
  }
});

const sendEmail = async (email, subject, payload, template) => {
  try {
    const source = fs.readFileSync(path.join(__dirname, template), "utf8");
    const compiledTemplate = handlebars.compile(source);
    const options = () => {
      return {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: subject,
        html: compiledTemplate(payload),
      };
    };

    // Send email
    transporter.sendMail(options(), (error, info) => {
      if (error) {
        return error;
      } else {
        return;
      }
    });
  } catch (error) {
    return error;
  }
};

module.exports = sendEmail;
