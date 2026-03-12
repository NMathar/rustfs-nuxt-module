export interface RustFSApi {
  listBuckets: () => Promise<any>;
  listObjects: (bucket: string, options?: any) => Promise<any>;
  uploadObject: (
    bucket: string,
    key: string,
    file: File | Buffer | string,
    options?: any,
  ) => Promise<any>;
  directUpload: (
    bucket: string,
    key: string,
    file: File | Buffer | string,
  ) => Promise<any>;
  downloadObject: (bucket: string, key: string) => Promise<Blob>;
  deleteObject: (bucket: string, key: string) => Promise<any>;
  createBucket: (bucketName: string, options?: any) => Promise<any>;
  deleteBucket: (bucketName: string, options?: any) => Promise<any>;
  copyObject: (
    sourceBucket: string,
    sourceKey: string,
    destBucket: string,
    destKey: string,
    options?: any,
  ) => Promise<any>;
  headObject: (bucket: string, key: string) => Promise<any>;
}

export const useRustFS = (): RustFSApi => {
  return {
    listBuckets: () => $fetch("/api/rustfs/buckets"),

    listObjects: (bucket: string, options?: any) =>
      $fetch("/api/rustfs/objects", {
        method: "POST",
        body: { bucket, options },
      }),

    uploadObject: (bucket: string, key: string, file: File, options?: any) => {
      const form = new FormData();

      form.append("bucket", bucket);
      form.append("key", key);
      form.append("file", file);

      if (options) {
        form.append("options", JSON.stringify(options));
      }

      $fetch("/api/rustfs/upload", {
        method: "POST",
        body: form,
      });
    },

    directUpload: async (
      bucket: string,
      key: string,
      file: File | Buffer | string,
    ) => {
      const res = await $fetch<{ success: boolean; data: string }>("/api/rustfs/upload-url", {
        method: "POST",
        body: {
          bucket,
          key,
          contentType: (file as File).type || "application/octet-stream",
        },
      })
      const url = res.data
      if(!url) {
        throw new Error("No upload URL found");
      }

      // direkter Upload zum Storage (rustfs/S3), nicht zu Nuxt
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type":
            (file as File).type || "application/octet-stream",
        },
        body:  file instanceof File ? (await file.arrayBuffer()) as BodyInit : file as BodyInit,
      });
      console.log("response", response);
      
    },

    downloadObject: async (bucket: string, key: string) => {
      const response = await fetch("/api/rustfs/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket, key }),
      });
      if (!response.ok) throw new Error("Download failed");
      return response.blob();
    },

    deleteObject: (bucket: string, key: string) =>
      $fetch("/api/rustfs/objects", {
        method: "DELETE",
        body: { bucket, key },
      }),

    createBucket: (bucketName: string, options?: any) =>
      $fetch("/api/rustfs/buckets", {
        method: "POST",
        body: { bucketName, options },
      }),

    deleteBucket: (bucketName: string, options?: any) =>
      $fetch("/api/rustfs/buckets", {
        method: "DELETE",
        body: { bucketName, options },
      }),

    copyObject: (
      sourceBucket: string,
      sourceKey: string,
      destBucket: string,
      destKey: string,
      options?: any,
    ) =>
      $fetch("/api/rustfs/copy", {
        method: "POST",
        body: { sourceBucket, sourceKey, destBucket, destKey, options },
      }),

    headObject: (bucket: string, key: string) =>
      $fetch("/api/rustfs/head", {
        method: "POST",
        body: { bucket, key },
      }),
  } as RustFSApi;
};
