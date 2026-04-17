import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { authGaurd } from '../auth/gaurds/auth.guard';
import { ChatComponent } from '../chat/chat.component';
import { ChatSidebarComponent } from '../chat/chat-sidebar/chat-sidebar.component';
import { ChatListItemComponent } from '../chat/chat-sidebar/chat-list-item/chat-list-item.component';
import { ConversationComponent } from '../chat/conversation/conversation.component';
import { CreateContactComponent } from '../contact/create-contact/create-contact.component';
import { ContactsDropdownComponent } from '../contact/contacts-dropdown/contacts-dropdown.component';
import { chatReducer } from './store/chat.reducer';
import { ChatEffects } from './store/chat.effects';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { CHAT_FEATURE_KEY } from './store/chat.selectors';


const chatRoutes: Routes = [
    {
        path: '',
        component: ChatComponent,
        canActivate: [authGaurd],
    }
];

@NgModule({
    declarations: [
        ChatComponent,
        ChatSidebarComponent,
        ChatListItemComponent,
        ConversationComponent,
        CreateContactComponent,
        ContactsDropdownComponent
    ],
    imports: [
        StoreModule.forFeature(CHAT_FEATURE_KEY, chatReducer),
        EffectsModule.forFeature([ChatEffects]),
        RouterModule.forChild(chatRoutes),
        SharedModule
    ],
})
export class ChatModule {}
