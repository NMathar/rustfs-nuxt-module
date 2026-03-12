import { defineEventHandler, readBody } from "h3";

export default defineEventHandler(async (event) => {
  const rustfs = event.context.rustfs;

  if (!rustfs) {
    throw createError({
      statusCode: 500,
      message: "RustFS client not initialized",
    });
  }
  try {
    const body = await readBody(event);

	if (!body.bucket || !body.key) {
	  throw createError({
		statusCode: 400,
		message: "Bucket and key are required",
	  });
	}

	const url = await rustfs.createUploadUrl(body.bucket, body.key, body.contentType);

    return url;
  } catch (error: any) {

	throw createError({
	  statusCode: 500,
	  message: "Failed to get upload URL",
	  data: error,
	});
  }
});
