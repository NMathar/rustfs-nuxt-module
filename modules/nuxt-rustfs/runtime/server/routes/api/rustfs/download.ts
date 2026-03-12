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

    const result = await rustfs.downloadObject(body.bucket, body.key)

    if (!result.success || !result.data?.Body) {
      throw createError({
        statusCode: 404,
        message: 'Failed to download object',
        data: result.error
      })
    }

    const bodyContents = await result.data.Body.transformToByteArray()

    setResponseHeader(event, 'Content-Type', 'application/octet-stream')
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="${body.key}"`)

    return bodyContents
  } catch (error: any) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      message: 'Internal server error',
      data: error
    })
  }
})
