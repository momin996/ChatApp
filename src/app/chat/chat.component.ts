import { Component, DestroyRef, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthFacade } from '../auth/auth.facade';
import { User } from '../auth/models/user.model';
import { Observable } from 'rxjs';
import * as ChatActions from './store/chat.actions';
import { Chat } from './models/chat.types';
import { selectChat } from './store/chat.selectors';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

    user$: Observable<User | null> = this.authFacade.getUser();
    chat$: Observable<Chat | null>;

    constructor(
        private authFacade: AuthFacade,
        private store: Store,
        private destroyRef: DestroyRef
    ) {
        this.chat$ = this.store.select(selectChat);
    }

    ngOnInit(): void {
        console.log('Chat component init method called');
        this.chat$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((chat => console.log('Current chat value: ', chat)));
        this.markAllMessagesAsDelivered();
    }

    
    private markAllMessagesAsDelivered(): void {
        this.store.dispatch(ChatActions.allMessagesDelivered())
    }

}