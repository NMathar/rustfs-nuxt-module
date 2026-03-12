import { S3Client } from '@aws-sdk/client-s3'
import {
  CreateBucketCommand,
  DeleteBucketCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
  type CreateBucketCommandInput,
  type DeleteBucketCommandInput,
  type ListObjectsV2CommandInput,
  type PutObjectCommandInput,
  type GetObjectCommandInput,
  type DeleteObjectCommandInput,
  type HeadObjectCommandInput,
  type CopyObjectCommandInput
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export interface RustFSConfig {
  accessKeyId: string
  secretAccessKey: string
  endpoint: string
  region?: string
}

export interface BucketInfo {
  Name?: string
  CreationDate?: Date
}

export interface ObjectInfo {
  Key?: string
  LastModified?: Date
  Size?: number
  ETag?: string
  StorageClass?: string
}

export interface ListObjectsResult {
  objects: ObjectInfo[]
  isTruncated: boolean
  nextContinuationToken?: string
}

export class RustFSClient {
  readonly client: S3Client

  constructor(config: RustFSConfig) {
    this.client = new S3Client({
      region: config.region || 'cn-east-1',
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      },
      endpoint: config.endpoint,
      forcePathStyle: true
    })
  }

  async createBucket(bucketName: string, options?: Partial<CreateBucketCommandInput>) {
    try {
      const command = new CreateBucketCommand({
        Bucket: bucketName,
        ...options
      })
      const response = await this.client.send(command)
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error }
    }
  }

  async deleteBucket(bucketName: string, options?: Partial<DeleteBucketCommandInput>) {
    try {
      const command = new DeleteBucketCommand({
        Bucket: bucketName,
        ...options
      })
      const response = await this.client.send(command)
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error }
    }
  }

  async listBuckets() {
    try {
      const command = new ListBucketsCommand({})
      const response = await this.client.send(command)
      return {
        success: true,
        data: response.Buckets as BucketInfo[] || []
      }
    } catch (error) {
      return { success: false, error, data: [] }
    }
  }

  async listObjects(
    bucketName: string,
    options?: Partial<ListObjectsV2CommandInput>
  ): Promise<{ success: boolean; data?: ListObjectsResult; error?: any }> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        ...options
      })
      
      const response = await this.client.send(command)      

      return {
        success: true,
        data: {
          objects: response.Contents as ObjectInfo[] || [],
          isTruncated: response.IsTruncated || false,
          nextContinuationToken: response.NextContinuationToken
        }
      }
    } catch (error) {
      return { success: false, error }
    }
  }

  async uploadObject(
    bucketName: string,
    key: string,
    body: PutObjectCommandInput['Body'],
    options?: Partial<PutObjectCommandInput>
  ) {
    try {
      console.log("Command data: ", {
        Bucket: bucketName,
        Key: key,
        Body: body,
        ...options
      });
      
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ...options
      })
      const response = await this.client.send(command)
      console.log('uploadObject response', response);
      
      return { success: true, data: response }
    } catch (error) {
      console.log('uploadObject error', error);
      
      return { success: false, error }
    }
  }

  async createUploadUrl(bucket: string, key: string, contentType: string) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType
      })
      const url = await getSignedUrl(this.client, command, { expiresIn: 3600 })
      return { success: true, data: url }
    } catch (error) {
      return { success: false, error }
    }
  }

  async downloadObject(
    bucketName: string,
    key: string,
    options?: Partial<GetObjectCommandInput>
  ) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
        ...options
      })
      const response = await this.client.send(command)
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error }
    }
  }

  async getObjectAsString(bucketName: string, key: string) {
    try {
      const result = await this.downloadObject(bucketName, key)
      if (!result.success || !result.data?.Body) {
        return { success: false, error: 'Failed to download object' }
      }
      const bodyContents = await result.data.Body.transformToString()
      return { success: true, data: bodyContents }
    } catch (error) {
      return { success: false, error }
    }
  }

  async getObjectAsBuffer(bucketName: string, key: string) {
    try {
      const result = await this.downloadObject(bucketName, key)
      if (!result.success || !result.data?.Body) {
        return { success: false, error: 'Failed to download object' }
      }
      const bodyContents = await result.data.Body.transformToByteArray()
      return { success: true, data: Buffer.from(bodyContents) }
    } catch (error) {
      return { success: false, error }
    }
  }

  async deleteObject(
    bucketName: string,
    key: string,
    options?: Partial<DeleteObjectCommandInput>
  ) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
        ...options
      })
      const response = await this.client.send(command)
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error }
    }
  }

  async headObject(
    bucketName: string,
    key: string,
    options?: Partial<HeadObjectCommandInput>
  ) {
    try {
      const command = new HeadObjectCommand({
        Bucket: bucketName,
        Key: key,
        ...options
      })
      const response = await this.client.send(command)
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error }
    }
  }

  async copyObject(
    sourceBucket: string,
    sourceKey: string,
    destinationBucket: string,
    destinationKey: string,
    options?: Partial<CopyObjectCommandInput>
  ) {
    try {
      const command = new CopyObjectCommand({
        CopySource: `${sourceBucket}/${sourceKey}`,
        Bucket: destinationBucket,
        Key: destinationKey,
        ...options
      })
      const response = await this.client.send(command)
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error }
    }
  }

  getRawClient(): S3Client {
    return this.client
  }
}
