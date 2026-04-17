import { createAction, props } from '@ngrx/store';
import {
    Chat,
    ChatListItem,
    ChatResponse,
    CursorListResponse,
    Message,
    MessageIdentifierDto,
    MessagesBulkDeliveredOrSeenDto,
    NewChatRequest,
} from '../models/chat.types';
import { ContactDto } from 'src/app/contact/contact.type';

export const loadChats = createAction(
    '[Chat] Load Chats',
    props<{ reset: boolean, searchTerm: string | null }>(),
);

export const loadChatsSuccess = createAction(
    '[Chat] Load Chats Success',
    props<{ chatsResponse: CursorListResponse<ChatListItem>; reset: boolean }>(),
);

export const openConversationForContact = createAction(
    '[Chat] Open Conversation For Contact',
    props<{ contact: ContactDto }>(),
);

export const openConversationForContactSuccess = createAction(
    '[Chat] Open Conversation For Contact Success',
    props<{ chatId: number }>(),
);

export const openConversationForContactDraft = createAction(
    '[Chat] Open Conversation For Contact Draft',
    props<{ contact: ContactDto }>(),
);

//////////////////////////////////////////////////////

export const startChat = createAction(
    '[Chat] Start Chat',
    props<{ newChat: NewChatRequest }>(),
);

export const startChatSuccess = createAction(
    '[Chat] Start Chat Success',
    props<{ chatResponse: ChatResponse, otherUserId: number | null; }>(),
);

export const startChatFailure = createAction(
    '[Chat] Start Chat Failure',
    props<{ error: any }>(),
);

export const loadConversation = createAction(
    '[Chat] Load Conversation',
    props<{ chatId: number; reset: boolean }>(),
);

export const loadConversationSuccess = createAction(
    '[Chat] Load Conversation Success',
    props<{ chatResponse: ChatResponse }>(), // update this as well
);


export const loadOlderMessages = createAction(
    '[Chat] Load Older Messages',
    props<{ chatId: number }>()
)

export const loadOlderMessagesSuccess = createAction(
    '[Chat] Load Older Messages Success',
    props<{ messages: Message[], hasMore: boolean }>()
)

export const loadOlderMessagesFailure = createAction(
    '[Chat] Load Older Messages Failure',
    props<{ error: any }>()
)



export const allMessagesDelivered = createAction(
    '[Chat] All Messages Delivered',
);

/////////////////////////////////////////////////////////////////////////////

export const messageReceived = createAction(
    '[Chat] Message Received',
    props<{ message: Message }>(),
);

export const messageDelivered = createAction(
    '[Chat] Message Delivered',
    props<{ identifier: MessageIdentifierDto }>(),
);

export const messageDeliveredAndSeen = createAction(
    '[Chat] Message Delivered And Seen',
    props<{ identifier: MessageIdentifierDto }>(),
);

export const bulkMessagesDelivered = createAction(
    '[Chat] Bulk Messages Delivered',
    props<{ identifiers: MessagesBulkDeliveredOrSeenDto[] }>(),
);

export const messagesSeen = createAction(
    '[Chat] Messages Seen',
    props<{ identifier: MessagesBulkDeliveredOrSeenDto }>(),
);
