import { ApiResponse } from "src/app/shared/models/api-response.model";

export interface AuthTokens {
    accessToken: Token;
    refreshToken: Token;
}

export interface Token {
    token: string;
    expiryDate: string;
}

export interface LoginRequestModel {
    email: string;
    password: string;
}

export interface ResetPasswordRequestModel {
    email: string;
    password: string;
    confirmPassword: string;
    token: string
}

export interface ApiStringResp extends ApiResponse {
    data: string | null
}