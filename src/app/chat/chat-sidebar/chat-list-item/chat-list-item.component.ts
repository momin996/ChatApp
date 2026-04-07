import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChatService } from '../../chat.service';
import { ChatListItem, MessageDto, MessageStatusDto } from '../../chat.types';

@Component({
  selector: 'app-chat-list-item',
  standalone: false,
  templateUrl: './chat-list-item.component.html',
  styleUrl: './chat-list-item.component.scss'
})
export class ChatListItemComponent implements OnChanges {
  
  @Input() userId:number;
  @Input() chatListItem: ChatListItem;
  
  isDelivered = false;
  isSeen = false;
  // showDeliveryStatus = false;

  constructor(
    private chatService: ChatService,
  ) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['chatListItem']) return;

    const lastMessage: MessageDto = this.chatListItem?.lastMessage as MessageDto;
    const statuses = (lastMessage?.messageStatuses ?? []) as MessageStatusDto[];
    this.isDelivered = statuses.length > 0 && this.chatService.isMessageDelivered(statuses);
    this.isSeen = statuses.length > 0 && this.chatService.isMessageSeen(statuses);
    // this.showDeliveryStatus = this.userId === lastMessage.messageBy.userId;
  }

  get showDeliveryStatus() {
    return this.userId === this.chatListItem?.lastMessage.messageBy.userId;
  }

  get chatName(): string {
    if(this.chatListItem.isGroup){
      return this.chatListItem.chatName ?? 'Group';
    }
    const otherParticipant = this.chatListItem.participants.find(p => p.userId !== this.userId);
    if(!otherParticipant) return 'Chat';

    return otherParticipant?.firstName + ' ' + otherParticipant?.lastName;
  }

  get chatImage(): string {
    if(this.chatListItem.isGroup){
      return 'assets/img/user/user0.jpg';
    }
    return this.chatListItem.participants.find(p => p.userId !== this.userId)?.avatar ?? 'assets/img/user/user0.jpg';
  }

  get messageContent(): string {
    let messageToShow = this.chatListItem.lastMessage.content
    if(messageToShow.length>=20){
      messageToShow = messageToShow.substring(0, 20) + '...';
    }
    return messageToShow;
  }

  // showMessageStatus(): boolean {
  //   return this.chatListItem.lastMessage.
  // }
  
}
