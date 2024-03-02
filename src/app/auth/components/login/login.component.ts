import { Component } from '@angular/core';
import { CustomizerSettingsService } from '../../../core/services/customizer-settings.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { AuthFacade } from '../../auth.facade';

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
    ) {}

    submit() {
        if(this.loginForm.valid){
            const email = this.loginForm.value.email;
            const password = this.loginForm.value.password;
            if(email!=null && password !=null){
                var credentials = { email:email, password: password}
                this.authFacade.login(credentials);
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