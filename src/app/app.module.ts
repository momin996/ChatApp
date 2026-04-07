// Core Dependencies Import
import { NgModule, isDevMode } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { AppReducer } from './core/app-store/app.reducer';
import { AuthEffects } from './auth/store/auth.effects';

// Core Component Imports
import { AppComponent } from './app.component';
import { HeaderComponent } from './core/components/header/header.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { NotFoundComponent } from './core/components/not-found/not-found.component';
import { InternalErrorComponent } from './core/components/internal-error/internal-error.component';
import { AppEffects } from './core/app-store/app.effects';
import { ChatComponent } from './chat/chat.component';
import { ChatSidebarComponent } from './chat/chat-sidebar/chat-sidebar.component';
import { ChatListItemComponent } from './chat/chat-sidebar/chat-list-item/chat-list-item.component';
import { ConversationComponent } from './chat/conversation/conversation.component';
import { AuthInterceptor } from './auth/interceptor/auth.interceptor';
import { CreateContactComponent } from './contact/create-contact/create-contact.component';
import { ContactsDropdownComponent } from './contact/contacts-dropdown/contacts-dropdown.component';
import { MainLayoutComponent } from './core/components/main-layout/main-layout.component';
import { AuthLayoutComponent } from './core/components/auth-layout/auth-layout.component';


@NgModule({
    declarations: [
        AppComponent,
        MainLayoutComponent,
        AuthLayoutComponent,
        HeaderComponent,
        FooterComponent,
        NotFoundComponent,
        InternalErrorComponent,

        ChatComponent,
        ChatSidebarComponent,
        ChatListItemComponent,
        ConversationComponent,

        CreateContactComponent,
        ContactsDropdownComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        SharedModule,
        BrowserAnimationsModule,
        StoreModule.forRoot(AppReducer),
        EffectsModule.forRoot([AppEffects, AuthEffects]),
        StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
        
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
      ],
    bootstrap: [AppComponent]
})
export class AppModule { }