import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../core/services/app-config.service';
import {
  ChatListItem,
  NewChatRequest,
  ListResponse,
  ChatResponse,
  ChatListRequest,
  CursorListResponse,
} from './models/chat.types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl: string = this.appConfig.getAPIUrl();

  constructor(
    private http: HttpClient,
    private appConfig: AppConfigService,
  ) {}

  loadChats(req: ChatListRequest) {
    let params = new HttpParams().append("pageSize", req.pageSize);
    if(req.search) params = params.append("search", req.search);
    if(req.beforeId && req.beforeTimestamp) {
      params = params.append("beforeId", req.beforeId);
      params = params.append("beforeTimestamp", req.beforeTimestamp.toString());
    }

    return this.http.get<CursorListResponse<ChatListItem>>(`${this.apiUrl}/Chats`, {
      params,
    });
  }

  getConversation(chatId: number, firstNMessages: number = 10) {
    return this.http.get<ChatResponse>(`${this.apiUrl}/Chats/${chatId}`, {
      params: { firstNMessages },
    });
  }

  getMessages(chatId: number, pageSize: number, beforeMessageId: number) {
    return this.http.get<ChatResponse>(
      `${this.apiUrl}/Chats/${chatId}/Messages`,
      { params: { pageSize, beforeMessageId } },
    );
  }

  startNewChat(req: NewChatRequest) {
    return this.http.post<ChatResponse>(`${this.apiUrl}/Chats`, req);
  }

  userMessagesDelivered() {
    return this.http.put(
      `${this.apiUrl}/Messages/AllMessagesDeliveredToUser`,
      null,
    );
  }

  public getExistingChatIdWithContact(
    contactId: number,
  ): Observable<number | null> {
    return this.http.get<number>(`${this.apiUrl}/Chats/Exists`, {
      params: { contactId },
    });
  }
}
