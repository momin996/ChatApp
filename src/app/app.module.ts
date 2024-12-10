// Core Dependencies Import
import { APP_INITIALIZER, NgModule, isDevMode } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreRouterConnectingModule } from '@ngrx/router-store';

import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { AppReducer } from './core/app-store/app.reducer';
import { AuthEffects } from './auth/store/auth.effects';

// Core Component Imports
import { AppComponent } from './app.component';
import { HeaderComponent } from './core/components/header/header.component';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { NotFoundComponent } from './core/components/not-found/not-found.component';
import { InternalErrorComponent } from './core/components/internal-error/internal-error.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AppEffects } from './core/app-store/app.effects';
import { AppInitService } from './core/services/app-init-service';
import { CustomRouterStateSerilizer } from './core/app-store/router-state.model';
import { ChatComponent } from './chat/chat.component';
import { ChatSidebarComponent } from './chat/chat-sidebar/chat-sidebar.component';
import { ChatListItemComponent } from './chat/chat-sidebar/chat-list-item/chat-list-item.component';
import { ConversationComponent } from './chat/conversation/conversation.component';


@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        SidebarComponent,
        FooterComponent,
        NotFoundComponent,
        InternalErrorComponent,

        DashboardComponent,
        ChatComponent,
        ChatSidebarComponent,
        ChatListItemComponent,
        ConversationComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        SharedModule,
        BrowserAnimationsModule,
        StoreModule.forRoot(AppReducer),
        EffectsModule.forRoot([AppEffects, AuthEffects]),
        StoreRouterConnectingModule.forRoot({serializer: CustomRouterStateSerilizer}),
        StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
        
    ],
    providers: [
        {
          provide: APP_INITIALIZER,
          useFactory: (appInitService: AppInitService) => () => appInitService.initializeApp(),
          deps: [AppInitService],
          multi: true,
        },
      ],
    bootstrap: [AppComponent]
})
export class AppModule { }