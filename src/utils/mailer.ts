import nodemailer from "nodemailer";
import config from "config";
import logger from "./logger";
import mongoose from "mongoose";

const transporter = nodemailer.createTransport(config.get("smtp"));

export const sendMail = async (options: nodemailer.SendMailOptions) => {
  try {
    const info = await transporter.sendMail(options);
    logger.info("preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    logger.error("error sending email");
    logger.error(err);
  }
};

export const sendVerificationMail = async (info: {
  id: mongoose.ObjectId;
  email: string;
  verificationCode: string;
}) => {
  await sendMail({
    from: "harsh99gautam@gmail.com",
    to: info.email,
    subject: "verification link",
    // text: `userId: ${info.id}\nverificationCode:${info.verificationCode}`,
    text: `${config.get("baseURL")}/users/verify/${info.id}/${
      info.verificationCode
    }`,
    html: `<a href="${config.get("baseURL")}/users/verify/${info.id}/${
      info.verificationCode
    }" >verify</a>`,
  });
};

export const sendResetPasswordMail = async (info: {
  id: mongoose.ObjectId;
  email: string;
  passwordResetCode: string;
}) => {
  await sendMail({
    from: "info@shopeasy.com",
    to: info.email,
    subject: "reset password",
    text: `userId: ${info.id}\npasswordResetCode:${info.passwordResetCode}`,
  });
};
