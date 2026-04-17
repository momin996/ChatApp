import { Component, DestroyRef, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { debounceTime, distinctUntilChanged, Observable, Subject } from 'rxjs';
import { Store } from '@ngrx/store';

import { CustomizerSettingsService } from '../../core/services/customizer-settings.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ChatListItem } from '../models/chat.types';
import * as ChatActions from '../store/chat.actions';
import { selectChatList, selectChatListLoading } from '../store/chat.selectors';

@Component({
  selector: 'app-chat-sidebar',
  templateUrl: './chat-sidebar.component.html',
  styleUrls: ['./chat-sidebar.component.scss'],
})
export class ChatSidebarComponent implements OnInit {
  @Input() userId: number;
  chatList$: Observable<ChatListItem[]>;
  loading$: Observable<boolean>;
  private search$ = new Subject<string>();
  selectedChatId: number | null;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  searchTerm: string = '';
  private isLoadingFromScroll: boolean = false;

  constructor(
    public themeService: CustomizerSettingsService,
    private store: Store,
    private destroyRef: DestroyRef,
  ) {
    this.chatList$ = this.store.select(selectChatList);
    this.loading$ = this.store.select(selectChatListLoading);
  }

  ngOnInit(): void {
    this.isLoadingFromScroll = false;
    this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((term) => {
        this.searchTerm = term;
        this.store.dispatch(ChatActions.loadChats({ reset: true, searchTerm: term }));
      });
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement
    this.search$.next(input.value);
  }

  onScroll() {
    const el = this.scrollContainer.nativeElement;

    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight;
    const clientHeight = el.clientHeight;

    const threshold = 100; // px before reaching bottom

    const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;

    if (isNearBottom) {
        this.loadMoreChats();
    }
  }

  private loadMoreChats() {
    if (this.isLoadingFromScroll) return;

    const el = this.scrollContainer.nativeElement;

    this.isLoadingFromScroll = true;

    this.store.dispatch(
      ChatActions.loadChats({reset: false, searchTerm: this.searchTerm }),
    );
  }

  chatSelected(chatId: number){
    this.selectedChatId = chatId;
    console.log("Selected chat id: " + this.selectedChatId);
    
  }

  trackByChatId(index: number, item: ChatListItem) {
    return item.id;
  }
}
