import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { MessageRequest } from './chat/chat.types';
import { AppConfigService } from './core/services/app-config.service';
import { LocalStorageService } from './core/services/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection : HubConnection;
  private isConnected: boolean = false;

  constructor(
    private appConfig: AppConfigService,
    private localStorageService: LocalStorageService,
  ) {
    
  }

  // Build and start the SignalR connection
  public startConnection(): Promise<void> {
    if (this.isConnected) {
      console.log('SignalR is already connected.');
      return Promise.resolve();
    }

    const accessToken = this.localStorageService.getAccessToken().token;
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(
        this.appConfig.signalRUrl,
      {
        withCredentials :false,
        accessTokenFactory : ()=> accessToken
      }
      )
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    return this.hubConnection
      .start()
      .then(() => {
        this.isConnected = true;
        console.log('SignalR connection started');
      })
      .catch((err) => {
        console.error('SignalR connection error: ', err);
        this.isConnected = false;
      });
  }

  // Handle disconnection
  public stopConnection(): Promise<void> {
    if (!this.isConnected) {
      return Promise.resolve();
    }

    return this.hubConnection
      .stop()
      .then(() => {
        console.log('SignalR connection stopped');
        this.isConnected = false;
      })
      .catch((err) => console.error('Error stopping SignalR connection: ', err));
  }

  // Subscribe to a server event
  public on(eventName: string, callback: (...args: any[]) => void): void {
    this.hubConnection.on(eventName, callback);
  }

  // connect(){
  //   const accessToken = this.localStorageService.getAccessToken().token;
  //   this.hubConnection = new HubConnectionBuilder()
  //   .withUrl(
  //     this.appConfig.signalRUrl,
  //     {
  //       withCredentials :false,
  //       accessTokenFactory : ()=> accessToken
  //     }
  //   )
  //   .withAutomaticReconnect()
  //   .configureLogging(LogLevel.Information)
  //   .build();

  //   // this.initiateListeners();
    
  // }

  // startConnection(){
  //   if(this.hubConnection.state != HubConnectionState.Connected && this.hubConnection.state != HubConnectionState.Connecting){
  //     this.hubConnection.start();
  //   }
  // }

  testConnection(){
    console.log('test call made');
    this.hubConnection.send('TestClientCall', this.hubConnection.connectionId);
  }
  

  private initiateListeners(){

    // const recieveMessageCallBack = (data: any) => {
    //   alert('Client recieves event from server');
    //   console.log('New Message: ', data);
    // }

    this.hubConnection.on('ReceiveMessage', (data) => {
      
    });
  }

  onMessageReceived(callback: (senderId: string, message: string) => void): void {
    this.hubConnection.on('ReceiveMessage', (senderId: string, message: string) => {
      callback(senderId, message);
    });
  }


  sendNewMessage(message: MessageRequest) {
    this.hubConnection.send('NewMessage', message);
  }
}


