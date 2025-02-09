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
    let Key = `${id}.${actionType}`;

    if (actionType === S3ActionType.E_BOOK) {
      ContentType = 'application/epub+zip';
    } else if (actionType === S3ActionType.COVER_ART) {
      ContentType = 'image/jpeg';
    } else if (actionType === S3ActionType.PLAIN_TEXT) {
      ContentType = 'text/plain';
    }

    const data = await response.arrayBuffer();

    const putCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key,
      Body: Buffer.from(data),
      ContentType,
      CacheControl: 'public, immutable, max-age=31536000',
    });

    await s3.send(putCommand);

    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`;
  },
};
