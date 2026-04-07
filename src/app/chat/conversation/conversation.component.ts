import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CustomizerSettingsService } from 'src/app/core/services/customizer-settings.service';
import { ChatService } from '../chat.service';
import { ChatDto, MediaType, MessageDto, MessageRequest, MessageStatusDto, NewChatWithFirstMessageRequest } from '../chat.types';
import { User } from 'src/app/auth/models/user.model';
import { SignalRService } from 'src/app/signalr.service';

@Component({
    selector: 'app-conversation',
    templateUrl: './conversation.component.html',
    styleUrl: './conversation.component.scss',
})
export class ConversationComponent implements OnInit, OnChanges {
  @Input() user: User;
  @Input() conversation: ChatDto;


  constructor(
    public themeService: CustomizerSettingsService,
    private chatService: ChatService,
    private signalRService: SignalRService
  ) {}


  ngOnInit(): void {
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['conversation']) {
      this.markConversationSeen();

      if(!changes['conversation'].firstChange){
        this.messageContent = '';
      }
    }
  }


  get chatImage(): string {
    if(this.conversation.isGroup){
      return 'assets/img/user/user0.jpg';
    }

    if(this.conversation.isDraft){
      return this.conversation.draftContact!.avatar!;
    }

    const otherSender = this.conversation.participants.find(p => p.userId !== this.user.id);
    //.messages.find(m => m.sender.id !== this.user.id)?.sender;
    if(otherSender){
      return otherSender.avatar!;
    }

    return 'assets/img/user/user0.jpg';
  }
  
  get chatName(): string {

    if(this.conversation.isGroup){
      return this.conversation.chatName ?? 'Group';
    }

    if(this.conversation.isDraft){
      const draftContact = this.conversation.draftContact!;
      return draftContact.firstName + ' ' + draftContact.lastName;
    }

    const otherSender = this.conversation.participants.find(p => p.userId !== this.user.id);
    //.messages.find(m => m.sender.id !== this.user.id)?.sender;
    if(otherSender){
      return `${otherSender.firstName} ${otherSender.lastName}`.trim() || 'Chat';
    }


    return this.conversation.chatName ?? 'Chat';
  }

  messageContent: string = '';
  onSubmit() {
      if (this.messageContent.trim()) {
          // Draft flow: create chat with first message via REST endpoint
          if (this.conversation?.isDraft && this.conversation?.draftContact) {
            const req: NewChatWithFirstMessageRequest = {
              chatName: null,
              chatParticipantIds: [this.conversation.draftContact.contactId],
              isGroup: false,
              message: {
                content: this.messageContent,
                mediaUrl: null,
                mediaType: MediaType.Text,
              },
            };

            this.chatService.startNewChatWithFirstMessage(req).subscribe({
              next: (res) => {
                if (res?.isSuccess && res?.response?.id) {
                  this.chatService.updateConversation(res.response);
                }
              },
              error: (err) => {
                console.error('Error creating new chat with first message:', err);
              },
            });
            this.messageContent = '';
            return;
          }

          // Existing chat flow: send message via SignalR
          const message: MessageRequest = {
            chatId: this.conversation.id,
            content: this.messageContent,
            mediaType: MediaType.Text,
          };

          this.signalRService.sendNewMessage(message);
          this.messageContent = ''; // Clear the input after submission
      }
  }

  isMessageByMe(messageUserId: number) : boolean {
    const isMessageByMe = messageUserId==this.user.id;
    return isMessageByMe;
  }

  isDelivered(messageStatuses: MessageStatusDto[]){
    const isDelivered = messageStatuses.every(status => status.isDelivered);
    return isDelivered;
    
  }

  isSeen(messageStatuses: MessageStatusDto[]){
    const isSeen = messageStatuses.every(status => status.isSeen);
    return isSeen;
  }

  trackByMessageId(index: number, message: MessageDto) {
    return message.id;
  }

  private markConversationSeen(){
    this.signalRService.messagesSeenForChatUser(this.conversation.id);
  }
}
