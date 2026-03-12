export default defineEventHandler(async (event) => {
  const rustfs = event.context.rustfs

  if (!rustfs) {
    throw createError({
      statusCode: 500,
      message: 'RustFS client not initialized'
    })
  }

  try {
    if (event.node.req.method === 'POST') {
      const body = await readBody(event)

      if (!body.bucket) {
        throw createError({
          statusCode: 400,
          message: 'Bucket name is required'
        })
      }

      const result = await rustfs.listObjects(body.bucket, body.options)

      if (!result.success) {
        throw createError({
          statusCode: 500,
          message: 'Failed to list objects',
          data: result.error
        })
      }

      return {
        success: true,
        data: result.data
      }
    }

    if (event.node.req.method === 'DELETE') {
      const body = await readBody(event)

      if (!body.bucket || !body.key) {
        throw createError({
          statusCode: 400,
          message: 'Bucket and key are required'
        })
      }

      const result = await rustfs.deleteObject(body.bucket, body.key, body.options)

      if (!result.success) {
        throw createError({
          statusCode: 500,
          message: 'Failed to delete object',
          data: result.error
        })
      }

      return {
        success: true,
        data: result.data
      }
    }

    throw createError({
      statusCode: 405,
      message: 'Method not allowed'
    })
  } catch (error: any) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      message: 'Internal server error',
      data: error
    })
  }
})
