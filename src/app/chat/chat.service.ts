import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../core/services/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl: string;

  constructor(private http: HttpClient, appConfig: AppConfigService) {
    this.apiUrl = appConfig.getAPIUrl();
  }

  getChatMessages(userId: string) {
    const apiEndpoint = `${this.apiUrl}/Chat/GetChatMessages?userId=${userId}`;
    return this.http.get<any>(apiEndpoint);
  }

  getChatUsers() {
    const apiEndpoint = `${this.apiUrl}/Chat/GetChatUsers`;
    return this.http.get<any>(apiEndpoint);
  }
}
