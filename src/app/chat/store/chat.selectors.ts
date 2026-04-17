import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ChatState } from '../models/chat-state.model';

export const CHAT_FEATURE_KEY = 'chat';

export const selectChatState =
  createFeatureSelector<ChatState>(CHAT_FEATURE_KEY);

// Sidebar chats
export const selectChatList = createSelector(
  selectChatState,
  state => state.chatList.items
);

export const selectChatListLoading = createSelector(
  selectChatState,
  state => state.chatList.loading
)

export const selectChat = createSelector(
  selectChatState,
  state => state.chat
)

export const selectMessages = createSelector(
  selectChatState,
  state => state.messages
)