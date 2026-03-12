import type { H3Event } from 'h3'
import type { RustFSClient } from '../../rustfs-client'

export const useRustFS = (event: H3Event): RustFSClient => {
  if (!event.context.rustfs) {
    throw new Error('RustFS client not initialized in server context.')
  }
  return event.context.rustfs as RustFSClient
}
