import { Component, OnInit } from '@angular/core';
import { CustomizerSettingsService } from '../../../core/services/customizer-settings.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthFacade } from '../../auth.facade';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

    hide = true;

    private token: string;
    private email: string;

    resetPasswordForm = new FormGroup({
        password: new FormControl<string>('', { validators: [Validators.required] }),
        confirmPassword: new FormControl<string>('', { validators: [Validators.required] }),
    });

    constructor(
        public themeService: CustomizerSettingsService,
        private route: ActivatedRoute,
        private authFacade: AuthFacade
    ) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.token = params['token'];
            this.email = params['email'];
        })
    }

    submit() {
        if(this.resetPasswordForm.valid){
            const password = this.resetPasswordForm.value.password;
            const confirmPassword = this.resetPasswordForm.value.confirmPassword;
            if(password!=null && confirmPassword!=undefined && password===confirmPassword){
                console.log('Sending reset password request');
                const requestBody = {
                    email: this.email,
                    password: password,
                    confirmPassword: confirmPassword,
                    token: this.token
                }
                // this.authFacade.resetPassword(requestBody);
            }
        }
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

}