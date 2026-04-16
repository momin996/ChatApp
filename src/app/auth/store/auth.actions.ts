import { createAction, props } from "@ngrx/store";
import { AuthTokens, LoginRequestModel, ResetPasswordRequestModel } from "../models/auth-api.models";
import { User } from "../models/user.model";

export const INIT = '[Auth] Init';

export const LOGIN_REQUEST = '[Auth] Login Request';
export const LOGIN_SUCCESS = '[Auth] Login Success';
export const LOGIN_FAILURE = '[Auth] Login Failure';

export const REFRESH_TOKEN_REQUEST = '[Auth] Refresh Token Request';
export const REFRESH_TOKEN_SUCCESS = '[Auth] Refresh Token Success';
export const REFRESH_TOKEN_FAILURE = '[Auth] Refresh Token Failure';

export const VALID_TOKEN = '[Auth] Valid Access Token';

export const USER_SUCCESS = '[Auth] User Success';
export const USER_FAILURE = '[Auth] User Failure';

export const LOGOUT = '[Auth] Logout';
export const LOGOUT_COMPLETE = '[Auth] Logout Complete';

export const AUTH_COMPLETE = '[Auth] Auth Flow Complete';



export const initAuthAction = createAction(INIT);

// Login
export const loginRequestAction = createAction(
    LOGIN_REQUEST,
    props<{ credentials: LoginRequestModel }>()
);

export const loginSuccessAction = createAction(LOGIN_SUCCESS);

export const loginFailureAction = createAction(LOGIN_FAILURE,props<{ error: Error }>());

export const validTokenAction = createAction(VALID_TOKEN);

// User
export const userSuccessAction = createAction(USER_SUCCESS, props<{ user: User }>());

export const userFailureAction = createAction(USER_FAILURE, props<{ error: Error }>());


// Refresh Token
export const refreshTokenRequestAction = createAction(REFRESH_TOKEN_REQUEST, props<{ authTokens: AuthTokens }>());

export const refreshTokenSuccessAction = createAction(REFRESH_TOKEN_SUCCESS);

export const refreshTokenFailureAction = createAction(REFRESH_TOKEN_FAILURE, props<{ error: Error }>())


// Logout
export const logoutAction = createAction(LOGOUT);
export const logoutCompleteAction = createAction(LOGOUT_COMPLETE);


export const authCompleteAction = createAction(AUTH_COMPLETE);