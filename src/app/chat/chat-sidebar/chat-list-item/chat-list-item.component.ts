import { Component, Input, OnInit } from '@angular/core';
import { ChatSummary } from '../../chat.types';

@Component({
  selector: 'app-chat-list-item',
  standalone: false,
  templateUrl: './chat-list-item.component.html',
  styleUrl: './chat-list-item.component.scss'
})
export class ChatListItemComponent implements OnInit {
  @Input() chatItem: ChatSummary;
  chatName: string;
  lastMessage: string;
  lastMessageAt: string;

  ngOnInit(): void {
    this.chatName = this.chatItem.isGroup && this.chatItem.chatName ? this.chatItem.chatName : this.chatItem.lastMessage.sender.firstName;
    this.lastMessage = this.chatItem.lastMessage.content;
    this.lastMessageAt = this.chatItem.lastMessage.timestamp
  }
}
