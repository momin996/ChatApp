import { User } from "../auth/models/user.model";

// Requests
export interface NewChatRequest {
    chatName: string | null;
    chatParticipantIds: number[];
    isGroup: boolean;
}

export interface MessageRequest {
    chatId?: number;
    content?: string;
    mediaUrl?: string;
    mediaType: MediaType;
}


// Responses
export interface ChatListingResponse {
    response: ChatSummary[];
    isSuccess: boolean;
    statusCode: number;
    message: string;
}

export interface ChatResponse {
    response: ChatDetails;
    isSuccess: boolean;
    statusCode: number;
    message: string;
}


// Models
export interface ChatSummary {
    id: number;
    chatName: string;
    isGroup: boolean;
    lastMessage: Message;
}

export interface ChatDetails {
    id: number;
    chatName?: string;
    isGroup: boolean;
    messages: Message[];
}

export interface Message {
    id: number;
    chatId: number;
    sender: User;
    timestamp: string;
    content: string;
    messageStatuses: MessageStatus[];
}

export interface MessageStatus {
    isDelivered: boolean;
    isSeen: boolean;
    deliveredAt: any;
    seenAt: any;
}

export enum MediaType {
    Text,
    Image,
    Video,
    Audio
}

