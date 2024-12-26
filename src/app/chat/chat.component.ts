import { Component, OnInit } from '@angular/core';
import { AuthFacade } from '../auth/auth.facade';
import { User } from '../auth/models/user.model';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

    user: User;

    constructor(
        private authFacade: AuthFacade,
    ) {

    }

    ngOnInit(): void {
        this.authFacade.getUser().subscribe(user => {
            if(user!=null) this.user=user;
        });
    }

    selectedChatId: number;
    onSidebarChatClicked(chatId: number) {
        this.selectedChatId = chatId;
    }

}