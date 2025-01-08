import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CustomizerSettingsService } from 'src/app/core/services/customizer-settings.service';
import { ChatService } from '../chat.service';
import { ChatDetails, MediaType, Message, MessageRequest, MessageStatus } from '../chat.types';
import { User } from 'src/app/auth/models/user.model';
import { SignalRService } from 'src/app/signalr.service';

@Component({
    selector: 'app-conversation',
    templateUrl: './conversation.component.html',
    styleUrl: './conversation.component.scss',
})
export class ConversationComponent implements OnInit {
    @Input() user: User;
    @Input() conversation: ChatDetails;

    constructor(
      public themeService: CustomizerSettingsService,
      private chatService: ChatService,
      private signalRService: SignalRService
    ) {}
  
    ngOnInit(): void {

      console.log('Opened conversation component');
      this.signalRService.invoke('ChatMessagesSeenByUser', this.conversation.id)
        .then((updatedChat: ChatDetails) => {
          console.log('ChatMessagesSeenByUser request completed.');
          console.log('Updating conversation from server response');
          // this.chatService.updateLastMessageInChatSidebar(updatedChat.messages[updatedChat.messages.length-1])
          this.chatService.updateConversation(updatedChat);
        })
        .catch((err) => {
          console.error("Error sending message:", err);
        });
      
      // this.signalRService.on('ReceiveMessage', (message: Message) => {
        // this.conversation.messages.push(message);
        // this.chatService.addMessageToConversation(message);

        // this.signalRService.send('MessageDeliveredToUser', message.id)
        //   .catch((err) => {
        //       console.error("Error while updated isDelivered in message's message status:", err);
        //   });

        // this.signalRService.send('MessageSeenByUser', message.id)
        //   .catch((err) => {
        //       console.error("Error while updated isSeen in message's message status:", err);
        //   });
      // });

      this.signalRService.on('MessageUpdated', (updatedMessage: Message)=> {
        console.log('Updated Message recieved from server');
        this.chatService.updateMessageInConversation(updatedMessage);
      })

      this.signalRService.on('ChatUpdated', (updatedChat: ChatDetails) => {
        console.log('Updated Chat recieved from server');
        this.chatService.updateLastMessageInChatSidebar(updatedChat.messages[updatedChat.messages.length-1])
        this.chatService.updateConversation(updatedChat);
      })
    }

    get chatName(){
      if(this.conversation.isGroup){
        return this.conversation.chatName;
      }
      const otherUser = this.conversation.messages.filter(m => m.sender.id !== this.user.id)[0]?.sender;
      const otherUserAvatar = otherUser.avatar
      return `${otherUser.firstName} ${otherUser.lastName}`;
    }

    messageContent: string = '';
    onSubmit() {
        if (this.messageContent.trim()) {
            const message: MessageRequest = {
              chatId: this.conversation.id,
              content: this.messageContent,
              mediaType: MediaType.Text,
            }
            
            this.signalRService.invoke('NewMessage', message)
              .then((newMessage: Message) => {
                this.chatService.updateLastMessageInChatSidebar(newMessage);
                this.chatService.addMessageToConversation(newMessage);
              })
              .catch(err => {
                console.log('Error sending new message: ', err);
              });
            this.messageContent = ''; // Clear the input after submission
        }
    }

    isMessageByMe(messageUserId: number) : boolean {
      const isMessageByMe = messageUserId==this.user.id;
      // console.log('Message by me: ', isMessageByMe);
      return isMessageByMe;
    }

    isDelivered(messageStatuses: MessageStatus[]){
      const isDelivered = messageStatuses.every(status => status.isDelivered);
      // console.log('Is Delivered: ', isDelivered);
      return isDelivered;
      
    }

    isSeen(messageStatuses: MessageStatus[]){
      const isSeen = messageStatuses.every(status => status.isSeen);
      // console.log('Is Seen: ', isSeen);
      
      return isSeen;
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    toggleRTLEnabledTheme() {
        this.themeService.toggleRTLEnabledTheme();
    }
}
