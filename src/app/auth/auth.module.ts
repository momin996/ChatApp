import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { ConfirmMailComponent } from './components/confirm-mail/confirm-mail.component';
import { LogoutComponent } from './components/logout/logout.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { SharedModule } from '../shared/shared.module';
import { noAuthGaurd } from './gaurds/no-auth.guard';

const authRoutes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [noAuthGaurd] },
  { path: 'register', component: RegisterComponent, canActivate: [noAuthGaurd] },
  { path: 'logout', component: LogoutComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [noAuthGaurd] },
  { path: 'reset-password', component: ResetPasswordComponent, canActivate: [noAuthGaurd] }
];

@NgModule({
  declarations: [
    RegisterComponent,
    LoginComponent,
    ConfirmMailComponent,
    LogoutComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent
  ],
  imports: [
    // StoreModule.forFeature(AUTH_FEATURE_KEY, authReducer),
    // EffectsModule.forFeature([AuthEffects]),
    RouterModule.forChild(authRoutes),
    SharedModule
  ],
})
export class AuthModule { }
