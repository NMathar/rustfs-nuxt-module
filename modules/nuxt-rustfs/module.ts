import { defineNuxtModule, addPlugin, createResolver, addImports, addServerPlugin, addServerHandler } from '@nuxt/kit'

export interface ModuleOptions {
  accessKeyId?: string
  secretAccessKey?: string
  endpoint?: string
  region?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-rustfs',
    configKey: 'rustfs',
    compatibility: {
      nuxt: '^3.0.0 || ^4.0.0'
    }
  },
  defaults: {
    region: 'cn-east-1',
    accessKeyId: '',
    secretAccessKey: '',
    endpoint: ''
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Add runtime config - credentials are server-only
    nuxt.options.runtimeConfig.rustfs = {
      accessKeyId: (options.accessKeyId || process.env.RUSTFS_ACCESS_KEY_ID) || '',
      secretAccessKey: (options.secretAccessKey || process.env.RUSTFS_SECRET_ACCESS_KEY) || '',
      endpoint: (options.endpoint || process.env.RUSTFS_ENDPOINT_URL) || '',
      region: options.region || 'cn-east-1'
    }

    // Public config - only non-sensitive settings
    nuxt.options.runtimeConfig.public.rustfs = {
      region: options.region || 'cn-east-1'
    }

    // Add plugins
    addPlugin(resolver.resolve('./runtime/plugin'))
    addServerPlugin(resolver.resolve('./runtime/server-plugin'))

    // Add composables
    addImports({
      name: 'useRustFS',
      as: 'useRustFS',
      from: resolver.resolve('./runtime/composables/useRustFS')
    })

    // Add server routes from the module
    const routes = [
      {
        route: '/api/rustfs/buckets',
        file: './runtime/server/routes/api/rustfs/buckets'
      },
      {
        route: '/api/rustfs/objects',
        file: './runtime/server/routes/api/rustfs/objects'
      },
      {
        route: '/api/rustfs/upload',
        file: './runtime/server/routes/api/rustfs/upload'
      },
      {
        route: '/api/rustfs/download',
        file: './runtime/server/routes/api/rustfs/download'
      },
      {
        route: '/api/rustfs/head',
        file: './runtime/server/routes/api/rustfs/head'
      },
      {
        route: '/api/rustfs/copy',
        file: './runtime/server/routes/api/rustfs/copy'
      },
      {
        route: '/api/rustfs/upload-url',
        file: './runtime/server/routes/api/rustfs/upload-url.post'
      }
    ]

    for (const r of routes) {
      addServerHandler({
        route: r.route,
        handler: resolver.resolve(r.file)
      })
    }

    // Add type declarations
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: resolver.resolve('./runtime/types') })
    })
  }
})
