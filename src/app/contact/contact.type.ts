import { User } from "../auth/models/user.model";

export interface ContactListingResponse {
    response: User[];
    isSuccess: boolean;
    statusCode: number;
    message: string;
}

// DTO returned by GET `${apiBase}/Contacts?skip=&take=`
export interface ContactDto {
    contactId: number;
    firstName: string;
    lastName: string;
    about?: string;
    avatar?: string;
}