import { S3Client } from "@aws-sdk/client-s3";
import {
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
} from "../configs/env.config.js";
import { R2_ENDPOINT } from "../configs/constants.js";

export const r2 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export default r2;
