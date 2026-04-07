import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../core/services/app-config.service';
import { ChatDto, ChatResponse, ChatListItem, MessageStatusDto, NewChatWithFirstMessageRequest, NewChatRequest, MessageDto, ListResponse, GeneralFilters, MessageIdentifierDto, MessagesBulkDeliveredOrSeenDto } from './chat.types';
import { ContactDto } from '../contact/contact.type';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl: string;

  private chatListSubject = new BehaviorSubject<ChatListItem[]>([]); // Emits updates for the sidebar
  public chatList$ = this.chatListSubject.asObservable();
  private chatListFilters = new GeneralFilters();

  private conversationSubject = new BehaviorSubject<ChatDto | null>(null); // Emits updates for the sidebar
  public conversation$ = this.conversationSubject.asObservable();


  constructor(private http: HttpClient, private appConfig: AppConfigService) {
    this.apiUrl = appConfig.getAPIUrl();
  }

  /*
    API call to get Chat Listing for sidebar and emit response as value for the
    chatListSubject. 
  */
  public loadChats(reset: boolean = false): Observable<ListResponse<ChatListItem> | null> {
    if (this.chatListFilters.isLoading) return of(null);
    
    if (reset) {
      this.chatListFilters.page = 1;
      this.chatListFilters.hasMore = true;
      this.chatListSubject.next([]);
    }
  
    if (!this.chatListFilters.hasMore) return of(null);
  
    this.chatListFilters.isLoading = true;
  
    const params = {
      page: this.chatListFilters.page,
      pageSize: this.chatListFilters.pageSize,
      search: this.chatListFilters.searchTerm
    };
  
    return this.http.get<ListResponse<ChatListItem>>(`${this.apiUrl}/Chats`, { params })
      .pipe(
        tap({
          next: (res: ListResponse<ChatListItem>) => {
            const current = this.chatListSubject.value;
            let chats: ChatListItem[] = res.items;
            // if reset → replace, else append
            this.chatListSubject.next(
              reset ? chats : [...current, ...chats]
            );
    
            // if (this.chatListSubject.value.length < res.total) {
            //   this.chatListFilters.page++;
            // } else {
            //   this.chatListFilters.hasMore = false;
            // }
            if (res.items.length < this.chatListFilters.pageSize) {
              this.chatListFilters.hasMore = false;
            } else {
              this.chatListFilters.page++;
            }
    
            this.chatListFilters.isLoading = false;
          },
          error: (err) => {
            console.error('Error getting chats: ', err);
            this.chatListFilters.isLoading = false;
          }
        })
      )
  }

  public setSearch(term: string) {
    this.chatListFilters.searchTerm = term;
    this.loadChats(true); // reset + fetch
  }

  /*
    API call to get Chat/Conversation messages and emit response as value for the
    conversationSubject
  */
  public getConversation(chatId: number) {
    const apiEndpoint = `${this.apiUrl}/Chats/${chatId}?firstNMessages=10`;
    return this.http.get<ChatDto>(apiEndpoint)
      .subscribe({
        next: (chat: ChatDto) => {
          this.conversationSubject.next(chat);
        },
        error: (err) => {
          console.error('Error getting chat: ', err);
          this.conversationSubject.next(null);
        },
      });
  }

  /**
   * API call to create a new chat with the first message included.
   * Body shape matches:
   * {
   *  chatName: null,
   *  chatParticipantIds: [id],
   *  isGroup: false,
   *  message: { content, mediaUrl, mediaType }
   * }
   */
  public startNewChatWithFirstMessage(req: NewChatWithFirstMessageRequest): Observable<ChatResponse> {
    const apiEndpoint = `${this.apiUrl}/Chats`;
    return this.http.post<ChatResponse>(apiEndpoint, req);
  }

  /*
    API call to create a new chat
  */
  public startNewChat(newChat: NewChatRequest){
    const apiEndpoint = `${this.apiUrl}/Chats`;
    return this.http.post<ChatResponse>(apiEndpoint, newChat);
  }

  /*
    Send request to server to mark all of the messages as delivered 
    of all chats
  */
  public userMessagesDelivered(){
    const apiEndpoint = `${this.apiUrl}/Messages/AllMessagesDeliveredToUser`;
    return this.http.put(apiEndpoint, null);
  }

  /**
   * Checks if a 1:1 chat already exists with the contact.
   *
   * NOTE: This assumes your backend exposes: GET `/Chats/Existing?contactId=...`
   * returning either `{ chatId: number | null }` OR a raw number OR null.
   * If your param/route differs, tell me the exact contract and I’ll align it.
   */
  private getExistingChatIdWithContact(contactId: number): Observable<number | null> {
    const apiEndpoint = `${this.apiUrl}/Chats/Exists`;
    return this.http.get<number>(apiEndpoint, { params: { contactId: contactId.toString() } });
  }

  /**
   * Opens an existing conversation with the contact if it exists,
   * otherwise opens a draft conversation (no messages yet) with the contact details.
   */
  public openConversationForContact(contact: ContactDto): void {
    this.getExistingChatIdWithContact(contact.contactId)
      .pipe(
        tap((chatId) => {
          if (typeof chatId === 'number' && chatId > 0) {
            this.getConversation(chatId);
            return;
          }

          const draft: ChatDto = {
            id: 0,
            chatName: undefined,
            isGroup: false,
            messages: [],
            isDraft: true,
            draftContact: contact,
            participants: [],
          };
          this.conversationSubject.next(draft);
        }),
      )
      .subscribe();
  }

  // HELPER METHODS

  public isConverationOpened(chatId: number) : boolean {
    return this.conversationSubject.value?.id===chatId;
  }

  public updateConversation(conversation: ChatDto){
    this.conversationSubject.next(conversation);
  }


  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////

  // New Message

  public addMessageToConversation(newMessage: MessageDto) {
    let conversation = this.conversationSubject.value;
    if (!conversation || conversation.id !== newMessage.chatId) return;

    const exists = conversation.messages.some(m => m.id === newMessage.id);
    if (exists) return;

    const updatedConversation: ChatDto = {
      ...conversation,
      messages: [...conversation.messages, newMessage]
    };
  
    this.conversationSubject.next(updatedConversation);
  }

  public updateLastMessageInSidebar(newMessage: MessageDto) {

    let chatList = this.chatListSubject.value;
    let isChatListUpdated = false;

    const updatedChatList: ChatListItem[] = chatList.map(chat => {
      if(chat.id !== newMessage.chatId) return chat;
      isChatListUpdated = true;
      return {
        ...chat,
        lastMessage: newMessage
      }
    });

    if(isChatListUpdated) this.chatListSubject.next(updatedChatList);
  }

  // SIDEBAR

  public markMessageDeliveredInSidebar(messageIdentifier: MessageIdentifierDto){
    this.updateMessageStatusInSidebar(
      messageIdentifier,
      ms => !ms.isDelivered, // only update if false
      ms => ({ ...ms, isDelivered: true })
    );
  }

  public markMessageDeliveredAndSeenInSidebar(messageIdentifier: MessageIdentifierDto){
    this.updateMessageStatusInSidebar(
      messageIdentifier,
      ms => !ms.isSeen, // only update if false
      ms => ({ ...ms, isDelivered: true, isSeen: true })
    );
  }

  public markMessageSeenInSidebar(messageIdentifier: MessagesBulkDeliveredOrSeenDto){
    this.bulkUpdateMessageStatusInSidebar(
      messageIdentifier,
      ms => !ms.isSeen, // only update if false
      ms => ({ ...ms, isSeen: true })
    );
  }

  public bulkMarkMessagesDeliveredInSidebar(messageIdentifiers: MessagesBulkDeliveredOrSeenDto[]) {
    for(let messageIdentifier of messageIdentifiers){
      this.bulkUpdateMessageStatusInSidebar(
        messageIdentifier,
        ms => !ms.isDelivered, // only update if false
        ms => ({ ...ms, isDelivered: true })
      )
    }
  }

  // CONVERSATION

  public markMessageDeliveredInConversation(messageIdentifier: MessageIdentifierDto) {
    this.updateMessageStatusInConversation(
      messageIdentifier,
      ms => !ms.isDelivered, // only update if false
      ms => ({ ...ms, isDelivered: true })
    );
  }

  public markMessageDeliveredAndSeenInConversation(messageIdentifier: MessageIdentifierDto) {
    this.updateMessageStatusInConversation(
      messageIdentifier,
      ms => !ms.isSeen, // only update if false
      ms => ({ ...ms, isDelivered: true, isSeen: true })
    );
  }

  public markMessagesSeenInConversation(messageIdentifier: MessagesBulkDeliveredOrSeenDto) {
    this.bulkUpdateMessageStatusInConversation(
      messageIdentifier,
      ms => !ms.isSeen, // only update if false
      ms => ({ ...ms, isSeen: true })
    );
  }

  public bulkMarkMessagesDeliveredConversation(messageIdentifiers: MessagesBulkDeliveredOrSeenDto[]) {
    // PENDING
    for(let messageIdentifier of messageIdentifiers){
      this.bulkUpdateMessageStatusInConversation(
        messageIdentifier,
        ms => !ms.isDelivered,
        ms => ({ ...ms, isDelivered: true })
      )
    }
  }

  

  isMyMessage(message: any, userId: number){
    // Sidebar lastMessage DTO does not include sender; treat as "not mine" in that case.
    return !!message?.sender?.id && message.sender.id == userId;
  }

  isMessageDelivered(messageStatuses: MessageStatusDto[]){
    return messageStatuses.every(ms => ms.isDelivered);
  }

  isMessageSeen(messageStatuses: MessageStatusDto[]){
    return messageStatuses.every(ms => ms.isSeen);
  }

  private updateMessageStatusInSidebar(
    messageIdentifier: MessageIdentifierDto,
    shouldUpdate: (ms: MessageStatusDto) => boolean,
    updater: (ms: MessageStatusDto) => any
  ){
    
    let chatList = this.chatListSubject.value;
    if(!chatList) return;

    let isChatListUpdated = false;

    const updatedChatList = chatList.map(chat => {
      if (messageIdentifier.chatId !== chat.id) return chat;
  
      const lastMessage = chat.lastMessage;
  
      if (
        lastMessage.id === messageIdentifier.messageId &&
        lastMessage.messageStatuses.some(ms => ms.userId === messageIdentifier.receiverId)
      ) {
        isChatListUpdated = true;
        return {
          ...chat,
          lastMessage: {
            ...lastMessage,
            messageStatuses: lastMessage.messageStatuses.map(ms =>{
              if (ms.userId !== messageIdentifier.receiverId) return ms;
            // Only update if needed
              if (!shouldUpdate(ms)) return ms;
              isChatListUpdated = true;
              console.log('Sidebar - Status Updated for message: ', lastMessage.content);
              return updater(ms);
            })
          }
        };
      }
  
      return chat;
    });

    if(isChatListUpdated) {
      this.chatListSubject.next(updatedChatList);
    }
  }

  private updateMessageStatusInConversation(
    messageIdentifier: MessageIdentifierDto,
    shouldUpdate: (ms: MessageStatusDto) => boolean,
    updater: (ms: MessageStatusDto) => MessageStatusDto
  ) {
    const conversation = this.conversationSubject.value;
    if (!conversation || conversation.id !== messageIdentifier.chatId) return;
  
    let conversationUpdated = false;
  
    const updatedConversation = {
      ...conversation,
      messages: conversation.messages.map(m => {
        if (m.id !== messageIdentifier.messageId) return m;
  
        return {
          ...m,
          messageStatuses: m.messageStatuses.map(ms => {
            if (ms.userId !== messageIdentifier.receiverId) return ms;
            // Only update if needed
            if (!shouldUpdate(ms)) return ms;
            conversationUpdated = true;
            console.log('Conversation - Status Updated for message: ', m.content);
            
            return updater(ms);
          })
        };
      })
    };
  
    if (conversationUpdated) {
      this.conversationSubject.next(updatedConversation);
    }
  }

  private bulkUpdateMessageStatusInSidebar(
    messageIdentifier: MessagesBulkDeliveredOrSeenDto,
    shouldUpdate: (ms: MessageStatusDto) => boolean,
    updater: (ms: MessageStatusDto) => MessageStatusDto
  ) {
    let chatList = this.chatListSubject.value;
    if(!chatList) return;

    let isChatListUpdated = false;

    const identifierMap = new Map(
      messageIdentifier.messageStatusIdentifiers.map(mi => [mi.messageId, mi])
    );

    const updatedChatList = chatList.map(chat => {
      if(chat.id !== messageIdentifier.chatId) return chat;

      const lastMessage = chat.lastMessage;
      // let identifier = messageIdentifier.messageStatusIdentifiers.find(mi => mi.messageId === lastMessage.id)
      const identifier = identifierMap.get(lastMessage.id);
      if (!identifier) return chat;

      if(lastMessage.messageStatuses.some(ms => ms.userId === identifier!.receiverId)){
        return {
          ...chat,
          lastMessage: {
            ...lastMessage,
            messageStatuses: lastMessage.messageStatuses.map(ms =>{
              if (ms.userId !== identifier!.receiverId) return ms;
            // Only update if needed
              if (!shouldUpdate(ms)) return ms;
              isChatListUpdated = true;
              console.log('Sidebar - Status Updated for message: ', lastMessage.content);
              return updater(ms);
            })
          }
        };
      }
      return chat;
    });

    if(isChatListUpdated) {
      this.chatListSubject.next(updatedChatList);
    }
  }

  private bulkUpdateMessageStatusInConversation(
    messageIdentifier: MessagesBulkDeliveredOrSeenDto,
    shouldUpdate: (ms: MessageStatusDto) => boolean,
    updater: (ms: MessageStatusDto) => MessageStatusDto
  ){
    const conversation = this.conversationSubject.value;
    if (!conversation || conversation.id !== messageIdentifier.chatId) return;
  
    let conversationUpdated = false;
  
    const identifierMap = new Map(
      messageIdentifier.messageStatusIdentifiers.map(mi => [mi.messageId, mi])
    );
    const updatedConversation = {
      ...conversation,
      messages: conversation.messages.map(m => {
        const identifier = identifierMap.get(m.id);
        if (!identifier) return m;
        return {
          ...m,
          messageStatuses: m.messageStatuses.map(ms => {
            if (ms.userId !== identifier!.receiverId) return ms;
            // Only update if needed
            if (!shouldUpdate(ms)) return ms;
            conversationUpdated = true;
            console.log('Conversation - Status Updated for message: ', m.content);
            
            return updater(ms);
          })
        };
      })
    };
  
    if (conversationUpdated) {
      this.conversationSubject.next(updatedConversation);
    }
  }
}
