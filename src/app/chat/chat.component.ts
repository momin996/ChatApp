import { Component, OnInit } from '@angular/core';
import { AuthFacade } from '../auth/auth.facade';
import { User } from '../auth/models/user.model';
import { ChatDto, ChatListItem } from './chat.types';
import { ChatService } from './chat.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

    user$: Observable<User | null> = this.authFacade.getUser();
    chatList$: Observable<ChatListItem[]> = this.chatService.chatList$;
    conversation$: Observable<ChatDto | null> = this.chatService.conversation$;

    constructor(
        private authFacade: AuthFacade,
        private chatService: ChatService,
    ) {
    }

    ngOnInit(): void {
        console.log('Chat component init method called');
        
        this.markAllMessagesAsDelivered();
    }

    
    private markAllMessagesAsDelivered(): void {
        // API call to mark all messages as delivered
        this.chatService.userMessagesDelivered()
            .subscribe(() => {
                console.log('All messages (message status) marked as delivered (for logged in user) for all chats');
            });
    }

}