import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../core/services/app-config.service';
import { ChatDetails, ChatListingResponse, ChatResponse, ChatSummary, MediaType, Message, MessageRequest, NewChatRequest } from './chat.types';
import { BehaviorSubject, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl: string;

  private chatListSubject = new BehaviorSubject<ChatSummary[]>([]); // Emits updates for the sidebar
  public chatList$ = this.chatListSubject.asObservable();

  private getChatsForSidebar() : void {
    const apiEndpoint = `${this.apiUrl}/Chats`;
    this.http.get<ChatListingResponse>(apiEndpoint)
      .subscribe(res => {
        if(res.isSuccess){
          this.chatListSubject.next(res.response);
        }
        else {
          this.chatListSubject.next([]);
        }
      });
  }

  addLastMessageToChatListItem(newMessage: Message){
    let chat = this.chatListSubject.value.find(c => c.id===newMessage.chatId);
    
    if(chat){
      chat.lastMessage = newMessage;
      // this.chatListSubject.next([]);
    }
  }

  private chatSubject = new BehaviorSubject<ChatDetails | null>(null); // Emits updates for the sidebar
  public chatSubject$ = this.chatSubject.asObservable();

  getChatMessages(chatId: number) {
    const apiEndpoint = `${this.apiUrl}/Chats/${chatId}`;
    return this.http.get<ChatResponse>(apiEndpoint)
      .subscribe(res => {
        if(res.isSuccess){
          this.chatSubject.next(res.response);
        }
        else {
          this.chatSubject.next(null);
        }
      });
  }

  constructor(private http: HttpClient, appConfig: AppConfigService) {
    this.apiUrl = appConfig.getAPIUrl();
    this.getChatsForSidebar();
  }

  getChatById(chatId: number) {
    const apiEndpoint = `${this.apiUrl}/Chats/${chatId}`;
    return this.http.get<ChatResponse>(apiEndpoint)
      .pipe(map(res => res.response));
  }

  getChats() : Observable<ChatSummary[]> {
    const apiEndpoint = `${this.apiUrl}/Chats`;
    return this.http.get<ChatListingResponse>(apiEndpoint)
      .pipe(map(res => res.response));
  }

  startNewChat(newChat: NewChatRequest){
    const apiEndpoint = `${this.apiUrl}/Chats`;
    this.http.post(apiEndpoint, newChat);
  }

  sendMessage(newMessage: MessageRequest){
    const apiEndpoint = `${this.apiUrl}/Messages`;
    return this.http.post<MessageRequest>(apiEndpoint, newMessage);
  }
}
