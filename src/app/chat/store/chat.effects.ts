import { Injectable } from '@angular/core';
import { act, Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter, map, of, switchMap, withLatestFrom, catchError, tap } from 'rxjs';

import * as ChatActions from './chat.actions';
import { selectChatState } from './chat.selectors';
import { ChatService } from '../chat.service';
import { ChatListRequest, ChatResponse } from '../models/chat.types';

@Injectable()
export class ChatEffects {
  constructor(
    private actions$: Actions,
    private store: Store,
    private chatService: ChatService,
  ) {}

  allMessagesDelivered$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.allMessagesDelivered),
      switchMap(() =>
        this.chatService
          .userMessagesDelivered()
          .pipe(map(() => ChatActions.loadChats({ reset: true, searchTerm: null }))),
      ),
    ),
  );

  loadChats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.loadChats),
      withLatestFrom(this.store.select(selectChatState)),
      filter(([action, state]) => state.chatList.hasMore || action.reset),
      switchMap(([action, state]) => {
        const req = new ChatListRequest();
        if(!action.reset){
          req.beforeId = state.chatList.beforeId;
          req.beforeTimestamp = state.chatList.beforeTimestamp;
        }
        if(action.searchTerm && action.searchTerm.trim() != ''){
          req.search = action.searchTerm;
        }
        
        return this.chatService.loadChats(req).pipe(
          map((res) =>
            ChatActions.loadChatsSuccess({
              chatsResponse: res,
              reset: action.reset,
            }),
          ),
        );
      }),
    ),
  );

  openConversationForContact$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.openConversationForContact),

      switchMap(({ contact }) =>
        this.chatService.getExistingChatIdWithContact(contact.contactId).pipe(
          switchMap((chatId) => {
            // CASE 1: chat exists
            if (typeof chatId === 'number' && chatId > 0) {
              return of(
                ChatActions.openConversationForContactSuccess({
                  chatId,
                }),
              );
            }

            // CASE 2: draft
            return of(
              ChatActions.openConversationForContactDraft({
                contact,
              }),
            );
          }),

          catchError(() =>
            of(
              ChatActions.openConversationForContactDraft({
                contact,
              }),
            ),
          ),
        ),
      ),
    ),
  );

  openConversationForContactSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.openConversationForContactSuccess),

      map(({ chatId }) =>
        ChatActions.loadConversation({ chatId, reset: true }),
      ),
    ),
  );

  startChat$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.startChat),

      switchMap(({ newChat }) =>
        this.chatService.startNewChat(newChat).pipe(
          map((chatResponse: ChatResponse) => {
            const otherParticipants = newChat.chatParticipantIds;
            let otherUserId = null;
            if(otherParticipants.length==1) otherUserId = otherParticipants[0];
            return ChatActions.startChatSuccess({ chatResponse, otherUserId });

          }),
          catchError((error) => of(ChatActions.startChatFailure({ error }))),
        ),
      ),
    ),
  );

  loadConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.loadConversation),

      withLatestFrom(this.store.select(selectChatState)),

      switchMap(([action]) => {
        return this.chatService.getConversation(action.chatId).pipe(
          map((chatResponse: ChatResponse) =>
            ChatActions.loadConversationSuccess({
              chatResponse,
            }),
          ),
        );
      }),
    ),
  );

  loadOlderMessages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.loadOlderMessages),
      // tap(([_, state]) => {
      //   console.log('Effect State Before Filter:', state.loadingOlderMessages);
      // }),
      withLatestFrom(this.store.select(selectChatState)),
      filter(([_, state]) => {
        const filter =
          // !state.loadingOlderMessages &&
          state.hasMoreMessages &&
          !!state.oldestMessageId;
        return filter;
      }),
      switchMap(([action, state]) =>
        this.chatService
          .getMessages(
            action.chatId,
            state.messagesPagSize,
            state.oldestMessageId,
          )
          .pipe(
            map((res) =>
              ChatActions.loadOlderMessagesSuccess({
                messages: res.messages,
                hasMore: res.hasMore,
              }),
            ),
            catchError((error) =>
              of(ChatActions.loadOlderMessagesFailure({ error })),
            ),
          ),
      ),
    ),
  );
}
