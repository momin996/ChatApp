import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppConfigService } from '../core/services/app-config.service';
import { ApiStringResp, AuthTokens, LoginRequestModel, ResetPasswordRequestModel } from './models/auth-api.models';
import { User } from "./models/user.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl: string;

  constructor(private http: HttpClient, appConfig: AppConfigService) {
    this.apiUrl = appConfig.getAPIUrl();
  }

  login(loginRequest: LoginRequestModel): Observable<AuthTokens> {
    const apiEndpoint = `${this.apiUrl}/Auth/Login`;
    return this.http.post<AuthTokens | any>(apiEndpoint, loginRequest);
  }

  getUser() : Observable<User> {
    const apiEndpoint = `${this.apiUrl}/Users/me`;
    return this.http.get<User>(apiEndpoint);
  }

  refreshToken(refreshTokenRequest: AuthTokens) {
    const apiEndpoint = `${this.apiUrl}/Auth/RefreshToken`;
    return this.http.post<AuthTokens | any>(apiEndpoint, refreshTokenRequest);
  }

  forgotPassword(email: string): Observable<ApiStringResp> {
    let params = new HttpParams().set('email', email)
    const apiEndpoint = `${this.apiUrl}/Auth/ForgotPassword`;
    return this.http.get<ApiStringResp>(apiEndpoint, { params });
  }

  resetPassword(resetPassword: ResetPasswordRequestModel): Observable<ApiStringResp> {
    const apiEndpoint = `${this.apiUrl}/Auth/ResetPassword`;
    return this.http.post<ApiStringResp>(apiEndpoint, resetPassword);
  }

  logout(): Observable<void> {
    const apiEndpoint = `${this.apiUrl}/Auth/Logout`;
    return this.http.post<void>(apiEndpoint, {});
  }

}
