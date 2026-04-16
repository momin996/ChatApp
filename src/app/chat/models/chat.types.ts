import { ContactDto } from "../../contact/contact.type";

// Requests

export class ChatListRequest {
    pageSize: number = 10;
    search: string | null;
    beforeId: number | null;
    beforeTimestamp: Date | null;
}

export class GeneralFilters {
    page = 1;
    pageSize = 10;
    searchTerm = '';
    isLoading = false;
    hasMore = true;
}


// should this be MessageRequest with the id being sent as route param in api call
export interface FirstMessageRequest {
    content: string;
    mediaUrl: string | null;
    mediaType: MediaType;
}

export interface NewChatRequest {
    chatName: string | null;
    chatParticipantIds: number[];
    isGroup: boolean;
    message: FirstMessageRequest;
}

export interface MessageRequest {
    chatId?: number;
    content?: string;
    mediaUrl?: string;
    mediaType: MediaType;
}


// Responses

export interface ListResponse<T> {
    items: T[];
    count: number;
    total: number;
}

export interface CursorListResponse<T> {
    items: T[];
    hasMore: boolean;
    beforeId: number | null;
    beforeTimestamp : Date | null;
//     public IReadOnlyList<T> Items { get; set; } = [];
// public bool HasMore { get; set; }
// public int BeforeId { get; set; }
// public DateTime BeforeTimestamp { get; set; }
}


// Models
export interface ChatListItem {
    id: number;
    chatName?: string;
    isGroup: boolean;
    // Sidebar endpoint returns a slim lastMessage; conversation returns full Message(s)
    lastMessage: MessageForChatSidebar;
    otherUser: ChatParticipantDto | null;
    // participants: ChatParticipantDto[];
}

export interface Message {
    id: number;
    chatId: number;
    content: string;
    timestamp: string;
    messageStatuses: MessageStatusDto[];
    messageBy: ChatParticipantDto;
}

export interface MessageForChatSidebar {
    id: number;
    content: string;
    timestamp: string;
    sendUserId: number;
    messageStatuses: MessageStatusDto[];
}

export interface MessageIdentifierDto {
    messageId: number;
    chatId: number;
    senderId: number;
    receiverId: number;
}

export interface MessageStatusIdentifierDto {
    messageId: number;
    receiverId: number;
}

export interface MessagesBulkDeliveredOrSeenDto {
    chatId: number;
    messageStatusIdentifiers: MessageStatusIdentifierDto[];
}

export interface ChatParticipantDto {
    userId: number;
    firstName: string;
    lastName: string;
    avatar?: string;
}

export interface ChatResponse {
    chat: Chat;
    messages: Message[];
    hasMore: boolean;
}

export interface Chat {
    id: number;
    chatName?: string;
    isGroup: boolean;
    // messages: Message[];
    participants: ChatParticipantDto[];
    // Draft state used when starting a new chat (no chat yet)
    isDraft?: boolean;
    draftContact?: ContactDto;
}


export interface MessageStatusDto {
    isDelivered: boolean;
    deliveredAt: any;
    isSeen: boolean;
    seenAt: any;
    userId: number;
}

export enum MediaType {
    Text,
    Image,
    Video,
    Audio
}

