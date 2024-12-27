import { User } from "../auth/models/user.model";

export interface ChatListingResponse {
    response: ChatSummary[];
    isSuccess: boolean;
    statusCode: number;
    message: string;
}

export interface ChatSummary {
    id: number;
    chatName: string;
    isGroup: boolean;
    lastMessage: Message;
}

export interface NewChatRequest {
    chatName: string | null;
    chatParticipantIds: number[];
    isGroup: boolean;
}

export interface ChatResponse {
    response: ChatDetails;
    isSuccess: boolean;
    statusCode: number;
    message: string;
}

export interface ChatDetails {
    id: number;
    chatName?: string;
    isGroup: boolean;
    messages: Message[];
}

export interface Message {
    id: number;
    sender: User;
    timestamp: string;
    content: string;
    messageStatuses: MessageStatuse[];
}

// export interface UserProfile {
//     id: number;
//     username: string;
//     firstName: string;
//     lastName: string;
//     phoneNumber: string;
//     email: string;
// }

export interface MessageStatuse {
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

export interface MessageRequest {
    chatId?: number;
    content?: string;
    mediaUrl?: string;
    mediaType: MediaType;
}