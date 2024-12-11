import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";

import * as AuthActions from './store/auth.actions';
import * as AuthSelectors from './store/auth.selectors';
import { LoginRequestModel, ResetPasswordRequestModel } from "./models/auth-api.models";
import { Observable } from "rxjs";
import { User } from "./models/user.model";

@Injectable({
    providedIn: 'root'
  })
export class AuthFacade {
  // isAuthenticated$ = this.store.select(AuthSelectors.isAuthenticated);
  // isLoading$ = this.store.select(AuthSelectors.isLoading);
  isAuthenticated = (): Observable<boolean> => this.store.select(AuthSelectors.isAuthenticated);
  isLoading = (): Observable<boolean> => this.store.select(AuthSelectors.isLoading);
  getUser = (): Observable<User | null> => this.store.select(AuthSelectors.user);

  constructor(private store: Store) {}

  login(credentials: LoginRequestModel) {
    this.store.dispatch(AuthActions.loginRequestAction({credentials}));
  }

  logout() {
    this.store.dispatch(AuthActions.logoutAction());
  }

  forgotPassword(email: string) {
    this.store.dispatch(AuthActions.forgotPasswordRequestAction({email: email}));
  }

  resetPassword(resetPassword: ResetPasswordRequestModel){
    this.store.dispatch(AuthActions.resetPasswordRequestAction({resetPassword: resetPassword}));
  }


  

}