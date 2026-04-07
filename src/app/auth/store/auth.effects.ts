import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, EMPTY, exhaustMap, filter, from, map, of, switchMap, take, tap } from "rxjs";

import { AuthService } from "../auth.service";
import * as AuthActions from './auth.actions';
import { ApiStringResp, AuthTokens } from "../models/auth-api.models";
import { ShowAlertAction } from "src/app/core/app-store/app.actions";
import { User } from "../models/user.model";
import { SignalRService } from "src/app/signalr.service";
import { TokenStorageService } from "../token-storage.service";


@Injectable()
export class AuthEffects {

    private isLoggingOut = false;

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
                            console.log('Got user response', response);
                            
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
                        console.log('inside start connection switchMap');
                        return this.signalRService.connectionReady$.pipe(
                            filter(ready => ready),
                            take(1),
                            map(() => {
                                console.log('SignalR Hub Connected: ', this.signalRService.isHubConnected);
                                return AuthActions.authCompleteAction();
                            })
                        )
                    })
                )
            )
        )
    });

    forgotPasswordRequest$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.forgotPasswordRequestAction),
            exhaustMap((action) => {
                return this.authService.forgotPassword(action.email).pipe(
                    map((response: ApiStringResp) => {
                        return ShowAlertAction({message: response.message, alertType: 'pass'});
                    }),
                    catchError(err => of(ShowAlertAction({message: err.error.message, alertType: 'fail'})))
                )
                
            })
        );
    });

    resetPasswordRequest$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.resetPasswordRequestAction),
            exhaustMap((action) => {
                return this.authService.resetPassword(action.resetPassword).pipe(
                    switchMap((response: ApiStringResp) => {
                        console.log(response);
                        return of(
                            ShowAlertAction({message: response.message, alertType: 'pass'}),
                            // AuthActions.firstRouteAction({routeUrl: '/auth/login'})
                        );
                    }),
                    catchError(err => of(ShowAlertAction({message: err.error.message, alertType: 'fail'})))
                )
                
            })
        );
    });
    

    // Logout
    logout$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.logoutAction),
            exhaustMap(() => {      // Why exhaustMap? => Prevents multiple API calls
                // Prevent duplicate logout execution
                if (this.isLoggingOut) return EMPTY;
                this.isLoggingOut = true;

                return this.authService.logout().pipe(
                    catchError(() => of(null)), // ignore API failure
                    map(() => AuthActions.logoutCompleteAction())
                );
            })
        );
    });

    logoutComplete$ = createEffect(
        () => {
            return this.actions$.pipe(
                ofType(AuthActions.logoutCompleteAction),
                tap(() => {
                    this.tokenStorage.clearTokens();
                    this.signalRService.stopConnection();
                    this.isLoggingOut = false;
                })
            );
        },
        { dispatch: false }
    );
}