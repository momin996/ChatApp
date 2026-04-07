import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { CustomizerSettingsService } from '../../core/services/customizer-settings.service'
import { ChatService } from '../chat.service';
import { ChatListItem } from '../chat.types';
import { ContactDto } from 'src/app/contact/contact.type';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-chat-sidebar',
    templateUrl: './chat-sidebar.component.html',
    styleUrls: ['./chat-sidebar.component.scss']
})
export class ChatSidebarComponent implements OnInit, AfterViewInit {

    @Input() userId:number;
    chatList$: Observable<ChatListItem[]> = this.chatService.chatList$;
    chats: ChatListItem[] = [];

    constructor(
        public themeService: CustomizerSettingsService,
        private chatService: ChatService,
    ) {}
    
    ngOnInit(): void {
        this.chatService.loadChats(true).subscribe();
    }

    @ViewChild('scrollbar', { static: false }) scrollbar: any;

    ngAfterViewInit() {
        setTimeout(() => {
            const viewport = this.scrollbar?.viewport?.nativeElement;
    
            if (!viewport) {
                console.error('Viewport not found');
                return;
            }
    
            viewport.addEventListener('scroll', this.onScroll.bind(this));
        }, 100);
    }

    onScroll(event: any) {
        const target = event.target;
    
        const atBottom =
            target.scrollTop + target.clientHeight >= target.scrollHeight - 50;
    
        if (atBottom) {
            console.log('Reached bottom'); // debug
            this.chatService.loadChats();
        }
    }

    private searchTimeout: any;

    onSearch(event: any) {
        const value = event.target.value;

        clearTimeout(this.searchTimeout);

        this.searchTimeout = setTimeout(() => {
            this.chatService.setSearch(value);
        }, 300);
    }
    
    onChatClicked(chatId: number) {
        this.chatService.getConversation(chatId);
    }

    onContactSelected(contact: ContactDto): void {
        this.chatService.openConversationForContact(contact);
    }

}