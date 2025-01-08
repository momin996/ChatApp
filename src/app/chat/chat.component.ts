import { Component, OnInit } from '@angular/core';
import { AuthFacade } from '../auth/auth.facade';
import { User } from '../auth/models/user.model';
import { SignalRService } from '../signalr.service';
import { ChatDetails, ChatSummary, Message } from './chat.types';
import { ChatService } from './chat.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

    user$: Observable<User | null> = this.authFacade.getUser();
    chatList$: Observable<ChatSummary[]> = this.chatService.chatList$;
    conversation$: Observable<ChatDetails | null> = this.chatService.conversation$;

    constructor(
        private authFacade: AuthFacade,
        private signalRService: SignalRService,
        private chatService: ChatService,
    ) {
    }

    ngOnInit(): void {
        this.setupSignalR();
    }

    private setupSignalR(): void {
        this.signalRService.startConnection()
            .then(() => {
                console.log('SignalR connection established.');
                this.registerSignalREvents();
            })
            .catch((err) => {
                console.error('Error establishing SignalR connection: ', err)
            });

        this.markAllMessagesAsDelivered();
    }
    
    private markAllMessagesAsDelivered(): void {
        // API call to mark all messages as delivered
        this.chatService.userMessagesDelivered()
            .subscribe(() => {
                console.log('All messages (message status) marked as delivered (for logged in user) for all chats');
                // API call to get chat listing for sidebar
                this.chatService.getChatsForSidebar();
            });
    }
    
    private registerSignalREvents(): void {
        /*

        EVENT LISTENERS
            - SIDEBAR COMPONENT 
                Message Recieved
                Message is deliverd
                Message is seen

            - CONVERSATION COMPONENT
                Message Recieved
                Message is deliverd
                Message is seen
        */
        this.signalRService.on('ReceiveMessage', this.handleReceiveMessage.bind(this));
        this.signalRService.on('MessageUpdated', this.handleMessageStatusesUpdated.bind(this));

        this.signalRService.on('PendingMessagesDelivered', (messages: Message[]) => {
            this.chatService.updateDeliveryStatusInSidebar(messages);
            messages.forEach(m => {
                if(this.chatService.isConverationOpened(m.chatId)){
                    this.chatService.updateMessageInConversation(m);
                }
            })
        });
    }
    
    private handleReceiveMessage(message: Message): void {
        this.chatService.updateLastMessageInChatSidebar(message);
        
        console.log('Send request to server to update message status to deliverd');
        this.signalRService.send('MessageDeliveredToUser', message.id)
            .catch((err) => {
                console.error("Error while updating isDelivered in message's message status:", err);
            });

        if(this.chatService.isConverationOpened(message.chatId)){
            console.log('Send request to server to update message status to seen');
            this.chatService.addMessageToConversation(message);
            this.signalRService.send('MessageSeenByUser', message.id)
                .catch((err) => {
                    console.error("Error while updated isSeen in message's message status:", err);
                });
        }
    }
    
    private handleMessageStatusesUpdated(updatedMessage: Message): void {
        this.chatService.updateLastMessageInChatSidebar(updatedMessage);
    }

    // private setupSignalR(): void {
    //     this.signalRService.startConnection()
    //         .then(() => {
    //             console.log('SignalR connection established.');

    //             // Make rest api request to mark all of the messages recieved by logged in user in all chats as delivered
    //             this.chatService.userMessagesDelivered()
    //                 .subscribe(() => {
    //                     console.log('All messages (message status) marked as delivered for user for all user chats');
    //                     // Make rest api request to get chat list for sidebar component
    //                     this.chatService.getChatsForSidebar();
    //                 });
                
    //             this.signalRService.on('ReceiveMessage', (message: Message) => {
    //                 this.signalRService.invoke('ChatMessageDeliveredToUser', message.id)
    //                 .then((newMessage) => {
    //                     this.chatService.updateLastMessageInChatSidebar(newMessage);
    //                 })
    //                 .catch((err) => {
    //                     console.error("Error while updated isDelivered in message's message status:", err);
    //                 });
    //             });

    //             this.signalRService.on('MessageUpdated', (updatedMessage: Message) => {
    //                 this.chatService.updateLastMessageInChatSidebar(updatedMessage);
    //             })
    //         })
    //         .catch((err) => console.error('Error establishing SignalR connection: ', err));
    // }

}