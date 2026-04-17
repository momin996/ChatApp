import {
    Chat,
    ChatListItem,
    Message,
    MessageForChatSidebar,
    MessageIdentifierDto,
    MessagesBulkDeliveredOrSeenDto,
    MessageStatusDto,
} from './models/chat.types';

export function isMessageDelivered(
    messageStatuses: MessageStatusDto[],
): boolean {
    return messageStatuses.every((ms) => ms.isDelivered);
}

export function isMessageSeen(messageStatuses: MessageStatusDto[]): boolean {
    return messageStatuses.every((ms) => ms.isSeen);
}

export function updateSidebar(
    chatList: ChatListItem[],
    message: Message,
): ChatListItem[] {
    const index = chatList.findIndex((c) => c.id === message.chatId);
    if (index === -1) return chatList;
    const lastMessage: MessageForChatSidebar = {
      id: message.id,
      content: message.content,
      timestamp: message.timestamp,
      sendUserId: message.messageBy.userId,
      messageStatuses: message.messageStatuses
    }
    const updatedChatList = [...chatList];
    updatedChatList[index] = {
        ...updatedChatList[index],
        lastMessage: lastMessage,
    };

    // shifts chatlist item to the top
    const [chat] = updatedChatList.splice(index, 1);
    updatedChatList.unshift(chat);

    return updatedChatList;
}


///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

// These need to be verified

export function updateMessageStatusInSidebar(
    chatList: ChatListItem[],
    messageIdentifier: MessageIdentifierDto,
    shouldUpdate: (ms: MessageStatusDto) => boolean,
    updater: (ms: MessageStatusDto) => MessageStatusDto,
): ChatListItem[] {
    let updated = false;

    const newChatList = chatList.map((chat) => {
        if (chat.id !== messageIdentifier.chatId) return chat;

        const lastMessage = chat.lastMessage;

        if (!lastMessage || lastMessage.id !== messageIdentifier.messageId)
            return chat;

        const newStatuses = lastMessage.messageStatuses.map((ms) => {
            if (ms.userId !== messageIdentifier.receiverId) return ms;

            if (!shouldUpdate(ms)) return ms;

            updated = true;
            return updater(ms);
        });

        if (!updated) return chat;

        return {
            ...chat,
            lastMessage: {
                ...lastMessage,
                messageStatuses: newStatuses,
            },
        };
    });

    return updated ? newChatList : chatList;
}

export function updateMessageStatusInConversationV2(
  messages: Message[],
  identifier: MessageIdentifierDto,
  shouldUpdate: (ms: MessageStatusDto) => boolean,
  updater: (ms: MessageStatusDto) => MessageStatusDto
){

  const messageToUpdateIndex = messages.findIndex(m => m.id === identifier.messageId);
  if(messageToUpdateIndex === -1) return messages;

  let messageToUpdate = messages[messageToUpdateIndex];

  const messageStatusIndex = messageToUpdate.messageStatuses.findIndex(ms => ms.userId === identifier.receiverId);
  if(messageStatusIndex === -1) return messages;

  let messageStatus = messageToUpdate.messageStatuses[messageStatusIndex];
  if (!shouldUpdate(messageStatus)) return messages;

  const updatedValue = updater(messageToUpdate.messageStatuses[messageStatusIndex]);
  console.log("updatedValue: ", updatedValue);

  const updatedMessageStatuses = [...messageToUpdate.messageStatuses];
  updatedMessageStatuses[messageStatusIndex] = updatedValue;

  const updatedMessage = {
    ...messageToUpdate,
    messageStatuses: updatedMessageStatuses
  };

  const updatedMessages = [...messages];
  updatedMessages[messageToUpdateIndex] = updatedMessage;

  return updatedMessages;
}

export function bulkUpdateMessageStatusInSidebar(
    chatList: ChatListItem[],
    payload: MessagesBulkDeliveredOrSeenDto,
    shouldUpdate: (ms: MessageStatusDto) => boolean,
    updater: (ms: MessageStatusDto) => MessageStatusDto
  ): ChatListItem[] {
  
    let updated = false;
  
    const identifierMap = new Map(
      payload.messageStatusIdentifiers.map(m => [m.messageId, m])
    );
  
    const newChatList = chatList.map(chat => {
  
      if (chat.id !== payload.chatId) return chat;
  
      const lastMessage = chat.lastMessage;
      const identifier = identifierMap.get(lastMessage?.id);
  
      if (!identifier) return chat;
  
      const newStatuses = lastMessage.messageStatuses.map(ms => {
        if (ms.userId !== identifier.receiverId) return ms;
  
        if (!shouldUpdate(ms)) return ms;
  
        updated = true;
        return updater(ms);
      });
  
      if (!updated) return chat;
  
      return {
        ...chat,
        lastMessage: {
          ...lastMessage,
          messageStatuses: newStatuses
        }
      };
    });
  
    return updated ? newChatList : chatList;
}

export function bulkUpdateMessageStatusInConversationV2(
  messages: Message[],
  identifier: MessagesBulkDeliveredOrSeenDto,
  shouldUpdate: (ms: MessageStatusDto) => boolean,
  updater: (ms: MessageStatusDto) => MessageStatusDto
) {
  const identifierMap = new Map(
    identifier.messageStatusIdentifiers.map(m => [m.messageId, m])
  );

  return messages.map(message => {

    const messageIdentifier  = identifierMap.get(message.id);
    if (!messageIdentifier ) return message;

    const newStatuses = message.messageStatuses.map(ms =>  
      ms.userId === messageIdentifier.receiverId && shouldUpdate(ms)
        ? updater(ms)
        : ms
    );

    // Check if any status actually changed
    const hasChanges = newStatuses.some((ms, index) => 
      ms !== message.messageStatuses[index]
    );

    return hasChanges 
      ? { ...message, messageStatuses: newStatuses }
      : message;
  });
}

export function convertToChatListItemV2(chat: Chat, message: Message, otherUserId: number | null): ChatListItem {
  const lastMessage: MessageForChatSidebar = {
    id: message.id,
    content: message.content,
    timestamp: message.timestamp,
    sendUserId: message.messageBy.userId,
    messageStatuses: message.messageStatuses
  }
  let otherUser = otherUserId ? chat.participants.find(p => p.userId === otherUserId) ?? null : null;
  return {
      id: chat.id,
      chatName: chat.chatName,
      isGroup: chat.isGroup,
      lastMessage: lastMessage,
      otherUser: otherUser
      // participants: chat.participants,
  };
}
