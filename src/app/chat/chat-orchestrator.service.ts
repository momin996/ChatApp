import { DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { SignalRService } from '../signalr.service';
import { Message, MessageIdentifierDto, MessagesBulkDeliveredOrSeenDto } from './models/chat.types';
import { AuthFacade } from '../auth/auth.facade';
import * as ChatActions from './store/chat.actions';
import { selectChat } from './store/chat.selectors';
import { Subscription, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatOrchestratorService {

  userId: number;
  eventsRegistered: boolean = false;
  receiveMessageSub: Subscription;
  messageDeliveredSub: Subscription;
  messageDeliveredAndSeenSub: Subscription;
  messagesForChatSeenSub: Subscription;
  pendingMessagesDeliveredSub: Subscription;

  constructor(
    private destroyRef: DestroyRef,
    private authFacade: AuthFacade,
    private signalR: SignalRService,
    private store: Store
  ) {
    this.authFacade.getUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        if(user){
          this.userId = user.id;
          this.registerListeners();
        }
        else {
          if(this.eventsRegistered){
            this.receiveMessageSub.unsubscribe()
            this.messageDeliveredSub.unsubscribe()
            this.messageDeliveredAndSeenSub.unsubscribe()
            this.messagesForChatSeenSub.unsubscribe()
            this.pendingMessagesDeliveredSub.unsubscribe()
          }
          this.eventsRegistered = false;
        }
      });
  }

  private registerListeners() {

    if(this.eventsRegistered) {
      console.log('Already Subscribed to signalr subject events in orchestrator service');  
      return;
    }

    console.log('Subscribing to signalr subject events in orchestrator service');
    // RECEIVE MESSAGE
    this.receiveMessageSub = this.signalR.receiveMessageEvent$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((message: Message) => {
        console.log('Message Received by user: ', this.userId);
        
        // 1. Update state
        // this.chatService.updateLastMessageInSidebar(message);
        // this.chatService.addMessageToConversation(message);
        this.store.dispatch(ChatActions.messageReceived({ message }));

        // 2. Build identifier (FIXED receiverId)
        const identifier: MessageIdentifierDto = {
          chatId: message.chatId,
          messageId: message.id,
          senderId: message.messageBy.userId,
          receiverId: this.userId
        };

        if (message.messageBy.userId !== this.userId) {

          this.store.select(selectChat)
            .pipe(take(1))
            .subscribe(chat => {

              const isOpen = chat?.id === message.chatId;

              if (isOpen) {
                this.signalR.messageDeliveredAndSeenForUser(identifier);
              } else {
                this.signalR.messageDeliveredToUser(identifier);
              }
            });
        }

        // if(message.messageBy.userId !== this.userId){
        //   // 3. Decide delivery vs seen
        //   if (this.chatService.isConverationOpened(message.chatId)) {
        //     this.signalR.messageDeliveredAndSeenForUser(identifier);
        //   } else {
        //     this.signalR.messageDeliveredToUser(identifier);
        //   }
        // }
      });

    // DELIVERED
    this.messageDeliveredSub = this.signalR.messageDeliveredEvent$             // MessageDelivered
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((identifier: MessageIdentifierDto) => {
        // this.chatService.markMessageDeliveredInSidebar(identifier);
        // this.chatService.markMessageDeliveredInConversation(identifier);
        this.store.dispatch(ChatActions.messageDelivered({ identifier }));
      });

    // DELIVERED AND SEEN
    this.messageDeliveredAndSeenSub = this.signalR.messageDeliveredAndSeenEvent$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((identifier: MessageIdentifierDto) => {
        // this.chatService.markMessageDeliveredAndSeenInSidebar(identifier);
        // this.chatService.markMessageDeliveredAndSeenInConversation(identifier);
        this.store.dispatch(ChatActions.messageDeliveredAndSeen({ identifier }));
      });

      // BULK SEEN
    this.messagesForChatSeenSub = this.signalR.messagesForChatSeenEvent$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((identifier: MessagesBulkDeliveredOrSeenDto) => {
        // this.chatService.markMessageSeenInSidebar(identifier);
        // this.chatService.markMessagesSeenInConversation(identifier);
        this.store.dispatch(ChatActions.messagesSeen({ identifier }));
      });

      // BULK DELIVERED
    this.pendingMessagesDeliveredSub = this.signalR.pendingMessagesDeliveredEvent$       // PendingMessagesDelivered
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((identifiers: MessagesBulkDeliveredOrSeenDto[]) => {
        // this.chatService.bulkMarkMessagesDeliveredInSidebar(identifiers);
        // this.chatService.bulkMarkMessagesDeliveredConversation(identifiers);
        this.store.dispatch(ChatActions.bulkMessagesDelivered({ identifiers }));
      });

    this.eventsRegistered = true;
  }
}