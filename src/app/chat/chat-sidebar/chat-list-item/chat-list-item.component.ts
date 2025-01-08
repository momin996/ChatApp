import { Component, Input, OnInit } from '@angular/core';
import { ChatSummary, Message } from '../../chat.types';
import { ChatService } from '../../chat.service';
import { AuthFacade } from 'src/app/auth/auth.facade';

@Component({
  selector: 'app-chat-list-item',
  standalone: false,
  templateUrl: './chat-list-item.component.html',
  styleUrl: './chat-list-item.component.scss'
})
export class ChatListItemComponent implements OnInit {
  
  @Input() chatListItem: ChatSummary;
  
  isMyMessage = false;
  isDelivered = false;
  isSeen = false;

  constructor(
    private authFacade: AuthFacade,
    private chatService: ChatService,
  ) {

  }

  ngOnInit(): void {
    
    this.authFacade.getUser().subscribe(user => {
        if(user!=null) {
            const lastMessage = this.chatListItem.lastMessage;
            this.isMyMessage = this.chatService.isMyMessage(lastMessage, user.id);
            this.isDelivered = this.chatService.isMessageDelivered(lastMessage.messageStatuses)
            this.isSeen = this.chatService.isMessageSeen(lastMessage.messageStatuses)
            // console.log(this.isMyMessage, this.isDelivered, this.isSeen);
        }
    });
  }
  
}
