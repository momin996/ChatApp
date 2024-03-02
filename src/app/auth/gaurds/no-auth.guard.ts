import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { map } from "rxjs";
import { AuthFacade } from "../auth.facade";

export const noAuthGaurd: CanActivateFn = (route, state) => {
    const authFacade = inject(AuthFacade);
    return authFacade.isAuthenticated().pipe(
      map(isAuthenticated => {
        return !isAuthenticated;
      })
    )
}