import { s3 } from '@/server/clients/s3Client';
import { S3ActionType } from '@/shared';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export const BookService = {
  downloadToS3: async (downloadUrl: string, id: string | number, actionType: S3ActionType) => {
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      throw new Error('Failed to fetch from Project Gutenberg');
    }

    let ContentType: string;

    if (actionType === S3ActionType.eBook) {
      ContentType = 'application/epub+zip';
    } else if (actionType === S3ActionType.CoverArt) {
      ContentType = 'image/jpeg';
    }

    const Key = `${id}.${actionType}`;

    const data = await response.arrayBuffer();

    const putCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key,
      Body: Buffer.from(data),
      ContentType,
      CacheControl: 'public, immutable, max-age=31536000',
    });

    await s3.send(putCommand);

    // return `https://amazonaws.com/${process.env.AWS_S3_BUCKET}/${Key}`;
  },
};
