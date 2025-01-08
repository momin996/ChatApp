import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../core/services/app-config.service';
import { ChatDetails, ChatListingResponse, ChatResponse, ChatSummary, MediaType, Message, MessageRequest, MessageStatus, NewChatRequest } from './chat.types';
import { BehaviorSubject, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl: string;

  private chatListSubject = new BehaviorSubject<ChatSummary[]>([]); // Emits updates for the sidebar
  public chatList$ = this.chatListSubject.asObservable();

  private conversationSubject = new BehaviorSubject<ChatDetails | null>(null); // Emits updates for the sidebar
  public conversation$ = this.conversationSubject.asObservable();

  /*
    Send request to server to mark all of the messages as delivered 
    of all chats
  */
  public userMessagesDelivered(){
    const apiEndpoint = `${this.apiUrl}/Messages/AllMessagesDeliveredToUser`;
    return this.http.put(apiEndpoint, null);
  }

  /*
    API call to get Chat Listing for sidebar and emit response as value for the
    chatListSubject. 
  */
  public getChatsForSidebar() : void {
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

  /*
    API call to get Chat/Conversation messages and emit response as value for the
    conversationSubject
  */
  public getConversation(chatId: number) {
    const apiEndpoint = `${this.apiUrl}/Chats/${chatId}`;
    return this.http.get<ChatResponse>(apiEndpoint)
      .subscribe(res => {
        if(res.isSuccess){
          this.conversationSubject.next(res.response);
        }
        else {
          this.conversationSubject.next(null);
        }
      });
  }

  /*
    API call to create a new chat
  */
  public startNewChat(newChat: NewChatRequest){
    const apiEndpoint = `${this.apiUrl}/Chats`;
    this.http.post(apiEndpoint, newChat);
  }

  // HELPER METHODS

  public isConverationOpened(chatId: number) : boolean {
    return this.conversationSubject.value?.id===chatId;
  }

  public updateConversation(conversation: ChatDetails){
    this.conversationSubject.next(conversation);
  }

  public addMessageToConversation(newMessage: Message) {
    let conversation = this.conversationSubject.value;
    if(conversation){
      conversation?.messages.push(newMessage);
      this.conversationSubject.next(conversation);
    }
  }

  public updateMessageInConversation(message: Message) {
    let conversation = this.conversationSubject.value;
    if(conversation){
      const messageIndex = conversation.messages.findIndex(m => m.id == message.id);
      if(messageIndex && messageIndex !== 1){
        conversation.messages[messageIndex] = message;
        this.conversationSubject.next(conversation)
      }
    }
  }

  public updateLastMessageInChatSidebar(newMessage: Message) {

    let chatList = this.chatListSubject.value;
    let chatIndex = chatList.findIndex(c => c.id === newMessage.chatId);
    if (chatIndex !== -1) {
        let updatedChat: ChatSummary = { ...chatList[chatIndex], lastMessage: newMessage };
        let updatedChatList: ChatSummary[] = [...chatList];
        updatedChatList[chatIndex] = updatedChat;
        this.chatListSubject.next(updatedChatList);
    }
  }

  public updateDeliveryStatusInSidebar(messages: Message[]){
    let chatList = this.chatListSubject.value;
    messages.forEach(message => {
      let chatIndex = chatList.findIndex(c => c.lastMessage.id===message.id);
      if (chatIndex !== -1) {
        let updatedChat: ChatSummary = { ...chatList[chatIndex], lastMessage: message };
        chatList[chatIndex] = updatedChat;
      }
    });
    this.chatListSubject.next(chatList);
  }

  isMyMessage(message: Message, userId: number){
    // is the last message sent by me
    return message.sender.id == userId;
  }

  isMessageDelivered(messageStatuses: MessageStatus[]){
    return messageStatuses.every(ms => ms.isDelivered);
  }

  isMessageSeen(messageStatuses: MessageStatus[]){
    return messageStatuses.every(ms => ms.isSeen);
  }

  constructor(private http: HttpClient, appConfig: AppConfigService) {
    this.apiUrl = appConfig.getAPIUrl();
    // this.getChatsForSidebar();
  }

  

  
}
