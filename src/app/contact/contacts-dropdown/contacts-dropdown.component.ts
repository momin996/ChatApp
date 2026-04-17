import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ContactService } from '../contact.service';
import { ContactDto } from '../contact.type';
import { Subject, debounceTime, distinctUntilChanged, finalize, takeUntil } from 'rxjs';
import * as ChatActions from '../../chat/store/chat.actions';

@Component({
    selector: 'app-contacts-dropdown',
    templateUrl: './contacts-dropdown.component.html',
    styleUrls: ['./contacts-dropdown.component.scss'],
})
export class ContactsDropdownComponent implements OnInit, OnDestroy {
    @Output() closeMenu = new EventEmitter<void>();
    searchControl = new FormControl<string>('', { nonNullable: true });

    isLoading = false;
    isLoadingMore = false;

    private readonly pageSize = 20;
    private skip = 0;
    private hasMore = true;
    private searchTerm = '';

    private loadedContacts: ContactDto[] = [];
    visibleContacts: ContactDto[] = [];

    private readonly destroy$ = new Subject<void>();
    private searchToken = 0;

    constructor(
        private contactService: ContactService,
        private store: Store,
    ) {}

    ngOnInit(): void {
        this.resetAndLoad();

        this.searchControl.valueChanges
            .pipe(takeUntil(this.destroy$))
            .pipe(
                debounceTime(2000),
                distinctUntilChanged(),
            )
            .subscribe((value: string) => {
                this.searchTerm = (value ?? '').trim();
                this.resetAndLoad();
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onContactClick(contact: ContactDto): void {
        this.store.dispatch(ChatActions.openConversationForContact({ contact }));
        this.closeMenu.emit();
    }

    onScroll(container: HTMLElement): void {
        const thresholdPx = 120;
        const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        if (distanceToBottom <= thresholdPx) {
            this.loadMore();
        }
    }

    trackByContactId(_: number, contact: ContactDto): number {
        return contact.contactId;
    }

    private resetAndLoad(): void {
        const token = ++this.searchToken;
        this.skip = 0;
        this.hasMore = true;
        this.loadedContacts = [];
        this.visibleContacts = [];
        this.isLoading = true;
        this.isLoadingMore = false;

        this.loadNextPage(token);
    }

    private loadNextPage(token: number): void {
        if (!this.hasMore || this.isLoadingMore) return;

        const isFirstPage = this.skip === 0;
        if (!isFirstPage) this.isLoadingMore = true;

        this.contactService
            .getContactsPaged(this.skip, this.pageSize, this.searchTerm)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => {
                    if (isFirstPage) this.isLoading = false;
                    this.isLoadingMore = false;
                }),
            )
            .subscribe({
                next: (contacts) => {
                    if (token !== this.searchToken) return;
                    const incoming = contacts ?? [];
                    this.loadedContacts = [...this.loadedContacts, ...incoming];

                    if (incoming.length < this.pageSize) {
                        this.hasMore = false;
                    }

                    this.skip += incoming.length;
                    this.visibleContacts = this.loadedContacts;
                },
                error: () => {
                    if (token !== this.searchToken) return;
                    if (isFirstPage) {
                        this.loadedContacts = [];
                        this.visibleContacts = [];
                        this.hasMore = false;
                    } else {
                        this.hasMore = false;
                    }
                },
            });
    }

    private loadMore(): void {
        if (this.isLoading || this.isLoadingMore) return;
        if (!this.hasMore) return;
        this.loadNextPage(this.searchToken);
    }
}

