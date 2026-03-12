export default defineEventHandler(async (event) => {
  const rustfs = event.context.rustfs

  if (!rustfs) {
    throw createError({
      statusCode: 500,
      message: 'RustFS client not initialized'
    })
  }

  try {
    const body = await readBody(event)

    if (!body.bucket || !body.key) {
      throw createError({
        statusCode: 400,
        message: 'Bucket and key are required'
      })
    }

    const result = await rustfs.headObject(body.bucket, body.key, body.options)

    if (!result.success) {
      throw createError({
        statusCode: 404,
        message: 'Object not found',
        data: result.error
      })
    }

    return {
      success: true,
      data: result.data
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      message: 'Internal server error',
      data: error
    })
  }
})
