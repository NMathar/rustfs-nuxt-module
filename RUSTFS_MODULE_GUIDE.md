# RustFS Nuxt Module - Implementierungsguide

## Überblick

Das `nuxt-rustfs` Modul ist ein vollständiges Nuxt 3/4 Modul, das die Integration von RustFS in Nuxt-Projekte vereinfacht. Es bietet einen TypeScript SDK Wrapper und Nuxt-typische Composables für einfache Verwendung.

## Modulstruktur

```
modules/nuxt-rustfs/
├── module.ts                           # Haupt-Modul-Definition
├── package.json                        # Modul-Abhängigkeiten
├── tsconfig.json                       # TypeScript-Konfiguration
├── README.md                           # Ausführliche Dokumentation
└── runtime/
    ├── rustfs-client.ts               # RustFS Client Wrapper
    ├── plugin.ts                      # Client-seitiges Plugin
    ├── server-plugin.ts               # Server-seitiges Plugin
    ├── types.d.ts                     # TypeScript-Typdefinitionen
    ├── composables/
    │   └── useRustFS.ts              # Composable für Client-Nutzung
    └── server/
        └── utils/
            └── rustfs.ts             # Server-Utility-Funktion

```

## Funktionen

### 1. RustFS Client Wrapper (`rustfs-client.ts`)

Der Client-Wrapper bietet folgende Methoden:

**Bucket-Operationen:**
- `createBucket(bucketName, options?)` - Bucket erstellen
- `deleteBucket(bucketName, options?)` - Bucket löschen
- `listBuckets()` - Alle Buckets auflisten

**Objekt-Operationen:**
- `uploadObject(bucket, key, body, options?)` - Datei hochladen
- `downloadObject(bucket, key, options?)` - Objekt herunterladen
- `getObjectAsString(bucket, key)` - Objekt als String abrufen
- `getObjectAsBuffer(bucket, key)` - Objekt als Buffer abrufen
- `deleteObject(bucket, key, options?)` - Objekt löschen
- `listObjects(bucket, options?)` - Objekte auflisten
- `headObject(bucket, key, options?)` - Objekt-Metadaten abrufen
- `copyObject(srcBucket, srcKey, dstBucket, dstKey, options?)` - Objekt kopieren

**Erweiterte Nutzung:**
- `getRawClient()` - Zugriff auf den zugrunde liegenden S3Client

Alle Methoden geben ein einheitliches Response-Format zurück:
```typescript
{
  success: boolean
  data?: any      // Bei Erfolg
  error?: any     // Bei Fehler
}
```

### 2. Nuxt Composable (`useRustFS()`)

**Client-seitige Verwendung:**
```vue
<script setup>
const rustfs = useRustFS()

// Buckets auflisten
const { data: buckets } = await useAsyncData('buckets', async () => {
  const result = await rustfs.listBuckets()
  return result.success ? result.data : []
})

// Datei hochladen
async function uploadFile(file: File) {
  const result = await rustfs.uploadObject('my-bucket', `uploads/${file.name}`, file)
  if (result.success) {
    console.log('Upload erfolgreich')
  }
}
</script>
```

### 3. Server-seitige Nutzung

**In API-Routes:**
```typescript
// server/api/example.ts
export default defineEventHandler(async (event) => {
  const rustfs = useRustFS(event)

  const result = await rustfs.listBuckets()

  return {
    success: result.success,
    data: result.data
  }
})
```

## Konfiguration

### 1. Modul in `nuxt.config.ts` registrieren:

```typescript
export default defineNuxtConfig({
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
```

### 2. Umgebungsvariablen in `.env` definieren:

```env
RUSTFS_ACCESS_KEY_ID=your_access_key
RUSTFS_SECRET_ACCESS_KEY=your_secret_key
RUSTFS_ENDPOINT_URL=https://your-rustfs-endpoint.com
```

## Beispiel-Implementierungen

### Beispiel 1: Demo-Seite (`pages/index.vue`)

Die Demo-Seite zeigt:
- Buckets auflisten
- Dateien hochladen
- Objekte in einem Bucket auflisten
- Fehlerbehandlung
- Loading-States

### Beispiel 2: API-Endpunkte

**`server/api/buckets.get.ts`** - Buckets abrufen
**`server/api/objects.get.ts`** - Objekte in einem Bucket abrufen
**`server/api/upload.post.ts`** - Datei hochladen

## TypeScript-Unterstützung

Das Modul bietet vollständige TypeScript-Unterstützung:

```typescript
// Automatische Typen für den Client
const rustfs = useRustFS()  // Typ: RustFSClient

// Typen für Rückgabewerte
interface BucketInfo {
  Name?: string
  CreationDate?: Date
}

interface ObjectInfo {
  Key?: string
  LastModified?: Date
  Size?: number
  ETag?: string
  StorageClass?: string
}
```

## Fehlerbehandlung

Alle Methoden verwenden ein einheitliches Fehlerbehandlungsformat:

```typescript
const result = await rustfs.uploadObject(bucket, key, file)

if (result.success) {
  // Erfolg
  console.log(result.data)
} else {
  // Fehler
  console.error(result.error)
}
```

## Installation von Dependencies

Das Modul benötigt:
- `@aws-sdk/client-s3` (bereits in package.json hinzugefügt)
- `@nuxt/kit` (Peer-Dependency)

Installation:
```bash
npm install
```

## Build & Deploy

```bash
# Build für Produktion
npm run build

# Preview
npm run preview
```

## Wichtige Hinweise

1. **Credentials-Sicherheit**: Niemals Credentials im Code oder Repository committen
2. **Environment Variables**: Immer über `.env` und `runtimeConfig` arbeiten
3. **Error Handling**: Immer `result.success` prüfen vor Zugriff auf `result.data`
4. **TypeScript**: Vollständige Typisierung für bessere Entwicklererfahrung
5. **SSR-Kompatibilität**: Funktioniert sowohl client- als auch server-seitig

## Nächste Schritte

1. `.env` Datei mit echten RustFS-Credentials erstellen
2. Credentials von RustFS IAM Management abrufen
3. Testen der Funktionalität mit echten Daten
4. Anpassen der Demo-Seite nach Bedarf
5. Eigene API-Endpunkte und Pages erstellen

## Support

Bei Problemen:
- Prüfen Sie die RustFS-Dokumentation: https://docs.rustfs.com
- Überprüfen Sie Ihre Credentials und Endpoint-URL
- Konsole auf Fehlermeldungen prüfen
