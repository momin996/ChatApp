import { Component, OnInit } from '@angular/core';
import { CustomizerSettingsService } from 'src/app/core/services/customizer-settings.service';
import { ChatService } from '../chat.service';
import { ChatDetails, MediaType, MessageRequest } from '../chat.types';

@Component({
    selector: 'app-conversation',
    templateUrl: './conversation.component.html',
    styleUrl: './conversation.component.scss',
})
export class ConversationComponent implements OnInit {
    userId: number;
    chatId: number;
    chat: ChatDetails;

    constructor(
        public themeService: CustomizerSettingsService,
        private chatService: ChatService
    ) {}

    ngOnInit(): void {
        this.userId = 1;
        this.chatId = 5;

        this.chatService
            .getChatById(this.chatId)
            .subscribe((chat: ChatDetails) => {
              this.chat = chat;
              
              console.dir(chat);
            });
    }

    messageContent: string = '';

    onSubmit() {
        if (this.messageContent.trim()) {
            // Handle the message submission logic here
            const json: MessageRequest = {
              chatId: 5,
              senderId: 1,
              content: this.messageContent,
              mediaType: MediaType.Text,
            }
            console.log('Message submitted:', this.messageContent);
            this.messageContent = ''; // Clear the input after submission

            this.chatService.sendMessage(json)
              .subscribe(res => {
                console.log(res);
              });
        }
    }

    messageValue: string
    sendMessageToExistingChat(messageValue: string){
      if(messageValue!=''){
        console.log(messageValue);
        
        const json: MessageRequest = {
          senderId: 1,
          recieverId: 2,
          content: messageValue,
          mediaType: MediaType.Text,
        }

        // this.chatService.sendMessage(json)
        //   .subscribe(res => {
        //     console.log(res);
        //   });
      }
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    toggleRTLEnabledTheme() {
        this.themeService.toggleRTLEnabledTheme();
    }
}
