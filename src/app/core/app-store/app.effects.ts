import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { map, tap } from "rxjs";

import * as AppActions from './app.actions';
import * as AuthActions from '../../auth/store/auth.actions';


@Injectable()
export class AppEffects {

    constructor(
        private actions$: Actions,
        private snackbar : MatSnackBar
    ){}

    initializeApp$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AppActions.validateTokenAction),
            map((action) => {
                const tokenExpired = this.isTokenExpried(action.authTokens.refreshToken.expiryDate)
                if(tokenExpired) return AuthActions.logoutAction();
                return AuthActions.refreshTokenRequestAction({ authTokens: action.authTokens });
            })
        );
    });

    alert$ = createEffect(() => this.actions$.pipe(
        ofType(AppActions.ShowAlertAction),
        tap(action => this.notificationAlert(action.message, action.alertType))
    ), { dispatch: false });


    private isTokenExpried(expiryDate: string) : boolean {
        const now = (new Date());
        const expiry = (new Date(expiryDate));
        console.log(`Token Expiry ----- ${now} - Now : ${expiry} - (Expiry)`);
        console.log(`Token Expired: ${now > expiry ? true : false}`);
        return now > expiry ? true : false;
    }

    private notificationAlert(message: string, alertType: string) {
        const stylingClass = alertType === 'pass' ? 'green-snackbar' : 'red-snackbar';
        return this.snackbar.open(message, 'OK', {
            verticalPosition: 'top',
            horizontalPosition: 'end',
            panelClass: [stylingClass],
            duration: 5000
        });
    }
}