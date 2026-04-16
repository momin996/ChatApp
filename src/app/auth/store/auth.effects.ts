import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, exhaustMap, filter, from, map, of, switchMap, take, tap } from "rxjs";

import { AuthService } from "../auth.service";
import * as AuthActions from './auth.actions';
import { User } from "../models/user.model";
import { SignalRService } from "src/app/signalr.service";
import { TokenStorageService } from "../token-storage.service";
import { AuthTokens } from "../models/auth-api.models";


@Injectable()
export class AuthEffects {


    constructor(
        private actions$: Actions,
        private authService: AuthService,
        private tokenStorage: TokenStorageService,
        private signalRService: SignalRService
        
    ) {}

    init$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.initAuthAction),
            exhaustMap(() => {
        
                const tokens = this.tokenStorage.getTokens();
            
                // No tokens → user is not logged in
                if (!tokens) {
                    return of(AuthActions.logoutAction());
                }
            
                // Access token valid → fetch user
                if (this.tokenStorage.hasValidAccessToken()) {
                    return of(AuthActions.validTokenAction());
                }
            
                // Access expired but refresh valid → refresh
                if (this.tokenStorage.hasValidRefreshToken()) {
                    return of(AuthActions.refreshTokenRequestAction({ authTokens: tokens }));
                }
            
                // Both invalid → logout
                return of(AuthActions.logoutAction());
            })
        );
    });

    // Login
    login$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.loginRequestAction),
            exhaustMap((request) => {
                return this.authService.login(request.credentials).pipe(
                    map((response: AuthTokens) => {
                        if(response) {
                            this.tokenStorage.setTokens(response)
                            return AuthActions.loginSuccessAction();
                        }
                        // handle failure response
                        return AuthActions.loginFailureAction(response);
                    }),
                    catchError(error => of(AuthActions.loginFailureAction(error.message)))
                );
            })
        );
    });

    refreshTokenRequest$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.refreshTokenRequestAction),
            exhaustMap((action) => {
                return this.authService.refreshToken(action.authTokens).pipe(
                    map((response: AuthTokens) => {
                        if(response){
                            this.tokenStorage.setTokens(response)
                            return AuthActions.refreshTokenSuccessAction();
                        }
                        return AuthActions.refreshTokenFailureAction(response);
                    }),
                    catchError(err => of(AuthActions.logoutAction()))
                )
            })
        );
    });


    // Login Success
    // Refresh Token Success
    getUser$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(
                AuthActions.validTokenAction,
                AuthActions.loginSuccessAction,
                AuthActions.refreshTokenSuccessAction
            ),
            exhaustMap(() => {
                return this.authService.getUser().pipe(
                    map((response: User) => {
                        if(response){
                            return AuthActions.userSuccessAction({user: response});
                        }
                        return AuthActions.logoutAction();
                    }),
                    catchError(err => {
                        console.log('Error getting user: ', err);
                        return of(AuthActions.logoutAction());
                    })
                )
            })
        )
    })

    getUserSuccess$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.userSuccessAction),
            switchMap(() =>
                from(this.signalRService.startConnection()).pipe(
                    switchMap(() => {
                        return this.signalRService.connectionReady$.pipe(
                            filter(ready => ready),
                            take(1),
                            map(() => {
                                return AuthActions.authCompleteAction();
                            })
                        )
                    })
                )
            )
        )
    });
    

    // Logout
    logout$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.logoutAction),
            exhaustMap(() => {      // Why exhaustMap? => Prevents multiple API calls
                return this.authService.logout().pipe(
                    catchError(() => of(null)), // ignore API failure
                    switchMap(() => from(this.signalRService.stopConnection())),
                    map(() => AuthActions.logoutCompleteAction())
                );
            })
        );
    });

    logoutComplete$ = createEffect(
        () => {
            return this.actions$.pipe(
                ofType(AuthActions.logoutCompleteAction),
                tap(() => this.tokenStorage.clearTokens())
            );
        },
        { dispatch: false }
    );
}