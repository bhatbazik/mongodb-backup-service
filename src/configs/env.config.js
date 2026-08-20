import "dotenv/config";

// Environment variables configuration
export const {
  MONGODB_URI,
  MONGODB_DATABASE,
  EXCLUDED_COLLECTION,

  BACKUP_DIR = "/var/backups/mongodb",
  BACKUP_TIMEOUT_MINUTES = "180",

  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,

  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASSWORD,

  BACKUP_EMAIL_FROM,
  BACKUP_EMAIL_TO,
} = process.env;

export function validateEnv() {
  const required = {
    MONGODB_URI,
    MONGODB_DATABASE,
    EXCLUDED_COLLECTION,

    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET,

    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,

    BACKUP_EMAIL_FROM,
    BACKUP_EMAIL_TO,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

export default {
  MONGODB_URI,
  MONGODB_DATABASE,
  EXCLUDED_COLLECTION,

  BACKUP_DIR,
  BACKUP_TIMEOUT_MINUTES,

  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,

  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASSWORD,

  BACKUP_EMAIL_FROM,
  BACKUP_EMAIL_TO,
};
