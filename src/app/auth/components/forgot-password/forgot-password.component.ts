import { Component } from '@angular/core';
import { CustomizerSettingsService } from '../../../core/services/customizer-settings.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthFacade } from '../../auth.facade';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {

    forgotPasswordForm = new FormGroup({
        email: new FormControl<string>('', {
          validators: [Validators.required, Validators.email],
        })
    });

    constructor(
        public themeService: CustomizerSettingsService,
        private authFacade: AuthFacade
    ) {}

    submit() {
        if(this.forgotPasswordForm.valid){
            const email = this.forgotPasswordForm.value.email;
            if(email!=null){
                console.log('Sending forgot password request');
                this.authFacade.forgotPassword(email);
                
            }
        }
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    toggleCardBorderTheme() {
        this.themeService.toggleCardBorderTheme();
    }

    toggleCardBorderRadiusTheme() {
        this.themeService.toggleCardBorderRadiusTheme();
    }

    toggleRTLEnabledTheme() {
        this.themeService.toggleRTLEnabledTheme();
    }

}