import { inject, Injectable, OnDestroy } from '@angular/core';
import { EnvService } from '@core/services/envService/env.service';
import { BehaviorSubject, fromEvent, Subject, takeUntil } from 'rxjs';

interface StorageItem<T> {
  value: T;
  expiresAt?: number;
  version: number;
}

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService implements OnDestroy {
  private envService = inject(EnvService);

  private prefix = this.envService.appName;
  private schemaVersion = 1;

  private storageChanges$ = new BehaviorSubject<{ key: string | null; value: unknown }>({
    key: null,
    value: null,
  });

  private destroy$ = new Subject<void>();
  private cachedKey: CryptoKey | null = null;

  constructor() {
    fromEvent<StorageEvent>(window, 'storage')
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (event) => {
        if (event.key && event.newValue) {
          const payload = await this.decrypt(event.newValue);
          if (!payload) return;

          const parsedPayload: StorageItem<unknown> = JSON.parse(payload);

          this.storageChanges$.next({
            key: event.key.replace(`${this.prefix}:`, ''),
            value: parsedPayload.value,
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async setItem<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
      const payload: StorageItem<T> = { value, expiresAt, version: this.schemaVersion };
      const encrypted = await this.encrypt(JSON.stringify(payload));
      localStorage.setItem(this.wrapKey(key), encrypted);
      this.storageChanges$.next({ key, value });
    } catch (error) {
      console.error(`Error setting item [${key}]`, error);
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const encrypted = localStorage.getItem(this.wrapKey(key));
      if (!encrypted) return null;

      const payload = await this.decrypt(encrypted);
      if (!payload) return null;

      const parsedPayload: StorageItem<T> = JSON.parse(payload);

      if (parsedPayload.version !== this.schemaVersion) {
        this.removeItem(key);
        return null;
      }

      if (parsedPayload.expiresAt && Date.now() > parsedPayload.expiresAt) {
        this.removeItem(key);
        return null;
      }

      return parsedPayload.value;
    } catch (error) {
      console.error(`Error getting item [${key}]`, error);
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(this.wrapKey(key));
    this.storageChanges$.next({ key, value: null });
  }

  clear(): void {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(`${this.prefix}:`))
      .forEach((k) => localStorage.removeItem(k));

    this.storageChanges$.next({ key: null, value: null });
  }

  changes() {
    return this.storageChanges$.asObservable();
  }

  private async getKey(): Promise<CryptoKey> {
    if (this.cachedKey) return this.cachedKey;

    const secret = this.envService.storageKey;
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    this.cachedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode(this.prefix),
        iterations: 100_000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    return this.cachedKey;
  }

  private wrapKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  private async encrypt(plainText: string): Promise<string> {
    const key = await this.getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(plainText)
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return this.arrayBufferToBase64(combined);
  }

  private async decrypt(cipherText: string): Promise<string | null> {
    try {
      const combined = this.base64ToArrayBuffer(cipherText);
      const iv = combined.slice(0, 12);
      const encryptedData = combined.slice(12);

      const key = await this.getKey();
      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedData);
      return new TextDecoder().decode(decrypted);
    } catch (err) {
      console.error('Decryption failed', err);
      return null;
    }
  }

  private arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const len = buffer.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(buffer[i]);
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
    return buffer;
  }
}
