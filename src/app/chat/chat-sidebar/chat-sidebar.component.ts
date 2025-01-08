import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CustomizerSettingsService } from '../../core/services/customizer-settings.service'
import { ChatService } from '../chat.service';
import { ChatSummary } from '../chat.types';
import { SignalRService } from 'src/app/signalr.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-chat-sidebar',
    templateUrl: './chat-sidebar.component.html',
    styleUrls: ['./chat-sidebar.component.scss']
})
export class ChatSidebarComponent implements OnInit {

    // @Output() openChatEvent = new EventEmitter<number>();
    @Input() chatList: ChatSummary[];

    constructor(
        public themeService: CustomizerSettingsService,
        private chatService: ChatService,
        private signalRService: SignalRService
    ) {}
    
    ngOnInit(): void {
    }
    
    onChatClicked(chatId: number) {
        this.chatService.getConversation(chatId);
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    toggleRTLEnabledTheme() {
        this.themeService.toggleRTLEnabledTheme();
    }

}