import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, PutObjectCommandOutput } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config/config';
import   File from 'multer'; // Explicit import for Multer types

export class S3Service {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
      region: config.aws.region,
    });
  }

  async uploadFile(file: Express.Multer.File, s3Key: string): Promise<PutObjectCommandOutput> {
    const command = new PutObjectCommand({
      Bucket: 'your-bucket-name',
      Key: s3Key,
      Body: file.buffer, // Assuming file is uploaded as a buffer
      ContentType: file.mimetype
    });

    try {
      const response = await this.s3.send(command);
      return response; // Returns the PutObjectCommandOutput object
    } catch (error) {
      throw new Error(`S3 upload failed: ${error}`);
    }
  }


  async deleteFile(key: string) {
    const params = {
      Bucket: config.aws.bucketName,
      Key: key,
    };

    const command = new DeleteObjectCommand(params);
    return this.s3.send(command);
  }

  async getSignedUrl(key: string, expiresIn = 3600) {
    const params = {
      Bucket: config.aws.bucketName,
      Key: key,
    };

    const command = new GetObjectCommand(params);
    return getSignedUrl(this.s3, command, { expiresIn });
  }
}

export const s3Service = new S3Service();
