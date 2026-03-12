import { defineNitroPlugin } from '#imports'
import { useRuntimeConfig } from '#imports'
import { RustFSClient } from './rustfs-client'

export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig()

  const rustfsConfig = {
    accessKeyId: config.rustfs.accessKeyId,
    secretAccessKey: config.rustfs.secretAccessKey,
    endpoint: config.rustfs.endpoint,
    region: config.rustfs.region || 'cn-east-1'
  }

  if (!rustfsConfig.accessKeyId || !rustfsConfig.secretAccessKey || !rustfsConfig.endpoint) {
    console.warn('RustFS Server: Missing configuration. Please provide accessKeyId, secretAccessKey, and endpoint.')
  }

  const rustfsClient = new RustFSClient(rustfsConfig)

  nitroApp.hooks.hook('request', (event) => {
    event.context.rustfs = rustfsClient
  })
})
