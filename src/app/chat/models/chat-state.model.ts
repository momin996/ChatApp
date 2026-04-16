import { Chat, ChatListItem, Message } from './chat.types';

export const initialState: ChatState = {
    chatList: {
        items: [],
        hasMore: true,
        beforeId: null,
        beforeTimestamp: null,
        loading: false

    },
    //   chatList: [],
    //   page: 1,
    //   pageSize: 10,
    //   search: '',
    //   hasMore: true,
    //   loading: false,
      
      chat: null,
      messages: [],
      messagesPagSize: 10,
      loadingOlderMessages: false,
      hasMoreMessages: false,
      oldestMessageId: 0,
    };

export interface ChatState {
    chatList: ChatListState;

  chat: Chat | null;
  messages: Message[];
  messagesPagSize: number;
  loadingOlderMessages: boolean;
  hasMoreMessages: boolean;
  oldestMessageId: number;
}

export interface ChatListState {
  items: ChatListItem[];

  hasMore: boolean;
  beforeId: number | null;
  beforeTimestamp: Date | null;

  loading: boolean;
}

export interface ConversationState {
  chat: Chat | null;
  messages: Message[];

  pagination: {
    pageSize: number;
    oldestMessageId: number | null;
    hasMore: boolean;
    loading: boolean;
  };
}
