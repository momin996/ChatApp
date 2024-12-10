import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../core/services/app-config.service';
import { ChatListingResponse, ChatResponse, ChatSummary, MediaType, MessageRequest } from './chat.types';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl: string;

  constructor(private http: HttpClient, appConfig: AppConfigService) {
    this.apiUrl = appConfig.getAPIUrl();
  }

  getChatById(chatId: number) {
    const apiEndpoint = `${this.apiUrl}/Chats/${chatId}`;
    return this.http.get<ChatResponse>(apiEndpoint)
      .pipe(map(res => res.response));
  }

  getChats(userId: number) : Observable<ChatSummary[]> {
    const apiEndpoint = `${this.apiUrl}/Users/${userId}/Chats`;
    return this.http.get<ChatListingResponse>(apiEndpoint)
      .pipe(map(res => res.response));
  }

  sendMessage(json: MessageRequest){
    const apiEndpoint = `${this.apiUrl}/Messages`;
    return this.http.post<MessageRequest>(apiEndpoint, json);
  }
}
