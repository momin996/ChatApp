import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CustomizerSettingsService } from '../../core/services/customizer-settings.service'
import { ChatService } from '../chat.service';
import { ChatSummary } from '../chat.types';

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
        private chatService: ChatService
    ) {}

    ngOnInit(): void {
        this.getChats();
    }

    private getChats(){
        this.chatService.getChats()
            .subscribe((chats: ChatSummary[]) => {
                this.chats = chats;
        });
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