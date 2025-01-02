import { Component, OnInit } from '@angular/core';
import { AuthFacade } from '../auth/auth.facade';
import { User } from '../auth/models/user.model';
import { SignalRService } from '../signalr.service';
import { Message } from './chat.types';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

    user: User;

    constructor(
        private authFacade: AuthFacade,
        private signalRService: SignalRService
    ) {
    }

    ngOnInit(): void {
        
        this.authFacade.getUser().subscribe(user => {
            if(user!=null) {
                this.user=user;
                this.startSignalRConnection();
                
            }
        });
    }

    private startSignalRConnection(): void {
        this.signalRService
            .startConnection()
            .then(() => console.log('SignalR connection established.'))
            .catch((err) => console.error('Error establishing SignalR connection: ', err));
    }
    
    testSignalR() {
        // this.signalRService.startConnection();
        this.signalRService.testConnection();
    }

    selectedChatId: number;
    onSidebarChatClicked(chatId: number) {
        this.selectedChatId = chatId;
    }

}