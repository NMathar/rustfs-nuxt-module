<template>
  <div class="container">
    <h1>RustFS Nuxt Module Demo</h1>

    <section class="section">
      <h2>Buckets</h2>
      <button @click="loadBuckets" :disabled="loading">
        {{ loading ? 'Loading...' : 'Load Buckets' }}
      </button>

      <div v-if="buckets.length > 0" class="results">
        <h3>Available Buckets:</h3>
        <ul>
          <li v-for="bucket in buckets" :key="bucket.Name">
            {{ bucket.Name }} (Created: {{ bucket.CreationDate }})
          </li>
        </ul>
      </div>

      <div v-if="error" class="error">
        Error: {{ error }}
      </div>
    </section>

    <section class="section">
      <h2>Upload File</h2>
      <input type="file" @change="handleFileSelect" />
      <button @click="uploadFile" :disabled="!selectedFile || uploading">
        {{ uploading ? 'Uploading...' : 'Upload to RustFS' }}
      </button>

      <div v-if="uploadSuccess" class="success">
        File uploaded successfully!
      </div>
    </section>

    <section class="section">
      <h2>List Objects</h2>
      <input
        v-model="bucketName"
        type="text"
        placeholder="Enter bucket name"
      />
      <button @click="loadObjects" :disabled="!bucketName || loadingObjects">
        {{ loadingObjects ? 'Loading...' : 'List Objects' }}
      </button>

      <div v-if="objects.length > 0" class="results">
        <h3>Objects in {{ bucketName }}:</h3>
        <ul>
          <li v-for="obj in objects" :key="obj.Key">
            {{ obj.Key }} ({{ formatBytes(obj.Size || 0) }})
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const rustfs = useRustFS()

const buckets = ref<Array<{ Name?: string; CreationDate?: Date }>>([])
const objects = ref<Array<{ Key?: string; Size?: number }>>([])
const loading = ref(false)
const loadingObjects = ref(false)
const uploading = ref(false)
const uploadSuccess = ref(false)
const error = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const bucketName = ref('')

async function loadBuckets() {
  loading.value = true
  error.value = null

  try {
    const result = await rustfs.listBuckets()
    if (result.success) {
      buckets.value = result.data
    } else {
      error.value = result.error?.message || 'Failed to load buckets'
    }
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
    uploadSuccess.value = false
  }
}

async function uploadFile() {
  if (!selectedFile.value || !bucketName.value) return

  uploading.value = true
  uploadSuccess.value = false
  error.value = null

  try {
    const result = await rustfs.directUpload(
      bucketName.value,
      `${selectedFile.value.name}`,
      selectedFile.value
    )

    if (result.success) {
      uploadSuccess.value = true
      selectedFile.value = null
    } else {
      error.value = result.error?.message || 'Upload failed'
    }
  } catch (e: any) {
    error.value = e.message
  } finally {
    uploading.value = false
  }
}

async function loadObjects() {
  if (!bucketName.value) return

  loadingObjects.value = true
  error.value = null

  try {
    const result = await rustfs.listObjects(bucketName.value)
    if (result.success && result.data) {
      objects.value = result.data.objects
    } else {
      error.value = result.error?.message || 'Failed to load objects'
    }
  } catch (e: any) {
    error.value = e.message
  } finally {
    loadingObjects.value = false
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
}

h1 {
  color: #2c3e50;
  margin-bottom: 2rem;
}

.section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

h2 {
  color: #34495e;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

h3 {
  color: #34495e;
  margin-top: 1rem;
  font-size: 1.2rem;
}

button {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 0.5rem;
}

button:hover:not(:disabled) {
  background: #2980b9;
}

button:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

input[type="text"],
input[type="file"] {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 0.5rem;
  font-size: 1rem;
}

input[type="text"] {
  width: 300px;
}

.results {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 4px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 0.5rem;
  border-bottom: 1px solid #ecf0f1;
}

li:last-child {
  border-bottom: none;
}

.error {
  margin-top: 1rem;
  padding: 1rem;
  background: #e74c3c;
  color: white;
  border-radius: 4px;
}

.success {
  margin-top: 1rem;
  padding: 1rem;
  background: #2ecc71;
  color: white;
  border-radius: 4px;
}
</style>
