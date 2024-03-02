import { Injectable } from '@angular/core';

import { Environment } from '../../../environments/environment';

type AppEnv = typeof Environment;
export type AuthKeys = {
  accessTokenKey: string,
  refreshTokenKey: string
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  private getEnvironment(): AppEnv {
    return Environment;
  }

  isProd(): boolean {
    return Environment.production;
  }

  getVersion(): string {
    return Environment.appVersion;
  }

  getAPIUrl(): string {
    return Environment?.apiUrl ?? '';
  }

  getAuthSecretKeys(): AuthKeys {
    return Environment?.auth;
  }
}
