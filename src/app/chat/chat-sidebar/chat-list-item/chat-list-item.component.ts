import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { ChatListItem, Message, MessageStatusDto } from '../../models/chat.types';
import { isMessageDelivered, isMessageSeen } from '../../chat.utils';
import * as ChatActions from '../../store/chat.actions';

@Component({
  selector: 'app-chat-list-item',
  standalone: false,
  templateUrl: './chat-list-item.component.html',
  styleUrl: './chat-list-item.component.scss'
})
export class ChatListItemComponent implements OnChanges {
  
  @Input() userId:number;
  @Input() chatListItem: ChatListItem;
  @Output() chatSelected = new EventEmitter<number>();
  
  isDelivered = false;
  isSeen = false;
  // showDeliveryStatus = false;

  constructor(
    private store: Store,
  ) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['chatListItem']) return;

    const statuses = (this.chatListItem?.lastMessage?.messageStatuses ?? []) as MessageStatusDto[];
    this.isDelivered = statuses.length > 0 && isMessageDelivered(statuses);
    this.isSeen = statuses.length > 0 && isMessageSeen(statuses);
    // this.showDeliveryStatus = this.userId === lastMessage.messageBy.userId;
  }

  onChatClicked(chatId: number) {
    this.store.dispatch(ChatActions.loadConversation({ chatId, reset: true }));
    this.chatSelected.next(chatId);
  }

  get showDeliveryStatus() {
    return this.userId === this.chatListItem?.lastMessage.sendUserId;
  }

  get chatName(): string {
    if(this.chatListItem.isGroup){
      return this.chatListItem.chatName ?? 'Group';
    }
    const otherParticipant = this.chatListItem.otherUser;
    if(!otherParticipant) return 'Chat';

    return otherParticipant?.firstName + ' ' + otherParticipant?.lastName;
  }

  get chatImage(): string {
    if(this.chatListItem.isGroup){
      return 'assets/img/user/group.jpg';
    }
    return this.chatListItem?.otherUser?.avatar ?? 'assets/img/user/user0.jpg';
  }

  get messageContent(): string {
    let messageToShow = this.chatListItem.lastMessage.content;
    if(messageToShow.length>=20){
      messageToShow = messageToShow.substring(0, 18).trimEnd() + '...';
    }
    return messageToShow;
  }

  // showMessageStatus(): boolean {
  //   return this.chatListItem.lastMessage.
  // }
  
}
