import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";

import * as AppActions from '../app-store/app.actions';
import { LocalStorageService } from "./local-storage.service";
import { isAuthenticated } from "src/app/auth/store/auth.selectors";

@Injectable({
    providedIn: 'root'
})
export class AppInitService {

    constructor(private store: Store, private localStorageService: LocalStorageService,){}


    async initializeApp(): Promise<boolean> {
        return await new Promise((resolve) => {
            const authTokens = this.localStorageService.getTokens();
            if (authTokens) {
                this.store.dispatch(AppActions.validateTokenAction({authTokens: authTokens}));

                this.store.select(isAuthenticated)
                    .subscribe(val => resolve(val));
            }

            resolve(false);
        });
      }
}