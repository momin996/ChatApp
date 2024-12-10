import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthModule } from './auth/auth.module';
import { InternalErrorComponent } from './core/components/internal-error/internal-error.component'
import { NotFoundComponent } from './core/components/not-found/not-found.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGaurd } from './auth/gaurds/auth.guard';
import { noAuthGaurd } from './auth/gaurds/no-auth.guard';
import { ChatComponent } from './chat/chat.component';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'auth/login'
        // redirectTo: 'chat'
    },
    
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then((m) => AuthModule),
        canActivate: [noAuthGaurd]
    },
    
    // {
    //     path: 'dashboard',
    //     component: DashboardComponent,
    //     // canActivate: [authGaurd]
    // },

    {
        path: 'chat',
        component: ChatComponent,
        canActivate: [authGaurd]
    },

    {path: 'error-500', component: InternalErrorComponent},

    {path: '**', component: NotFoundComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
    exports: [RouterModule]
})
export class AppRoutingModule { }