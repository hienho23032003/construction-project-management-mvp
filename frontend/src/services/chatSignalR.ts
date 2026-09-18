import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from './api/apiClient';
import {
  ChatMessage,
  Conversation,
  SendMessagePayload,
  TypingNotification,
  ReadReceipt,
} from '../types';

type Listener<T> = (data: T) => void;

class ChatSignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnecting = false;
  private activeRoomId: string | null = null;

  private messageListeners = new Set<Listener<ChatMessage>>();
  private typingListeners = new Set<Listener<TypingNotification>>();
  private readListeners = new Set<Listener<ReadReceipt>>();
  private conversationUpdatedListeners = new Set<Listener<Conversation>>();

  private getHubUrl(): string {
    const base = API_BASE_URL.replace(/\/api\/?$/, '');
    return `${base}/hubs/chat`;
  }

  public async startConnection(): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (
      this.connection &&
      (this.connection.state === signalR.HubConnectionState.Connected ||
        this.connection.state === signalR.HubConnectionState.Connecting)
    ) {
      return;
    }

    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(this.getHubUrl(), {
          accessTokenFactory: () => localStorage.getItem('token') || '',
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect([0, 1000, 3000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      this.registerHandlers();

      // On reconnect, automatically re-join the active conversation room
      this.connection.onreconnected(async () => {
        console.log('🔄 SignalR reconnected.');
        if (this.activeRoomId) {
          await this.joinConversation(this.activeRoomId);
        }
      });

      await this.connection.start();
      console.log('✅ SignalR Chat Hub Connected successfully.');

      if (this.activeRoomId) {
        await this.joinConversation(this.activeRoomId);
      }
    } catch (err) {
      console.warn('⚠️ SignalR connection error:', err);
    } finally {
      this.isConnecting = false;
    }
  }

  private registerHandlers() {
    if (!this.connection) return;

    this.connection.on('ReceiveMessage', (msg: ChatMessage) => {
      this.messageListeners.forEach((cb) => {
        try {
          cb(msg);
        } catch (e) {
          console.error('Error in onReceiveMessage listener:', e);
        }
      });
    });

    this.connection.on('UserTyping', (typing: TypingNotification) => {
      this.typingListeners.forEach((cb) => {
        try {
          cb(typing);
        } catch (e) {
          console.error('Error in onUserTyping listener:', e);
        }
      });
    });

    this.connection.on('MessageRead', (receipt: ReadReceipt) => {
      this.readListeners.forEach((cb) => {
        try {
          cb(receipt);
        } catch (e) {
          console.error('Error in onMessageRead listener:', e);
        }
      });
    });

    this.connection.on('ConversationUpdated', (conv: Conversation) => {
      this.conversationUpdatedListeners.forEach((cb) => {
        try {
          cb(conv);
        } catch (e) {
          console.error('Error in onConversationUpdated listener:', e);
        }
      });
    });
  }

  // Subscriber methods with cleanup
  public onReceiveMessage(cb: Listener<ChatMessage>): () => void {
    this.messageListeners.add(cb);
    return () => this.messageListeners.delete(cb);
  }

  public onUserTyping(cb: Listener<TypingNotification>): () => void {
    this.typingListeners.add(cb);
    return () => this.typingListeners.delete(cb);
  }

  public onMessageRead(cb: Listener<ReadReceipt>): () => void {
    this.readListeners.add(cb);
    return () => this.readListeners.delete(cb);
  }

  public onConversationUpdated(cb: Listener<Conversation>): () => void {
    this.conversationUpdatedListeners.add(cb);
    return () => this.conversationUpdatedListeners.delete(cb);
  }

  /**
   * Set listeners without overwriting other subscribers
   */
  public setListeners(listeners: {
    onReceiveMessage?: (msg: ChatMessage) => void;
    onUserTyping?: (typing: TypingNotification) => void;
    onMessageRead?: (receipt: ReadReceipt) => void;
    onConversationUpdated?: (conv: Conversation) => void;
  }): () => void {
    const unsubs: (() => void)[] = [];
    if (listeners.onReceiveMessage) unsubs.push(this.onReceiveMessage(listeners.onReceiveMessage));
    if (listeners.onUserTyping) unsubs.push(this.onUserTyping(listeners.onUserTyping));
    if (listeners.onMessageRead) unsubs.push(this.onMessageRead(listeners.onMessageRead));
    if (listeners.onConversationUpdated) unsubs.push(this.onConversationUpdated(listeners.onConversationUpdated));
    return () => unsubs.forEach((u) => u());
  }

  public isConnected(): boolean {
    return (this.connection?.state as any) === signalR.HubConnectionState.Connected;
  }

  public async joinConversation(conversationId: string): Promise<void> {
    if (!conversationId) return;
    this.activeRoomId = conversationId;

    if (!this.connection) {
      await this.startConnection();
    }

    // Wait up to 3 seconds if connecting
    if (this.connection?.state === signalR.HubConnectionState.Connecting) {
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 100));
        if (this.isConnected()) break;
      }
    }

    if (this.isConnected()) {
      try {
        await this.connection?.invoke('JoinConversation', conversationId);
      } catch (err) {
        console.warn('Failed to join conversation room:', err);
      }
    }
  }

  public async leaveConversation(conversationId: string): Promise<void> {
    if (this.activeRoomId === conversationId) {
      this.activeRoomId = null;
    }
    if (this.isConnected()) {
      try {
        await this.connection?.invoke('LeaveConversation', conversationId);
      } catch (err) {
        console.warn('Failed to leave conversation room:', err);
      }
    }
  }

  public async sendMessage(payload: SendMessagePayload): Promise<ChatMessage | null> {
    if (!this.connection || this.connection.state === signalR.HubConnectionState.Disconnected) {
      await this.startConnection();
    }

    if (this.connection?.state === signalR.HubConnectionState.Connecting) {
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 100));
        if (this.isConnected()) break;
      }
    }

    if (this.isConnected()) {
      return await this.connection!.invoke('SendMessage', payload);
    }
    return null;
  }

  public async sendTyping(conversationId: string, isTyping: boolean): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('SendTyping', conversationId, isTyping);
      } catch {
        // ignore typing error
      }
    }
  }

  public async markAsRead(conversationId: string, lastMessageId: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('MarkAsRead', conversationId, lastMessageId);
      } catch {
        // ignore markAsRead error
      }
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }
}

export const chatSignalR = new ChatSignalRService();
