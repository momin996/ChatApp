import { DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SignalRService } from '../signalr.service';
import { ChatService } from './chat.service';
import { MessageDto, MessageIdentifierDto, MessagesBulkDeliveredOrSeenDto } from './chat.types';
import { AuthFacade } from '../auth/auth.facade';

@Injectable({
  providedIn: 'root'
})
export class ChatOrchestratorService {

  userId: number;
  eventsRegistered: boolean = false;

  constructor(
    private destroyRef: DestroyRef,
    private authFacade: AuthFacade,
    private signalR: SignalRService,
    private chatService: ChatService,
  ) {
    this.authFacade.getUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        if(user){
          this.userId = user.id;
          this.registerListeners();
        }
      });
  }

  private registerListeners() {

    if(this.eventsRegistered) return
    console.log('Chat Orchestrator - Subscribing to Signal R Event Listener and implement Reactors');
    
    // RECEIVE MESSAGE
    this.signalR.receiveMessageEvent$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((message: MessageDto) => {
        console.log('Message Received by user: ', this.userId);
        
        // 1. Update state
        this.chatService.updateLastMessageInSidebar(message);
        this.chatService.addMessageToConversation(message);

        // 2. Build identifier (✅ FIXED receiverId)
        const identifier: MessageIdentifierDto = {
          chatId: message.chatId,
          messageId: message.id,
          senderId: message.messageBy.userId,
          receiverId: this.userId
        };

        if(message.messageBy.userId !== this.userId){
          // 3. Decide delivery vs seen
          if (this.chatService.isConverationOpened(message.chatId)) {
            this.signalR.messageDeliveredAndSeenForUser(identifier);
          } else {
            this.signalR.messageDeliveredToUser(identifier);
          }
        }
      });

    // DELIVERED
    this.signalR.messageDeliveredEvent$             // MessageDelivered
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((identifier: MessageIdentifierDto) => {
        this.chatService.markMessageDeliveredInSidebar(identifier);
        this.chatService.markMessageDeliveredInConversation(identifier);
      });

    // DELIVERED + SEEN
    this.signalR.messageDeliveredAndSeenEvent$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((identifier: MessageIdentifierDto) => {
        this.chatService.markMessageDeliveredAndSeenInSidebar(identifier);
        this.chatService.markMessageDeliveredAndSeenInConversation(identifier);
      });

      // BULK DELIVERED
    this.signalR.pendingMessagesDeliveredEvent$       // PendingMessagesDelivered
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((identifiers: MessagesBulkDeliveredOrSeenDto[]) => {
        this.chatService.bulkMarkMessagesDeliveredInSidebar(identifiers);
        this.chatService.bulkMarkMessagesDeliveredConversation(identifiers);
      });

    // BULK SEEN
    this.signalR.messagesForChatSeenEvent$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((identifier: MessagesBulkDeliveredOrSeenDto) => {
        this.chatService.markMessageSeenInSidebar(identifier);
        this.chatService.markMessagesSeenInConversation(identifier);
      });

    this.eventsRegistered = true;
  }
}