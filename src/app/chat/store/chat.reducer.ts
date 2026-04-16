import { createReducer, on } from '@ngrx/store';
import * as ChatActions from './chat.actions';
import * as AuthActions from '../../auth/store/auth.actions';
import {
  updateSidebar,
  updateMessageStatusInSidebar,
  bulkUpdateMessageStatusInSidebar,
  convertToChatListItemV2,
  updateMessageStatusInConversationV2,
  bulkUpdateMessageStatusInConversationV2,
} from '../chat.utils';
import {
  ChatListState,
  ChatState,
  initialState,
} from '../models/chat-state.model';

export const chatReducer = createReducer(
  initialState,

  // LOAD CHATS FOR SIDEBAR
  on(
    ChatActions.loadChatsSuccess,
    (state, { chatsResponse, reset }): ChatState => {
      let chatList: ChatListState = {
        items: [...state.chatList.items, ...chatsResponse.items],
        hasMore: chatsResponse.hasMore,
        beforeId: chatsResponse.beforeId,
        beforeTimestamp: chatsResponse.beforeTimestamp,
        loading: false,
      };
      return {
        ...state,
        chatList: chatList,
      };
      // const newList = reset ? chats : [...state.chatList, ...chats];
      // return {
      //   ...state,
      //   chatList: newList,
      //   page: state.page + 1,
      //   hasMore: chats.length === state.pageSize,
      // };
    },
  ),

  // LOAD CONVERSATION
  on(
    ChatActions.loadConversationSuccess,
    (state, { chatResponse }): ChatState => {
      return {
        ...state,
        chat: chatResponse.chat,
        messages: chatResponse.messages,
        hasMoreMessages: chatResponse.hasMore,
        oldestMessageId: chatResponse.messages[0]?.id ?? 0,
      };
    },
  ),

  on(ChatActions.loadOlderMessages, (state) => {
    return {
      ...state,
      loadingOlderMessages: true,
    };
  }),

  on(
    ChatActions.loadOlderMessagesSuccess,
    (state, { messages, hasMore }): ChatState => {
      const existingIds = new Set(state.messages.map((m) => m.id));

      const newMessages = messages.filter((m) => !existingIds.has(m.id));

      return {
        ...state,
        loadingOlderMessages: false,
        hasMoreMessages: hasMore,

        messages: [...newMessages, ...state.messages],

        oldestMessageId:
          newMessages.length > 0 ? newMessages[0].id : state.oldestMessageId,
      };
    },
  ),

  on(
    ChatActions.loadOlderMessagesFailure,
    (state): ChatState => ({
      ...state,
      loadingOlderMessages: false,
    }),
  ),

  on(
    ChatActions.openConversationForContactDraft,
    (state, { contact }): ChatState => {
      console.log('Draft Contact', contact);
      const draftChat = {
        id: 0,
        chatName: undefined,
        isGroup: false,
        isDraft: true,
        draftContact: contact,
        participants: [],
      };
      return {
        ...state,

        chat: draftChat,
      };
    },
  ),

  on(ChatActions.startChatSuccess, (state, { chatResponse, otherUserId }): ChatState => {
    const chatlist: ChatListState = {
      ...state.chatList,
      items: [
        // convertToChatListItem(conversation),
        convertToChatListItemV2(chatResponse.chat, chatResponse.messages[0], otherUserId),
        ...state.chatList.items,
      ],
    };

    return {
      ...state,

      // Set as active chat
      chat: chatResponse.chat,
      messages: chatResponse.messages,
      hasMoreMessages: chatResponse.hasMore,

      // Also add to sidebar (VERY IMPORTANT)
      chatList: chatlist,
    };
  }),

  on(ChatActions.messageReceived, (state, { message }): ChatState => {
    if (state.messages.some((m) => m.id === message.id)) {
      return state;
    }
    const isOpen = state.chat?.id === message.chatId;
    const messages = isOpen
      ? [...state.messages, message]
      : [...state.messages];
    const chatlist: ChatListState = {
      ...state.chatList,
      items: updateSidebar([...state.chatList.items], message),
    };
    return {
      ...state,
      messages: messages,
      // sidebar update
      chatList: chatlist,
    };
  }),

  on(ChatActions.messageDelivered, (state, { identifier }): ChatState => {
    const isOpen = state.chat?.id === identifier.chatId;
    let messages = [...state.messages];
    if (isOpen) {
      messages = updateMessageStatusInConversationV2(
        messages,
        identifier,
        (ms) => !ms.isDelivered,
        (ms) => ({ ...ms, isDelivered: true }),
      );
    }
    const chatlist: ChatListState = {
      ...state.chatList,
      items: updateMessageStatusInSidebar(
        [...state.chatList.items],
        identifier,
        (ms) => !ms.isDelivered,
        (ms) => ({ ...ms, isDelivered: true }),
      ),
    };

    return {
      ...state,
      chatList: chatlist,
      messages: messages,
    };
  }),

  on(
    ChatActions.messageDeliveredAndSeen,
    (state, { identifier }): ChatState => {
      const isOpen = state.chat?.id === identifier.chatId;
      let messages = [...state.messages];
      if (isOpen) {
        messages = updateMessageStatusInConversationV2(
          messages,
          identifier,
          (ms) => !ms.isSeen,
          (ms) => ({ ...ms, isDelivered: true, isSeen: true }),
        );
      }
      const chatlist: ChatListState = {
        ...state.chatList,
        items: updateMessageStatusInSidebar(
          [...state.chatList.items],
          identifier,
          (ms) => !ms.isSeen,
          (ms) => ({ ...ms, isDelivered: true, isSeen: true }),
        ),
      };

      return {
        ...state,
        chatList: chatlist,
        messages: messages,
        // conversation: updateMessageStatusInConversation(
        //   state.conversation,
        //   identifier,
        //   ms => !ms.isSeen,
        //   ms => ({ ...ms, isDelivered: true, isSeen: true })
        // )
      };
    },
  ),

  on(ChatActions.messagesSeen, (state, { identifier }): ChatState => {
    const isOpen = state.chat?.id === identifier.chatId;
    let messages = [...state.messages];
    if (isOpen) {
      messages = bulkUpdateMessageStatusInConversationV2(
        messages,
        identifier,
        (ms) => !ms.isSeen,
        (ms) => ({ ...ms, isSeen: true }),
      );
    }
    const chatlist: ChatListState = {
      ...state.chatList,
      items: bulkUpdateMessageStatusInSidebar(
        [...state.chatList.items],
        identifier,
        (ms) => !ms.isSeen,
        (ms) => ({ ...ms, isSeen: true }),
      ),
    };

    return {
      ...state,
      chatList: chatlist,
      messages: messages,
    };
  }),

  on(ChatActions.bulkMessagesDelivered, (state, { identifiers }): ChatState => {
    let chatListItems = [...state.chatList.items];
    let messages = [...state.messages];
    // let conversation = state.conversation;

    for (const identifier of identifiers) {
      chatListItems = bulkUpdateMessageStatusInSidebar(
        chatListItems,
        identifier,
        (ms) => !ms.isDelivered,
        (ms) => ({ ...ms, isDelivered: true }),
      );

      const isOpen = state.chat?.id === identifier.chatId;
      if (isOpen) {
        messages = bulkUpdateMessageStatusInConversationV2(
          messages,
          identifier,
          (ms) => !ms.isDelivered,
          (ms) => ({ ...ms, isDelivered: true }),
        );
      }
    }

    return {
      ...state,
      chatList: {
        ...state.chatList,
        items: chatListItems,
      },
      messages,
    };
  }),

  on(AuthActions.logoutCompleteAction, (): ChatState => {
    console.log(`Chat state on logout ${initialState}`);
    return {
      ...initialState,
    };
  }),

  //   on(ChatActions.messageDelivered, (state, { identifier }) => {
  //     const chatList = updateSidebarStatus(state.chatList, identifier, 'delivered');
  //     const conversation = updateConversationStatus(state.conversation, identifier, 'delivered');
  //     return {
  //         ...state,
  //         chatList: chatList,
  //         conversation: conversation
  //       }
  //   }),
);
