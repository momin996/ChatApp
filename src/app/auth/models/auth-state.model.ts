export enum TokenStatus {
    PENDING = 'PENDING',
    VALIDATING = 'VALIDATING',
    VALID = 'VALID',
    INVALID = 'INVALID',
}

export interface AuthState {
    isAuthenticated: boolean,
    tokenStatus: TokenStatus,
    isLoading: boolean,
    isError: boolean,
    error: any,
    user: AuthUser | null;
}

export interface AuthUser {

}