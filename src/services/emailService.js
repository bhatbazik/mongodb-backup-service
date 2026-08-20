import mailer from "../lib/nodemailer.js";
import { BACKUP_EMAIL_FROM, BACKUP_EMAIL_TO } from "../configs/env.config.js";

export async function sendEmail(subject, text) {
  try {
    await mailer.sendMail({
      from: BACKUP_EMAIL_FROM,
      to: BACKUP_EMAIL_TO,
      subject,
      text,
    });

    console.log("Email notification sent.");
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

export async function verifySmtp() {
  try {
    await mailer.verify();
    console.log("SMTP connection verified.");
  } catch (error) {
    console.error("SMTP verification failed:", error);
    throw new Error(`SMTP verification failed: ${error.message}`);
  }
}
