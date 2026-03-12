interface MultipartFormFile {
  name: string;
  filename?: string;
  type?: string;
  data: Buffer;
}

export default defineEventHandler(async (event) => {
  const rustfs = event.context.rustfs;

  if (!rustfs) {
    throw createError({
      statusCode: 500,
      message: "RustFS client not initialized",
    });
  }

  try {
    const form = await readMultipartFormData(event);

    const bucket = form?.find((f) => f.name === "bucket")?.data?.toString();
    const key = form?.find((f) => f.name === "key")?.data?.toString();
    const options = form?.find((f) => f.name === "options")?.data?.toString();
    const file = form?.find((f) => f.name === "file") as MultipartFormFile | undefined;

    if (!bucket || !key || !file) {
      throw createError({
        statusCode: 400,
        message: "Bucket, key, and file are required",
      });
    }

    const result = await rustfs.uploadObject(
      bucket,
      file.filename || key,
      file.data,
      options ? JSON.parse(options) : undefined,
    );

    if (!result.success) {
      throw createError({
        statusCode: 500,
        message: "Failed to upload object",
        data: result.error,
      });
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error: any) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      message: "Internal server error",
      data: error,
    });
  }
});
