import { AuthState } from "src/app/auth/models/auth-state.model";
import { RouterState } from './router-state.model';


export interface AppState {
    auth: AuthState,
    router: RouterState
}