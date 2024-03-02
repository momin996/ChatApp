import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthFacade } from "../auth.facade";
import { filter, map, take, withLatestFrom } from "rxjs";



  export const authGaurd: CanActivateFn = (route, state) => {
    const authFacade = inject(AuthFacade);
    const router = inject(Router);
    return authFacade.isLoading().pipe(
      withLatestFrom(authFacade.isAuthenticated()),
      filter(([isLoading]) => isLoading===false),
      take(1),
      map(([isLoading, isAuthenticated]) => {
        if(isAuthenticated) return true;
        
        router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
        return false;
      })
    );
  };
