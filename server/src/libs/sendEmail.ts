import * as nodemailer from "nodemailer";

import config from "../configs/config";

export const sendEmail = async (
  emailTO: string,
  emailSubj: string,
  emailText: string,
) => {
  let transporter = nodemailer.createTransport({
    host: config.email.host,
    port: Number(config.email.port),
    secure: false,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
    tls: { rejectUnauthorized: false },
  });

  let mailOptions = {
    from: '"OTP Code" <info@teamrabbil.com>',
    to: emailTO,
    subject: emailSubj,
    text: emailText,
  };

  return await transporter.sendMail(mailOptions);
};
