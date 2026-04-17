import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { Message, MessageIdentifierDto, MessageRequest, MessagesBulkDeliveredOrSeenDto } from './chat/models/chat.types';
import { AppConfigService } from './core/services/app-config.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { TokenStorageService } from './auth/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  private readonly signalRUrl: string;
  private hubConnection : HubConnection | null;

  private connectionPromise: Promise<void> | null = null;
  private connectionReadySubject = new BehaviorSubject<boolean>(false);
  public connectionReady$ = this.connectionReadySubject.asObservable();

  constructor(
    private appConfig: AppConfigService,
    private tokenStorage: TokenStorageService,
  ) {
    this.signalRUrl = this.appConfig.signalRUrl
  }

  // Build and start the SignalR connection
  public startConnection(): Promise<void> {

    if (this.isHubConnected) {
      console.log('SignalR already connected');
      return Promise.resolve();
    }
  
    // connecting → reuse promise
    if (this.connectionPromise) {
      console.log('SignalR connection in progress');
      return this.connectionPromise;
    }

    console.log('SignalR Starting connection...');

    const token = this.tokenStorage.getAccessTokenValue();

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.signalRUrl, { withCredentials :false, accessTokenFactory : ()=> token!})
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();
    // reconnect handling
    this.hubConnection.onreconnecting(() => {
      this.connectionReadySubject.next(false);
    });
  
    this.hubConnection.onreconnected(() => {
      this.registerHubMethods();
      this.connectionReadySubject.next(true);
    });
  
    this.hubConnection.onclose(() => {
      this.connectionReadySubject.next(false);
    });

    this.connectionPromise = this.hubConnection.start()
      .then(() => {
        console.log(`SignalR Hub Connected (${this.isHubConnected}) with Id: ${this.hubConnection?.connectionId}`);
        this.registerHubMethods();
        this.connectionReadySubject.next(true);
        this.connectionPromise = null;
      })
      .catch(err => {
        this.connectionPromise = null;
        this.connectionReadySubject.next(false);
        console.error('SignalR error:', err);
        throw err;
      });

    return this.connectionPromise;
  }

  // Handle disconnection
  public stopConnection(): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state === HubConnectionState.Disconnected) {
      console.log("Hub already disconnected, no need to stop connection");
      return Promise.resolve();
    }

    return this.hubConnection
      .stop()
      .then(() => {
        console.log('SignalR connection stopped');
      })
      .catch((err) => {
        console.error('Error stopping SignalR connection: ', err);
      })
      .finally(() => {
        this.hubConnection = null;
        this.connectionPromise = null;

        this.connectionReadySubject.next(false);
      });
  }

  private get isHubConnected(): boolean {
    return this.hubConnection?.state === HubConnectionState.Connected;
  }

  testConnection(){
    console.log('test call made');
    this.hubConnection?.send('TestClientCall', this.hubConnection?.connectionId);
  }

  public messagesSeenForChatUser(chatId: number){
    if (!this.isHubConnected) {
      console.log('SignalR not connected. Message not sent.');
      return;
    }
    console.log("SingalR - Send Method - messagesSeenForChatUser");
    this.hubConnection?.send('MessagesSeenForChatUser', chatId)
    .catch(err => {
        console.log('Error MessagesSeenForChatUser: ', err);
      });
  }

  public sendNewMessage(message: MessageRequest) {
    if (!this.isHubConnected) return;
    console.log("SingalR - Send Method - sendNewMessage");
    
    console.log('NewMessage API method called on HUB');
    this.hubConnection?.send('NewMessage', message)
      .catch(err => {
        console.log('Error sending new message: ', err);
      });
  }

  public messageDeliveredToUser(messageIdentifier: MessageIdentifierDto){
    if (!this.isHubConnected) return;
    console.log("SingalR - Send Method - messageDeliveredToUser");
    
    console.log('MessageDelivered API method called on HUB');
    this.hubConnection?.send('MessageDeliveredToUser', messageIdentifier)
      .catch(err => {
        console.log('Error MessageDeliveredToUser: ', err);
      });
  }
  
  public messageDeliveredAndSeenForUser(messageIdentifier: MessageIdentifierDto){
    if (!this.isHubConnected) return;
    console.log("SingalR - Send Method - messageDeliveredAndSeenForUser");

    console.log('MessageDeliveredAndSeen API method called on HUB');
    this.hubConnection?.send('MessageDeliveredAndSeenForUser', messageIdentifier)
      .catch(err => {
        console.log('Error MessageDeliveredAndSeenForUser: ', err);
      });
  }

  private registerHubMethods(){
    
    // this.hubConnection?.off('ReceiveMessage');
    // this.hubConnection?.off('MessageDelivered');
    // this.hubConnection?.off('MessageDeliveredAndSeen');
    // this.hubConnection?.off('MessagesForChatSeen');
    // this.hubConnection?.off('PendingMessagesDelivered');

    this.receiveMessageAction();
    this.messageDeliveredAction();
    this.messageDeliveredAndSeenAction();
    this.messagesForChatSeenAction();
    this.pendingMessagesDeliveredAction();

    console.log('Registered SignalR events');
  }

  private receiveMessageSubject = new Subject<Message>();
  receiveMessageEvent$ = this.receiveMessageSubject.asObservable();
  private receiveMessageAction() {
    this.hubConnection?.on('ReceiveMessage', (message: Message) => {
      console.log('SingalR - On Method - Receive Message Event triggered');
      this.receiveMessageSubject.next(message);
    });
  }

  private messageDeliveredSubject = new Subject<MessageIdentifierDto>();
  messageDeliveredEvent$ = this.messageDeliveredSubject.asObservable();
  private messageDeliveredAction() {
    this.hubConnection?.on('MessageDelivered', (messageIdentifier: MessageIdentifierDto) => {
      console.log('SingalR - On Method - Message Delivered event triggered');
      this.messageDeliveredSubject.next(messageIdentifier);
    });
  }

  private messageDeliveredAndSeenSubject = new Subject<MessageIdentifierDto>();
  messageDeliveredAndSeenEvent$ = this.messageDeliveredAndSeenSubject.asObservable();
  private messageDeliveredAndSeenAction() {
    this.hubConnection?.on('MessageDeliveredAndSeen', (messageIdentifier: MessageIdentifierDto) => {
      console.log('SingalR - On Method - Message Delivered and Seen event triggered');
      this.messageDeliveredAndSeenSubject.next(messageIdentifier);
    });
  }

  private messagesForChatSeenSubject = new Subject<MessagesBulkDeliveredOrSeenDto>();
  messagesForChatSeenEvent$ = this.messagesForChatSeenSubject.asObservable();
  private messagesForChatSeenAction() {
    this.hubConnection?.on('MessagesForChatSeen', (messageIdentifiers: MessagesBulkDeliveredOrSeenDto) => {
      console.log('SingalR - On Method - Message Seen for chat event triggered');
      this.messagesForChatSeenSubject.next(messageIdentifiers);
    });
  }

  
  private pendingMessagesDeliveredSubject = new Subject<MessagesBulkDeliveredOrSeenDto[]>();
  pendingMessagesDeliveredEvent$ = this.pendingMessagesDeliveredSubject.asObservable();
  private pendingMessagesDeliveredAction() {
    this.hubConnection?.on('PendingMessagesDelivered', (messageIdentifiers: MessagesBulkDeliveredOrSeenDto[]) => {
      console.log('SingalR - On Method - Pending Messages Delivered event triggered');
      this.pendingMessagesDeliveredSubject.next(messageIdentifiers);
    });
  }
  
}


