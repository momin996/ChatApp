import { Action, createReducer, on } from "@ngrx/store";

import { AuthState, TokenStatus } from "../models/auth-state.model";
import * as AuthActions from './auth.actions';

export const AUTH_FEATURE_KEY = 'auth';

const initialAuthState: AuthState = {
    isAuthenticated: false,
    tokenStatus: TokenStatus.PENDING,
    isLoading: false,
    isError: false,
    error: null
}

const reducer = createReducer(
    initialAuthState,
    
    on(
        AuthActions.loginRequestAction,
        AuthActions.refreshTokenRequestAction,
        (state): AuthState => ({
          ...state,
          isLoading: true,
          tokenStatus: TokenStatus.VALIDATING
        })
    ),

    on(
        AuthActions.loginSuccessAction,
        AuthActions.refreshTokenSuccessAction,
        (state, action): AuthState => ({
          ...state,
          isAuthenticated: true,
          isLoading: false,
          tokenStatus: TokenStatus.VALID,
        })
    ),

    on(
        AuthActions.loginFailureAction,
        AuthActions.refreshTokenFailureAction,
        (state, action): AuthState => ({
          ...state,
          isAuthenticated: false,
          isLoading: false,
          tokenStatus: TokenStatus.INVALID,
          isError: true,
          error: action.error
        })
    ),

    on(
        AuthActions.logoutAction,
        (state): AuthState => ({
            ...initialAuthState
        })
    )
)

export function authReducer(state: AuthState | undefined, action: Action): AuthState {
    return reducer(state, action);
}