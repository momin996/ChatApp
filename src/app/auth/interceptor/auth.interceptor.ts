import { HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest, HttpResponse, } from '@angular/common/http';
import { HttpInterceptor } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthFacade } from '../auth.facade';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private authFacade: AuthFacade,
        private localStorageService: LocalStorageService,
    //   private notificationService:NotificationsService
    ) {}

    intercept(
        req: HttpRequest<unknown>,
        next: HttpHandler
    ): Observable<HttpEvent<unknown>> {
        
        const accessToken = this.localStorageService.getAccessToken();
        if (accessToken) {
            req = req.clone({
                setHeaders: { Authorization: `Bearer ${accessToken.token}` },
                // !Attention: it used only at Fake API, remove it in real app
                // params: req.params.set('auth-token', accessToken),
            });
        }

        return next.handle(req).pipe(s => this.handleErrors(s, req.url));
    }

    private handleErrors(source: Observable<HttpEvent<unknown>>, urlPath: string): Observable<HttpEvent<unknown>> {
        return source.pipe(
            catchError((error: Error | HttpErrorResponse) => {
                if (error instanceof HttpErrorResponse) {
                    // Server Error
                    let message = error.toString();
                    message = error.message ? error.message : message;
                    /*if(error.error.errors !== undefined){
                        if(error.error.errors){
                        message = '';
                        for (const key in error.error.errors) {
                            error.error.errors[key].forEach(elem=>{
                            message += `(${key+` : `+elem}) `;       
                            })
                        }
                        }
                    }*/
                    
                    if (error.status === 401 && !urlPath.includes('/auth/')) {
                        return this.handle401();
                    }
                    // try to avoid errors on logout
                    // therefore we check the url path of '/auth/'
                    // if (error.status === 401 && !urlPath.includes('/auth/')) {
                    //   return this.handle401();
                    // }
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

    private handle401() {
        this.authFacade.logout();
        return EMPTY;
    }
}
