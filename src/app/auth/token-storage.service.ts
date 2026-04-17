import { Injectable } from '@angular/core';
import { AuthTokens, Token } from './models/auth-api.models';

const TOKEN_KEY = 'auth_tokens';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  // ===============================
  // Core Storage
  // ===============================

  setTokens(tokens: AuthTokens): void {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  }

  getTokens(): AuthTokens | null {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthTokens;
    } catch {
      this.clearTokens();
      return null;
    }
  }

  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  // ===============================
  // Access Helpers
  // ===============================

  getAccessToken(): Token | null {
    return this.getTokens()?.accessToken ?? null;
  }

  getRefreshToken(): Token | null {
    return this.getTokens()?.refreshToken ?? null;
  }

  getAccessTokenValue(): string | null {
    return this.getAccessToken()?.token ?? null;
  }

  // ===============================
  // Expiry Logic
  // ===============================

  isTokenExpired(expiryDate: string): boolean {
    return new Date(expiryDate).getTime() <= Date.now();
  }

  isAccessTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    return this.isTokenExpired(token.expiryDate);
  }

  isRefreshTokenExpired(): boolean {
    const token = this.getRefreshToken();
    if (!token) return true;
    return this.isTokenExpired(token.expiryDate);
  }

  // ===============================
  // Validity Checks
  // ===============================

  hasValidAccessToken(): boolean {
    return !!this.getAccessToken() && !this.isAccessTokenExpired();
  }

  hasValidRefreshToken(): boolean {
    return !!this.getRefreshToken() && !this.isRefreshTokenExpired();
  }
}