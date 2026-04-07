import { ActionReducerMap } from "@ngrx/store";

import { AppState } from "./app-state.model";
import { authReducer as AuthReducer } from "src/app/auth/store/auth.reducers";

export const AppReducer: ActionReducerMap<AppState> = {
    auth: AuthReducer,
}