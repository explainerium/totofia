export interface StorageDriver {
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
  /** Public URL (or path) the browser can load the file from. */
  publicUrl(key: string): string;
}
