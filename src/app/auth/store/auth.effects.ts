import { Injectable } from "@angular/core";
import { Location } from '@angular/common';
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, exhaustMap, map, of, switchMap, tap } from "rxjs";

import { AuthService } from "../auth.service";
import * as AuthActions from './auth.actions';
import { ApiStringResp, AuthTokens } from "../models/auth-api.models";
import { LocalStorageService } from "src/app/core/services/local-storage.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ShowAlertAction } from "src/app/core/app-store/app.actions";
import { User } from "../models/user.model";
import { SignalRService } from "src/app/signalr.service";


@Injectable()
export class AuthEffects {

    constructor(
        private actions$: Actions,
        private authService: AuthService,
        private localStorageService: LocalStorageService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private location: Location,
        private signalRService: SignalRService
        
    ) {}

    firstRoute: string = '/chat';

    // Login
    login$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.loginRequestAction),
            exhaustMap((request) => {
                return this.authService.login(request.credentials).pipe(
                    map((response: AuthTokens) => {
                        if(response) {
                            this.localStorageService.saveTokens(response);
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
                        console.log('got response from auth refresh token endpoint')
                        if(response){
                            this.localStorageService.saveTokens(response);
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
    authenticationSuccessfull$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(
                AuthActions.loginSuccessAction,
                AuthActions.refreshTokenSuccessAction
            ),
            map(() => AuthActions.userRequestAction())
        );
    });
    
    getUser$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(
                AuthActions.userRequestAction
            ),
            exhaustMap((action) => {
                return this.authService.getUser().pipe(
                    map((response: User) => {
                        if(response){
                            return AuthActions.userSuccessAction({user: response});
                            // return AuthActions.firstRouteAction({routeUrl: this.firstRoute});
                        }
                        return AuthActions.logoutAction();
                    }),
                    catchError(err => of(AuthActions.logoutAction()))
                )
            })
        )
    })

    getUserSuccess$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.userSuccessAction),
            map(() => AuthActions.firstRouteAction({routeUrl: this.firstRoute}))
        )
    })

// firstRouteAction has the routeUrl parameter so that if in the future we route the user to specific route based on its permisions
// map(() => AuthActions.firstRouteAction({routeUrl: '/dashboard'}))

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
                            AuthActions.firstRouteAction({routeUrl: '/auth/login'})
                        );
                    }),
                    catchError(err => of(ShowAlertAction({message: err.error.message, alertType: 'fail'})))
                )
                
            })
        );
    });


    // Route after login
    firstRoute$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.firstRouteAction),
            tap(action => {
                let route = this.location.path();
                console.log(`Current URL path: ${route}`);
                const returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] ?? null;
                if(returnUrl !== null) {
                    route = returnUrl;
                    console.log('Routing to : ' + route);
                }
                if(route.includes('auth')) route = '/chat';
                console.log('Routing to : ' + route);

                // this.signalRService.connect();

                this.router.navigateByUrl(route);
            })
        );
    }, { dispatch: false } );
    

    // Logout
    logout$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.logoutAction),
            tap(() => {
                this.localStorageService.removeTokens();
                this.router.navigateByUrl('/auth/logout');
                this.signalRService.stopConnection();
            })
        );
    }, {dispatch: false});

}