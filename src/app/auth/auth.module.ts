import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { ConfirmMailComponent } from './components/confirm-mail/confirm-mail.component';
import { LogoutComponent } from './components/logout/logout.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { SharedModule } from '../shared/shared.module';


const authRoutes: Routes = [
  {path: 'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
  {path: 'confirm-mail', component: ConfirmMailComponent},
  {path: 'logout', component: LogoutComponent},
  {path: 'forgot-password', component: ForgotPasswordComponent},
  {path: 'reset-password', component: ResetPasswordComponent},
]

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
    RouterModule.forChild(authRoutes),
    SharedModule
  ]
})
export class AuthModule { }
