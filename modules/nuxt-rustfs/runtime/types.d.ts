import type { RustFSClient } from './rustfs-client'

declare module 'h3' {
  interface H3EventContext {
    rustfs: RustFSClient
  }
}

declare module '@nuxt/schema' {
  interface RuntimeConfig {
    rustfs: {
      accessKeyId: string
      secretAccessKey: string
      endpoint: string
      region: string
    }
  }
  interface PublicRuntimeConfig {
    rustfs: {
      region: string
    }
  }
}

export {}
