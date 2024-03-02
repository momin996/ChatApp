import { ActionReducerMap } from "@ngrx/store";

import { AppState } from "./app-state.model";
import { authReducer as AuthReducer } from "src/app/auth/store/auth.reducers";
import { routerReducer } from "@ngrx/router-store";

export const AppReducer: ActionReducerMap<AppState> = {
    auth: AuthReducer,
    router: routerReducer
}