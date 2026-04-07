import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthModule } from './auth/auth.module';
import { InternalErrorComponent } from './core/components/internal-error/internal-error.component'
import { NotFoundComponent } from './core/components/not-found/not-found.component';
import { authGaurd } from './auth/gaurds/auth.guard';
import { noAuthGaurd } from './auth/gaurds/no-auth.guard';
import { ChatComponent } from './chat/chat.component';
import { MainLayoutComponent } from './core/components/main-layout/main-layout.component';
import { AuthLayoutComponent } from './core/components/auth-layout/auth-layout.component';

const routes: Routes = [

    {
        path: '',
        component: MainLayoutComponent,
        children: [
          {
            path: 'chat',
            component: ChatComponent,
            canActivate: [authGaurd]
          },
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'chat'
          }
        ]
    },

    {
        path: 'auth',
        component: AuthLayoutComponent,
        children: [
          {
            path: '',
            loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
          }
        ]
    },

    { path: 'error-500', component: InternalErrorComponent },
    { path: '**', component: NotFoundComponent }


    // {
    //     path: '',
    //     pathMatch: 'full',
    //     redirectTo: 'auth/login'
    //     // redirectTo: 'chat'
    // },
    
    // {
    //     path: 'auth',
    //     loadChildren: () => import('./auth/auth.module').then((m) => AuthModule),
    //     canActivate: [noAuthGaurd]
    // },

    // {
    //     path: 'chat',
    //     component: ChatComponent,
    //     canActivate: [authGaurd]
    // },

    // {path: 'error-500', component: InternalErrorComponent},

    // {path: '**', component: NotFoundComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
    exports: [RouterModule]
})
export class AppRoutingModule { }