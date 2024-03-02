import { Injectable } from '@angular/core';
import { AppConfigService } from './app-config.service';
import { AuthTokens, Token } from 'src/app/auth/models/auth-api.models';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  private accessTokenKey: string;
  private refreshTokenKey: string

  constructor(private appConfig: AppConfigService) {
    var secretKeys = this.appConfig.getAuthSecretKeys()
    this.refreshTokenKey = secretKeys.refreshTokenKey;
    this.accessTokenKey = secretKeys.accessTokenKey;
  }

  getValue(key: string) {
    const value = localStorage.getItem(key);
    if(value==null) return null;
    return JSON.parse(value);
  }

  setValue(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  removeItem(key: string) {
    localStorage.removeItem(key);
  }

  getAccessToken(): Token {
    return this.getValue(this.accessTokenKey);
  }

  saveAccessToken(token: Token) {
    this.setValue(this.accessTokenKey, token);
  }

  getRefreshToken(): Token {
    return this.getValue(this.refreshTokenKey);
  }

  saveRefreshToken(token: Token) {
    this.setValue(this.refreshTokenKey, token);
  }

  getTokens(): AuthTokens | null {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    if(accessToken == null || refreshToken == null) return null;

    return {
      accessToken,
      refreshToken
    }
  }

  saveTokens(authTokens: AuthTokens) {
    this.saveAccessToken(authTokens.accessToken);
    this.saveRefreshToken(authTokens.refreshToken);
  }

  removeTokens() {
    this.removeItem(this.accessTokenKey);
    this.removeItem(this.refreshTokenKey);
  }
}
