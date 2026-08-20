import nodemailer from "nodemailer";
import {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASSWORD,
} from "../configs/env.config.js";

export const mailer = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),

  secure: String(SMTP_SECURE).toLowerCase() === "true",

  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

export default mailer;
