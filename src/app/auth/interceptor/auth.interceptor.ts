import { HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest, HttpResponse, } from '@angular/common/http';
import { HttpInterceptor } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, take } from 'rxjs/operators';
import { AuthFacade } from '../auth.facade';
import { TokenStorageService } from '../token-storage.service';
import { AuthService } from '../auth.service';
import { AuthTokens } from '../models/auth-api.models';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    private isRefreshing = false;
    private refreshTokenSubject = new BehaviorSubject<string | null>(null);

    constructor(
        private tokenStorage: TokenStorageService,
        private authService: AuthService,
        private authFacade: AuthFacade,
    //   private notificationService:NotificationsService
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        
        if (this.isAuthRequest(req.url)) {
            return next.handle(req);
        }

        const token = this.tokenStorage.getAccessTokenValue();

        if (token) {
            req = this.addToken(req, token);
        }
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
      
                if (error.status === 401) {
                    return this.handle401(req, next);
                }
        
                return throwError(() => error);
            })
        );
        // return next.handle(req).pipe(s => this.handleErrors(s, req.url));
    }

    // obsolete
    private handleErrors(source: Observable<HttpEvent<unknown>>, urlPath: string): Observable<HttpEvent<unknown>> {
        return source.pipe(
            catchError((error: Error | HttpErrorResponse) => {
                if (error instanceof HttpErrorResponse) {
                    // Server Error
                    let message = error.toString();
                    message = error.message ? error.message : message;
                    
                    if (error.status === 401 && !urlPath.includes('/auth/')) {
                        return this.handle401V1();
                    }
                }

                // rethrow error
                return throwError(() => error);
            })
            ).pipe(map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    if(event.body){
                        if(event.body.errors && (event.status===200 || event.status===400)){
                            for (const key in event.body.errors) {
                                event.body.errors[key].forEach((msg:string)=>{
                                //   this.notificationService.showErrorMessage(`${key+` : `+msg}`, 'OK');
                                    console.log(`${key+` : `+msg}`, 'OK');
                                })
                            }
                        }
                    }
                    
                }
                return event;
            })
        );
    }

    // obsolete
    private handle401V1() {
        this.authFacade.logout();
        this.tokenStorage.clearTokens();
        return EMPTY;
    }

    private handle401(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const tokens = this.tokenStorage.getTokens();
    
        // No tokens → logout
        if (!tokens) {
          this.triggerLogout();
          return throwError(() => new Error('No tokens'));
        }
    
        // Refresh token expired → logout
        if (this.tokenStorage.isRefreshTokenExpired()) {
          this.triggerLogout();
          return throwError(() => new Error('Refresh token expired'));
        }
    
        // 🧠 Start refresh if not already running
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);
        
            return this.authService.refreshToken(tokens).pipe(
                switchMap((newTokens: AuthTokens) => {
                    this.isRefreshing = false;
            
                    this.tokenStorage.setTokens(newTokens);
            
                    this.refreshTokenSubject.next(newTokens.accessToken.token);
            
                    return next.handle(this.addToken(req, newTokens.accessToken.token));
                }),
                catchError(err => {
                    this.isRefreshing = false;
                    this.triggerLogout();
                    return throwError(() => err);
                })
            );
        }
    
        // 🧠 Queue pending requests
        return this.refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(token => next.handle(this.addToken(req, token!)))
        );
    }

    private isAuthRequest(url: string): boolean {
        return url.includes('/Auth/');
    }

    private addToken(request: HttpRequest<any>, token: string) {
        return request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
    }

    private triggerLogout() {
        this.authFacade.logout();
    }
}
