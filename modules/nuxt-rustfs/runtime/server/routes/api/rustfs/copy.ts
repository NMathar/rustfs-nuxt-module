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

    if (!body.sourceBucket || !body.sourceKey || !body.destBucket || !body.destKey) {
      throw createError({
        statusCode: 400,
        message: 'sourceBucket, sourceKey, destBucket, and destKey are required'
      })
    }

    const result = await rustfs.copyObject(
      body.sourceBucket,
      body.sourceKey,
      body.destBucket,
      body.destKey,
      body.options
    )

    if (!result.success) {
      throw createError({
        statusCode: 500,
        message: 'Failed to copy object',
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
