import { Injectable } from '@angular/core';
import { CONFIG } from '../../config/envConfig/env.config';
import { EnvConfig } from '../../config/envConfig/env.schema';

@Injectable({
  providedIn: 'root',
})
export class EnvService {
  private readonly envConfig: EnvConfig = CONFIG;

  get apiUrl(): string {
    return this.envConfig.NG_APP_API_URL;
  }

  get appName(): string {
    return this.envConfig.NG_APP_APP_NAME;
  }

  get analyticsEnabled(): boolean {
    return this.envConfig.NG_APP_ENABLE_ANALYTICS;
  }

  get isDevelopment(): boolean {
    return import.meta.env.NODE_ENV === 'development';
  }

  get storageKey(): string {
    return this.envConfig.NG_APP_STORAGE_KEY;
  }
}
