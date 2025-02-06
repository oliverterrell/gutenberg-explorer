import { S3Client } from '@aws-sdk/client-s3';

const s3Options = {
  region: process.env.AWS_REGION,
};

export const s3 = new S3Client(s3Options);
