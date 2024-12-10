import { Component, OnInit } from '@angular/core';
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
    currentUserId: number;

    constructor(
        public themeService: CustomizerSettingsService,
        private chatService: ChatService
    ) {}

    ngOnInit(): void {

        this.currentUserId = 1;

        this.chatService.getChats(this.currentUserId)
            .subscribe((chats: ChatSummary[]) => {
                this.chats = chats;
                
                console.dir(chats)
            });
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    toggleRTLEnabledTheme() {
        this.themeService.toggleRTLEnabledTheme();
    }

}