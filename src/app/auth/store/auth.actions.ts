import { createAction, props } from "@ngrx/store";
import { AuthTokens, LoginRequestModel, ResetPasswordRequestModel } from "../models/auth-api.models";
import { AuthUser } from "../models/auth-state.model";


export const LOGIN_REQUEST = '[Auth] Login Request';
export const LOGIN_SUCCESS = '[Auth] Login Success';
export const LOGIN_FAILURE = '[Auth] Login Failure';

export const REFRESH_TOKEN_REQUEST = '[Auth] Refresh Token Request';
export const REFRESH_TOKEN_SUCCESS = '[Auth] Refresh Token Success';
export const REFRESH_TOKEN_FAILURE = '[Auth] Refresh Token Failure';

export const USER_REQUEST = '[Auth] User Request';
export const USER_SUCCESS = '[Auth] User Success';
export const USER_FAILURE = '[Auth] User Failure';

const FORGOT_PASSWORD_REQUEST = '[Auth] Forgot Password Request';
const RESET_PASSWORD_REQUEST = '[Auth] Reset Password Request';

export const LOGOUT = '[Auth] Logout';

export const FIRST_ROUTE = '[Auth] First Route';


// Validate if Token is expired
//    If expired dispatch logout action
//    If valid then dispatch refresh token request



// Login
export const loginRequestAction = createAction(
    LOGIN_REQUEST,
    props<{ credentials: LoginRequestModel }>()
);

export const loginSuccessAction = createAction(LOGIN_SUCCESS);

export const loginFailureAction = createAction(LOGIN_FAILURE,props<{ error: Error }>());


// User
export const userRequestAction = createAction(USER_REQUEST);

export const userSuccessAction = createAction(USER_SUCCESS, props<{ user: AuthUser }>());

export const userFailureAction = createAction(USER_FAILURE, props<{ error: Error }>());


// Refresh Token
export const refreshTokenRequestAction = createAction(REFRESH_TOKEN_REQUEST, props<{ authTokens: AuthTokens }>());

export const refreshTokenSuccessAction = createAction(REFRESH_TOKEN_SUCCESS);

export const refreshTokenFailureAction = createAction(REFRESH_TOKEN_FAILURE, props<{ error: Error }>());


// Forgot Password
export const forgotPasswordRequestAction = createAction(FORGOT_PASSWORD_REQUEST, props<{email: string}>());

export const resetPasswordRequestAction = createAction(RESET_PASSWORD_REQUEST, props<{resetPassword: ResetPasswordRequestModel}>());


// Logout
export const logoutAction = createAction(LOGOUT);


// Routing after login
export const firstRouteAction = createAction(FIRST_ROUTE, props<{routeUrl:string}>());