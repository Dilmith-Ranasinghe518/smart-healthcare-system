const nodemailer = require("nodemailer");
const { buildTemplateByEvent } = require("../utils/emailTemplates");

const sendEventEmail = async ({ eventType, payload }) => {
  if (!process.env.EMAIL_USER) {
    throw new Error("EMAIL_USER is missing");
  }

  if (!process.env.EMAIL_PASS) {
    throw new Error("EMAIL_PASS is missing");
  }

  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM is missing");
  }

  const template = buildTemplateByEvent(eventType, payload);

  if (!template.to || template.to.length === 0) {
    throw new Error("No recipients found for this event");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: template.to.join(", "),
    subject: template.subject,
    html: template.html,
    text: template.text
  };

  const response = await transporter.sendMail(mailOptions);

  return {
    template,
    response
  };
};

module.exports = { sendEventEmail };