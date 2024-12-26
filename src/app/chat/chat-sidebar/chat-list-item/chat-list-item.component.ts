import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat-list-item',
  standalone: false,
  templateUrl: './chat-list-item.component.html',
  styleUrl: './chat-list-item.component.scss'
})
export class ChatListItemComponent implements OnInit {
  
  @Input() chatName: string;
  @Input() lastMessage: string;
  @Input() lastMessageAt: string;

  
  ngOnInit(): void {
  }

}
