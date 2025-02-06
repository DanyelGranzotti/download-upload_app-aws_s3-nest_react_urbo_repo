import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { PassThrough } from 'stream';

@Injectable()
export class FilesService {
  AWS_S3_BUCKET = 'bucket';
  s3 = new AWS.S3({
    accessKeyId: 'your-access-key-id',
    secretAccessKey: 'your-secret-access-key',
    endpoint: 'http://localhost:4566',
    s3ForcePathStyle: true,
    region: 'us-east-1',
  });

  async uploadStream(fileBuffer: Buffer, filename: string) {
    const pass = new PassThrough();

    const uploadParams = {
      Bucket: this.AWS_S3_BUCKET,
      Key: filename,
      Body: pass,
    };

    console.time('Upload Stream Time');

    const upload = this.s3.upload(uploadParams).promise();
    pass.end(fileBuffer);

    try {
      const result = await upload;
      console.timeEnd('Upload Stream Time');
      return result;
    } catch (error) {
      console.error('Erro no upload:', error);

      console.timeEnd('Upload Stream Time');

      throw error;
    }
  }

  async upload(file) {
    const { originalname } = file;

    console.time('Upload Time');

    const result = await this.s3_upload(
      file.buffer,
      this.AWS_S3_BUCKET,
      originalname,
      file.mimetype,
    );

    console.timeEnd('Upload Time');

    return result;
  }

  async s3_upload(
    file: Buffer,
    bucket: string,
    name: string,
    mimetype: string,
  ) {
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
      ACL: 'public-read',
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: 'us-east-1',
      },
    };

    try {
      let s3Response = await this.s3.upload(params).promise();
      return s3Response;
    } catch (e) {
      console.log(e);
    }
  }
}
