import {
  AfterViewChecked,
  Component,
  DestroyRef,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomizerSettingsService } from 'src/app/core/services/customizer-settings.service';
import {
  Chat,
  MediaType,
  Message,
  MessageRequest,
  MessageStatusDto,
  NewChatRequest,
} from '../models/chat.types';
import { SignalRService } from 'src/app/signalr.service';
import * as ChatActions from '../store/chat.actions';
import { selectMessages } from '../store/chat.selectors';
import { isMessageDelivered, isMessageSeen } from '../chat.utils';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.scss',
})
export class ConversationComponent implements OnInit, OnChanges, AfterViewChecked {
  private messages$: Observable<Message[]>;

  @ViewChild('chatBody') chatBody!: ElementRef<HTMLDivElement>;
  private prevScrollHeight = 0;
  private isLoadingFromScroll = false;
  private hasInitialScrollDone = false;

  @Input() userId: number;
  @Input() chat: Chat | null;
  messages: Message[];

  messageContent: string;

  constructor(
    public themeService: CustomizerSettingsService,
    private signalRService: SignalRService,
    private store: Store,
    private destroyRef: DestroyRef,
  ) {
    this.messages$ = this.store.select(selectMessages);
  }

  ngOnInit(): void {
    console.log('Init from conversation component');

    this.isLoadingFromScroll = false;
    this.hasInitialScrollDone = false;
    this.messageContent = '';

    this.messages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((messages) => {
        this.messages = messages;
        console.log('Messages:', this.messages);

        if (this.chat && messages.length > 0) {
          this.markChatSeen(this.chat?.id, messages);
        }

        const el = this.chatBody?.nativeElement;
        if (!el) return;

        const isNearBottom =
          el.scrollHeight - el.scrollTop - el.clientHeight < 100;

        // Only auto-scroll if:
        // 1. NOT pagination
        // 2. User already near bottom
        if (!this.isLoadingFromScroll && isNearBottom) {
          el.scrollTop = el.scrollHeight;
        }

        requestAnimationFrame(() => {
          const el = this.chatBody?.nativeElement;
          if (!el) return;

          // 1. INITIAL LOAD → force scroll to bottom
          if (!this.hasInitialScrollDone && this.messages.length > 0) {
            el.scrollTop = el.scrollHeight;
            this.hasInitialScrollDone = true;
            return;
          }
          // 2. Pagination (scroll up)
          if (this.isLoadingFromScroll) {
            const newHeight = el.scrollHeight;
            el.scrollTop = newHeight - this.prevScrollHeight;

            this.isLoadingFromScroll = false;
            this.prevScrollHeight = 0;
            return;
          }

          // 3. New message (SignalR)
          const isNearBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight < 100;

          if (isNearBottom) {
            el.scrollTop = el.scrollHeight;
          }
        });
      });
  }

  
  ngOnChanges(changes: SimpleChanges): void {
    if(changes["chat"]){
      if(this.chat?.isDraft){
        this.messages = [];
      }
    }
  }

  ngAfterViewChecked() {
    if (!this.hasInitialScrollDone && this.messages?.length > 0) {
      const el = this.chatBody?.nativeElement;
      if (!el) return;
  
      el.scrollTop = el.scrollHeight;
      this.hasInitialScrollDone = true;
  
      console.log('Initial scroll (AfterViewChecked)');
    }
  }

  onSubmit() {
    if (this.messageContent.trim()) {
      // Draft flow: create chat with first message via REST endpoint
      if (this.chat?.isDraft && this.chat?.draftContact) {
        const newChat: NewChatRequest = {
          chatName: null,
          chatParticipantIds: [this.chat.draftContact.contactId],
          isGroup: false,
          message: {
            content: this.messageContent,
            mediaUrl: null,
            mediaType: MediaType.Text,
          },
        };

        this.store.dispatch(ChatActions.startChat({ newChat }));
        this.messageContent = '';
        return;
      }

      // Existing chat flow: send message via SignalR
      const message: MessageRequest = {
        chatId: this.chat?.id,
        content: this.messageContent,
        mediaType: MediaType.Text,
      };

      this.signalRService.sendNewMessage(message);
      this.messageContent = ''; // Clear the input after submission
    }
  }

  onScroll() {
    if (!this.hasInitialScrollDone) return;

    const el = this.chatBody.nativeElement;

    // Trigger when near top (NOT exactly 0 → UX buffer)
    if (el.scrollTop < 100) {
      console.log('TRIGGER LOAD MORE');
      this.loadOlderMessages();
    }
  }

  private loadOlderMessages() {
    if (this.isLoadingFromScroll) return;

    const el = this.chatBody.nativeElement;

    this.prevScrollHeight = el.scrollHeight;
    this.isLoadingFromScroll = true;

    this.store.dispatch(
      ChatActions.loadOlderMessages({
        chatId: this.chat!.id,
      }),
    );
  }

  get chatImage(): string {
    if (this.chat?.isGroup) {
      return 'assets/img/user/user0.jpg';
    }

    if (this.chat?.isDraft) {
      return this.chat?.draftContact!.avatar!;
    }

    const otherSender = this.chat?.participants.find(
      (p) => p.userId !== this.userId,
    );

    if (otherSender) {
      return otherSender.avatar!;
    }

    return 'assets/img/user/user0.jpg';
  }

  get chatName(): string {
    if (this.chat?.isGroup) {
      return this.chat.chatName ?? 'Group';
    }

    if (this.chat?.isDraft) {
      const draftContact = this.chat?.draftContact!;
      return draftContact.firstName + ' ' + draftContact.lastName;
    }

    const otherSender = this.chat?.participants.find(
      (p) => p.userId !== this.userId,
    );

    if (otherSender) {
      return (
        `${otherSender.firstName} ${otherSender.lastName}`.trim() || 'Chat'
      );
    }
    return this.chat?.chatName ?? 'Chat';
  }

  isMessageByMe(messageUserId: number): boolean {
    const isMessageByMe = messageUserId == this.userId;
    return isMessageByMe;
  }

  isMessageDelivered(messageStatuses: MessageStatusDto[]) {
    return isMessageDelivered(messageStatuses);
  }

  isMessageSeen(messageStatuses: MessageStatusDto[]) {
    return isMessageSeen(messageStatuses);
  }

  trackByMessageId(index: number, message: Message) {
    return message.id;
  }

  private markChatSeen(chatId: number, messages: Message[]) {
    if (
      messages.some((m) =>
        m.messageStatuses.some((ms) => !ms.isSeen && ms.userId == this.userId),
      )
    ) {
      this.signalRService.messagesSeenForChatUser(chatId);
    }
  }
}
