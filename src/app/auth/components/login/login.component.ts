import { Component } from '@angular/core';
import { CustomizerSettingsService } from '../../../core/services/customizer-settings.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthFacade } from '../../auth.facade';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, take } from 'rxjs';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {

    hide = true;

    loginForm = new FormGroup({
        email: new FormControl<string>('', {
          validators: [Validators.required, Validators.email],
        }),
        password: new FormControl<string>('', {
          validators: [Validators.required],
        }),
    });

    constructor(
        private themeService: CustomizerSettingsService,
        private authFacade: AuthFacade,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    submit() {
        if(this.loginForm.valid){
            const email = this.loginForm.value.email;
            const password = this.loginForm.value.password;
            if(email!=null && password !=null){

                this.authFacade.login({ email:email, password: password});

                // Handle navigation AFTER login success
                this.authFacade.isAuthenticated()
                .pipe(
                    filter(isAuth => isAuth), // wait until true
                    take(1) // only once => prevents memory leaks
                )
                .subscribe(() => {
                    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/chat';
                    this.router.navigateByUrl(returnUrl);
                });
            }
        }
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    isDarkTheme(): boolean {
        return this.themeService.isDark();
    }

}