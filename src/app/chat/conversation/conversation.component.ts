import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CustomizerSettingsService } from 'src/app/core/services/customizer-settings.service';
import { ChatService } from '../chat.service';
import { ChatDetails, MediaType, MessageRequest } from '../chat.types';
import { User } from 'src/app/auth/models/user.model';

@Component({
    selector: 'app-conversation',
    templateUrl: './conversation.component.html',
    styleUrl: './conversation.component.scss',
})
export class ConversationComponent implements OnInit, OnChanges {
    @Input() user: User;
    @Input() chatId: number;
    chat: ChatDetails;

    constructor(
      public themeService: CustomizerSettingsService,
      private chatService: ChatService
    ) {}
  
    ngOnInit(): void {
      // this.getMessages();
    }

    ngOnChanges(changes: SimpleChanges): void {
      if (changes['chatId']) {
        this.getMessages();
      }
    }

    private getMessages(){
      this.chatService
        .getChatById(this.chatId)
        .subscribe((chat: ChatDetails) => {
          this.chat = chat;
          
          
        });
    }

    get chatName(){
      if(this.chat.isGroup){
        return this.chat.chatName;
      }
      const otherUser = this.chat.messages.filter(m => m.sender.id !== this.user.id)[0]?.sender;
      return `${otherUser.firstName} ${otherUser.lastName}`;
    }

    messageContent: string = '';
    onSubmit() {
        if (this.messageContent.trim()) {
            // Handle the message submission logic here
            const json: MessageRequest = {
              chatId: this.chatId,
              content: this.messageContent,
              mediaType: MediaType.Text,
            }
            console.log('Message submitted:', this.messageContent);
            this.messageContent = ''; // Clear the input after submission

            this.chatService.sendMessage(json)
              .subscribe(res => {
                console.log(res);
                this.getMessages();
              });
        }
    }

    isMessageByMe(messageUserId: number) : boolean {
      return messageUserId==this.user.id;
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    toggleRTLEnabledTheme() {
        this.themeService.toggleRTLEnabledTheme();
    }
}
