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

  public send(eventName: string, data: any): Promise<void> {
    return this.hubConnection.send(eventName, data);
  }

  public invoke(eventName: string, data: any): Promise<any> {
    return this.hubConnection.invoke(eventName, data);
  }

  testConnection(){
    console.log('test call made');
    this.hubConnection.send('TestClientCall', this.hubConnection.connectionId);
  }


  sendNewMessage(message: MessageRequest) {
    this.hubConnection.send('NewMessage', message);
  }
}


