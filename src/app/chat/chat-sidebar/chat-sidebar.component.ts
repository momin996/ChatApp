import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CustomizerSettingsService } from '../../core/services/customizer-settings.service'
import { ChatService } from '../chat.service';
import { ChatSummary } from '../chat.types';
import { User } from 'src/app/auth/models/user.model';

@Component({
    selector: 'app-chat-sidebar',
    templateUrl: './chat-sidebar.component.html',
    styleUrls: ['./chat-sidebar.component.scss']
})
export class ChatSidebarComponent implements OnInit {

    @Input() user : User;
    chats: ChatSummary[];

    constructor(
        public themeService: CustomizerSettingsService,
        private chatService: ChatService
    ) {}

    ngOnInit(): void {

        this.chatService.getChats(this.user.id)
            .subscribe((chats: ChatSummary[]) => {
                this.chats = chats;
            });
    }

    // this.chatName = this.chatItem.isGroup && this.chatItem.chatName ? this.chatItem.chatName : this.chatItem.lastMessage.sender.firstName;

    getChatName(chatItem: ChatSummary){
        return chatItem.isGroup && chatItem.chatName ? chatItem.chatName : chatItem.lastMessage.sender.firstName;
    }

    @Output() openChat = new EventEmitter<number>();
    onChatClicked(chatId: number) {
        this.openChat.emit(chatId);
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    toggleRTLEnabledTheme() {
        this.themeService.toggleRTLEnabledTheme();
    }

}