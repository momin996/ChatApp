import { Action, createReducer, on } from "@ngrx/store";

import { AuthState, TokenStatus } from "../models/auth-state.model";
import * as AuthActions from './auth.actions';

const initialAuthState: AuthState = {
    isAuthenticated: false,
    tokenStatus: TokenStatus.PENDING,
    isLoading: false,
    isError: false,
    error: null,
    user: null
}

const reducer = createReducer(
    initialAuthState,
    on(
        AuthActions.initAuthAction,
        (state): AuthState => {
            return {
                ...state,
                isLoading: true,
                tokenStatus: TokenStatus.VALIDATING
            }
        }
    ),

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
        AuthActions.validTokenAction,
        AuthActions.loginSuccessAction,
        AuthActions.refreshTokenSuccessAction,
        (state): AuthState => ({
          ...state,
          isAuthenticated: false,
        //   isAuthenticated: true,
        //   isLoading: false,
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
        AuthActions.userSuccessAction,
        (state, action): AuthState => ({
          ...state,
          user: action.user,
        })
    ),
    on(
        AuthActions.authCompleteAction,
        (state) : AuthState => {
            return {
                ...state,
                isAuthenticated: true,
                isLoading: false,
            }
        }
    ),

    on(
        AuthActions.userFailureAction,
        (_, action): AuthState => ({
            ...initialAuthState,
            error: action.error
        })
    ),

    on(
        AuthActions.logoutCompleteAction,
        (): AuthState => ({ ...initialAuthState })
    )
)

export function authReducer(state: AuthState | undefined, action: Action): AuthState {
    return reducer(state, action);
}