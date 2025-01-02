import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CustomizerSettingsService } from '../../core/services/customizer-settings.service'
import { ChatService } from '../chat.service';
import { ChatSummary, Message } from '../chat.types';
import { SignalRService } from 'src/app/signalr.service';

@Component({
    selector: 'app-chat-sidebar',
    templateUrl: './chat-sidebar.component.html',
    styleUrls: ['./chat-sidebar.component.scss']
})
export class ChatSidebarComponent implements OnInit {

    chats: ChatSummary[];
    @Output() openChat = new EventEmitter<number>();

    constructor(
        public themeService: CustomizerSettingsService,
        private chatService: ChatService,
        private signalRService: SignalRService
    ) {}

    ngOnInit(): void {
        this.getChats();
    }

    private getChats(){
        // this.chatService.getChats()
        //     .subscribe((chats: ChatSummary[]) => {
        //         this.chats = chats;
        // });
        this.chatService.chatList$
        .subscribe((chats: ChatSummary[]) => {
            this.chats = chats;
        });

        this.signalRService.on('ReceiveMessage', (message: Message) => {
            this.chatService.addLastMessageToChatListItem(message);
        });
        
        // this.chats = this.chatService.getChatList
    }
    
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