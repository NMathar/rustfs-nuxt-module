# Nuxt RustFS Module

A Nuxt 3/4 module that simplifies the integration of RustFS into Nuxt projects with a TypeScript SDK wrapper.

## Features

- Full TypeScript support with type definitions
- Nuxt-style composables for easy usage
- Server-side and client-side support
- Wrapper around the RustFS TypeScript SDK (based on AWS S3 SDK)
- Simple configuration through `nuxt.config.ts`

## Installation

1. Copy the `nuxt-rustfs` module to your project's `modules` directory

2. Install dependencies:

```bash
npm install @aws-sdk/client-s3
```

## Configuration

Add the module to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['./modules/nuxt-rustfs'],

  rustfs: {
    accessKeyId: process.env.RUSTFS_ACCESS_KEY_ID,
    secretAccessKey: process.env.RUSTFS_SECRET_ACCESS_KEY,
    endpoint: process.env.RUSTFS_ENDPOINT_URL,
    region: 'cn-east-1' // optional, defaults to 'cn-east-1'
  },

  runtimeConfig: {
    rustfs: {
      accessKeyId: process.env.RUSTFS_ACCESS_KEY_ID,
      secretAccessKey: process.env.RUSTFS_SECRET_ACCESS_KEY,
      endpoint: process.env.RUSTFS_ENDPOINT_URL,
      region: 'cn-east-1'
    }
  }
})
```

Create a `.env` file with your RustFS credentials:

```env
RUSTFS_ACCESS_KEY_ID=your_access_key
RUSTFS_SECRET_ACCESS_KEY=your_secret_key
RUSTFS_ENDPOINT_URL=your_rustfs_endpoint
```

## Usage

### In Vue Components (Client-Side)

```vue
<script setup lang="ts">
const rustfs = useRustFS()

// List all buckets
const { data: buckets } = await useAsyncData('buckets', async () => {
  const result = await rustfs.listBuckets()
  return result.success ? result.data : []
})

// Upload a file
async function uploadFile(file: File) {
  const result = await rustfs.uploadObject(
    'my-bucket',
    `uploads/${file.name}`,
    file
  )

  if (result.success) {
    console.log('File uploaded successfully')
  } else {
    console.error('Upload failed:', result.error)
  }
}

// Download as string
async function downloadText(key: string) {
  const result = await rustfs.getObjectAsString('my-bucket', key)
  if (result.success) {
    console.log('File content:', result.data)
  }
}

// List objects in bucket
async function listFiles(bucketName: string) {
  const result = await rustfs.listObjects(bucketName, {
    Prefix: 'uploads/',
    MaxKeys: 100
  })

  if (result.success) {
    console.log('Files:', result.data?.objects)
  }
}
</script>
```

### In Server API Routes

```typescript
// server/api/upload.post.ts
export default defineEventHandler(async (event) => {
  const rustfs = useRustFS(event)
  const body = await readBody(event)

  const result = await rustfs.uploadObject(
    'my-bucket',
    body.key,
    body.content
  )

  return {
    success: result.success,
    error: result.error
  }
})
```

```typescript
// server/api/files.get.ts
export default defineEventHandler(async (event) => {
  const rustfs = useRustFS(event)

  const result = await rustfs.listBuckets()

  return {
    success: result.success,
    buckets: result.data || [],
    error: result.error
  }
})
```

## API Reference

### Bucket Operations

#### `createBucket(bucketName: string, options?)`
Creates a new bucket.

#### `deleteBucket(bucketName: string, options?)`
Deletes an existing bucket.

#### `listBuckets()`
Lists all available buckets.

### Object Operations

#### `uploadObject(bucketName: string, key: string, body: any, options?)`
Uploads an object to a bucket.

#### `downloadObject(bucketName: string, key: string, options?)`
Downloads an object from a bucket.

#### `getObjectAsString(bucketName: string, key: string)`
Downloads an object and converts it to a UTF-8 string.

#### `getObjectAsBuffer(bucketName: string, key: string)`
Downloads an object and returns it as a Buffer.

#### `deleteObject(bucketName: string, key: string, options?)`
Deletes an object from a bucket.

#### `listObjects(bucketName: string, options?)`
Lists objects in a bucket with optional filtering.

#### `headObject(bucketName: string, key: string, options?)`
Retrieves metadata about an object without downloading it.

#### `copyObject(sourceBucket: string, sourceKey: string, destinationBucket: string, destinationKey: string, options?)`
Copies an object from one location to another.

### Advanced Usage

#### Access the raw S3 client

```typescript
const rustfs = useRustFS()
const s3Client = rustfs.getRawClient()
// Use s3Client directly for advanced operations
```

## Return Format

All methods return an object with the following structure:

```typescript
{
  success: boolean
  data?: any      // Present if success is true
  error?: any     // Present if success is false
}
```

## TypeScript Support

The module includes full TypeScript support with type definitions for all methods and return values.

## Requirements

- Nuxt 3 or Nuxt 4
- Active RustFS instance
- RustFS access credentials (obtained from IAM management)

## License

MIT
