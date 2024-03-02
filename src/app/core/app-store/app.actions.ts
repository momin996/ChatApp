import { createAction, props } from "@ngrx/store"
import { AuthTokens } from "src/app/auth/models/auth-api.models";


export const SHOW_ALERT = '[App] Show Alert'
export const ShowAlertAction = createAction(SHOW_ALERT, props<{message: string, alertType: string}>());

export const VALIDATE_TOKEN = '[Auth] Token Valid';
export const validateTokenAction = createAction(
    VALIDATE_TOKEN,
    props<{authTokens: AuthTokens}>()
);