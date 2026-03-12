# Nuxt + RustFS Example Application

This repository demonstrates how to build a Nuxt 3 application that integrates with [RustFS](https://rustfs.example.com) using a custom Nuxt module. The `nuxt-rustfs` module provides a thin TypeScript wrapper around the RustFS (S3‑compatible) SDK and exposes Vue composables and helpers for both client- and server-side usage.

> 🔧 The example is built on top of the Nuxt 3 minimal starter template and includes a fully working module under `modules/nuxt-rustfs`.

---

## 📁 Project Structure

```
app.vue
nuxt.config.ts
package.json
modules/nuxt-rustfs/          # custom RustFS integration module
  ├─ runtime/                 # composables, plugins, server utilities
  └─ README.md                # module-specific documentation
pages/                         # example pages
server/                        # sample API routes
RUSTFS_MODULE_GUIDE.md        # internal notes and guide
```

---

## 🚀 Getting Started

1. **Install dependencies**
   ```bash
   npm install
   # or yarn install
   # or pnpm install
   ```

2. **Configure environment variables**
   Create a `.env` file in the project root (see `modules/nuxt-rustfs/README.md` for details):
   ```env
   RUSTFS_ACCESS_KEY_ID=your_access_key
   RUSTFS_SECRET_ACCESS_KEY=your_secret_key
   RUSTFS_ENDPOINT_URL=https://your-rustfs-endpoint
   RUSTFS_REGION=cn-east-1        # optional, defaults to cn-east-1
   ```

3. **Enable the module**
   Add the local module and runtime configuration to `nuxt.config.ts`:
   ```ts
   export default defineNuxtConfig({
     modules: ['./modules/nuxt-rustfs'],
     rustfs: {
       accessKeyId: process.env.RUSTFS_ACCESS_KEY_ID,
       secretAccessKey: process.env.RUSTFS_SECRET_ACCESS_KEY,
       endpoint: process.env.RUSTFS_ENDPOINT_URL,
       region: process.env.RUSTFS_REGION || 'cn-east-1'
     },
     runtimeConfig: {
       rustfs: {
         accessKeyId: process.env.RUSTFS_ACCESS_KEY_ID,
         secretAccessKey: process.env.RUSTFS_SECRET_ACCESS_KEY,
         endpoint: process.env.RUSTFS_ENDPOINT_URL,
         region: process.env.RUSTFS_REGION || 'cn-east-1'
       }
     }
   })
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) to explore the example app.

---

## 📦 What’s Included

- **RustFS Nuxt module** with full TypeScript support
- **Composable `useRustFS()`** for interacting with buckets and objects
- **Server API helpers** to call RustFS from server routes
- **Example pages** showing uploads, downloads, listings, etc.

For detailed module usage see `modules/nuxt-rustfs/README.md`.

---

## 📝 Usage Examples

### Client-side (Vue component)
```vue
<script setup lang="ts">
const rustfs = useRustFS()

async function listBuckets() {
  const res = await rustfs.listBuckets()
  console.log(res.data)
}
</script>
```

### Server-side (API route)
```ts
export default defineEventHandler(async ev => {
  const rustfs = useRustFS(ev)
  return await rustfs.listBuckets()
})
```

---

## 💡 Tips & Notes

- The module wraps the official AWS SDK client so you can access `rustfs.getRawClient()` for advanced operations.
- All methods return a `{ success: boolean, data?, error? }` shape for easy error handling.

---

## 🧩 Extending the Module

You can copy `modules/nuxt-rustfs` into your own Nuxt project or publish it to npm. Refer to `RUSTFS_MODULE_GUIDE.md` for development notes.

---

## 📚 Resources

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [AWS S3 SDK](https://www.npmjs.com/package/@aws-sdk/client-s3)

---

### 🏁 License
This example project is provided under the MIT License.

