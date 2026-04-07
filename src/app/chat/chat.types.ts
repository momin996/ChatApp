import { User } from "../auth/models/user.model";
import { ContactDto } from "../contact/contact.type";

// Requests

export class GeneralFilters {
    page = 1;
    pageSize = 10;
    searchTerm = '';
    isLoading = false;
    hasMore = true;
}

export interface NewChatRequest {
    chatName: string | null;
    chatParticipantIds: number[];
    isGroup: boolean;
}

// should this be MessageRequest with the id being sent as route param in api call
export interface FirstMessageInChatRequest {
    content: string;
    mediaUrl: string | null;
    mediaType: MediaType;
}

export interface NewChatWithFirstMessageRequest extends NewChatRequest {
    message: FirstMessageInChatRequest;
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

export interface ChatResponse {
    response: ChatDto;
    isSuccess: boolean;
    statusCode: number;
    message: string;
}

// DTO returned by GET `${apiBase}/Chats` (sidebar list)
export interface ChatSidebarLastMessageDto {
    content: string;
    timestamp: string;
    messageStatuses: MessageStatusDto[];
}

export interface ChatSidebarSummaryDto {
    id: number;
    chatName: string | null;
    isGroup: boolean;
    lastMessage: ChatSidebarLastMessageDto;
}


// Models
export interface ChatListItem {
    id: number;
    chatName: string | null;
    isGroup: boolean;
    // Sidebar endpoint returns a slim lastMessage; conversation returns full Message(s)
    lastMessage: MessageDto;
    participants: ChatParticipantDto[];
}

export interface MessageDto {
    id: number;
    chatId: number;
    timestamp: string;
    content: string;
    messageStatuses: MessageStatusDto[];
    messageBy: ChatParticipantDto;
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

export interface ChatDto {
    id: number;
    chatName?: string;
    isGroup: boolean;
    messages: MessageDto[];
    participants: ChatParticipantDto[];
    // Draft state used when starting a new chat (no chat yet)
    isDraft?: boolean;
    draftContact?: ContactDto;
}

export interface Message {
    id: number;
    chatId: number;
    sender: User;
    timestamp: string;
    content: string;
    messageStatuses: MessageStatusDto[];
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

