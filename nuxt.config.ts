// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },

  modules: ['./modules/nuxt-rustfs'],

  rustfs: {
    accessKeyId: process.env.RUSTFS_ACCESS_KEY_ID,
    secretAccessKey: process.env.RUSTFS_SECRET_ACCESS_KEY,
    endpoint: process.env.RUSTFS_ENDPOINT_URL,
    region: 'cn-east-1'
  },

  runtimeConfig: {
    rustfs: {
      accessKeyId: process.env.RUSTFS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.RUSTFS_SECRET_ACCESS_KEY || '',
      endpoint: process.env.RUSTFS_ENDPOINT_URL || '',
      region: 'cn-east-1'
    }
  }
})
