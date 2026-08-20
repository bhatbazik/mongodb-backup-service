import fs from "node:fs";
import fsp from "node:fs/promises";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { r2 } from "../lib/r2.js";
import { R2_BUCKET, MONGODB_DATABASE } from "../configs/env.config.js";
import { formatBytes } from "../utils/formatters.js";

export async function uploadToR2(filePath, objectKey, sha256) {
  const stat = await fsp.stat(filePath);

  console.log(`Uploading ${formatBytes(stat.size)} to R2...`);

  const upload = new Upload({
    client: r2,
    params: {
      Bucket: R2_BUCKET,
      Key: objectKey,
      Body: fs.createReadStream(filePath),
      ContentType: "application/gzip",
      Metadata: {
        sha256,
        database: MONGODB_DATABASE,
        backupTime: new Date().toISOString(),
      },
    },
    checksumAlgorithm: "SHA256",
    partSize: 10 * 1024 * 1024,
    queueSize: 2,
    leavePartsOnError: false,
  });

  upload.on("httpUploadProgress", (progress) => {
    const loaded = progress.loaded ?? 0;
    const total = progress.total || stat.size;

    if (total) {
      const percentage = (loaded / total) * 100;
      process.stdout.write(`\rR2 upload: ${percentage.toFixed(1)}%`);
    } else {
      process.stdout.write(`\rR2 uploaded: ${formatBytes(loaded)}`);
    }
  });

  const result = await upload.done();

  console.log("\nR2 multipart upload completed.");

  return {
    size: stat.size,
    etag: result.ETag ?? null,
  };
}

export async function verifyR2Object(objectKey, expectedSize, expectedSha256) {
  console.log("Verifying uploaded R2 object...");

  const response = await r2.send(
    new HeadObjectCommand({
      Bucket: R2_BUCKET,
      Key: objectKey,
    })
  );

  if (Number(response.ContentLength) !== Number(expectedSize)) {
    throw new Error(
      `R2 size mismatch. Expected ${expectedSize} bytes, received ${response.ContentLength} bytes.`
    );
  }

  const remoteSha256 = response.Metadata?.sha256 || response.Metadata?.SHA256;

  if (remoteSha256 !== expectedSha256) {
    throw new Error(
      `R2 SHA-256 metadata mismatch. Expected ${expectedSha256}, stored ${remoteSha256 ?? "missing"}.`
    );
  }

  console.log("R2 verification successful.");
}

