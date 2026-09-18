import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChatMessage,
  SendMessageMentionInput,
  SendMessageAttachmentInput,
  SendMessagePayload,
  TypingNotification,
  ReadReceipt,
} from '../types';
import { chatApi } from '../services/api/endpoints';
import { chatSignalR } from '../services/chatSignalR';
import { CHAT_PAGINATION, CHAT_TIMERS } from '../constants/chat.constants';

interface UseChatMessagesProps {
  conversationId: string | null;
  currentUserId?: string;
  onNewMessageSent?: () => void;
  onMessageReceived?: (msg: ChatMessage) => void;
}

export const useChatMessages = ({
  conversationId,
  currentUserId,
  onNewMessageSent,
  onMessageReceived,
}: UseChatMessagesProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [loadingOlder, setLoadingOlder] = useState<boolean>(false);
  const [hasOlderMessages, setHasOlderMessages] = useState<boolean>(true);
  const [typingUsers, setTypingUsers] = useState<TypingNotification[]>([]);

  const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // 1. Fetch initial messages
  const fetchMessages = useCallback(async (convId: string) => {
    try {
      setLoadingMessages(true);
      setMessages([]);
      setHasOlderMessages(true);

      const res = await chatApi.getMessages(convId, undefined, CHAT_PAGINATION.DEFAULT_PAGE_SIZE);
      if (res.data.success && res.data.data) {
        const pagedData = res.data.data;
        const items = pagedData.items || [];
        setMessages(items);
        setHasOlderMessages(pagedData.hasMore ?? false);

        if (items.length > 0) {
          const lastMsg = items[items.length - 1];
          chatApi.markAsRead(convId, lastMsg.id).catch(() => {});
          chatSignalR.markAsRead(convId, lastMsg.id).catch(() => {});
        }
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // 2. Load older messages (cursor pagination)
  const loadOlderMessages = useCallback(async () => {
    if (!conversationId || loadingOlder || !hasOlderMessages || messages.length === 0) return;

    const oldestMessage = messages[0];
    try {
      setLoadingOlder(true);
      const res = await chatApi.getMessages(conversationId, oldestMessage.id, CHAT_PAGINATION.DEFAULT_PAGE_SIZE);
      if (res.data.success && res.data.data) {
        const older = res.data.data.items || [];
        setHasOlderMessages(res.data.data.hasMore ?? false);
        if (older.length > 0) {
          setMessages((prev) => [...older, ...prev]);
        }
      }
    } catch (err) {
      console.error('Failed to load older messages:', err);
    } finally {
      setLoadingOlder(false);
    }
  }, [conversationId, hasOlderMessages, loadingOlder, messages]);

  // 3. Effect: join room & load initial messages when conversationId changes
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
      chatSignalR.joinConversation(conversationId);

      return () => {
        chatSignalR.leaveConversation(conversationId);
        // Clear all typing timeouts
        typingTimeoutsRef.current.forEach((t) => clearTimeout(t));
        typingTimeoutsRef.current.clear();
        setTypingUsers([]);
      };
    }
  }, [conversationId, fetchMessages]);

  // 4. SignalR Event Listeners
  useEffect(() => {
    if (!conversationId) return;

    const unsub = chatSignalR.setListeners({
      onReceiveMessage: (newMsg: ChatMessage) => {
        if (newMsg.conversationId === conversationId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // Clear typing for sender
          setTypingUsers((prev) => prev.filter((u) => u.userId !== newMsg.senderId));

          if (currentUserId && newMsg.senderId !== currentUserId) {
            chatApi.markAsRead(conversationId, newMsg.id).catch(() => {});
            chatSignalR.markAsRead(conversationId, newMsg.id).catch(() => {});
          }

          onMessageReceived?.(newMsg);
        }
      },
      onUserTyping: (notif: TypingNotification) => {
        if (notif.conversationId === conversationId && notif.userId !== currentUserId) {
          if (notif.isTyping) {
            setTypingUsers((prev) => {
              if (prev.some((u) => u.userId === notif.userId)) return prev;
              return [...prev, notif];
            });

            // Auto-clear typing indicator after timeout
            const existingTimeout = typingTimeoutsRef.current.get(notif.userId);
            if (existingTimeout) clearTimeout(existingTimeout);

            const newTimeout = setTimeout(() => {
              setTypingUsers((prev) => prev.filter((u) => u.userId !== notif.userId));
              typingTimeoutsRef.current.delete(notif.userId);
            }, CHAT_TIMERS.TYPING_TIMEOUT_MS);

            typingTimeoutsRef.current.set(notif.userId, newTimeout);
          } else {
            setTypingUsers((prev) => prev.filter((u) => u.userId !== notif.userId));
            const existingTimeout = typingTimeoutsRef.current.get(notif.userId);
            if (existingTimeout) {
              clearTimeout(existingTimeout);
              typingTimeoutsRef.current.delete(notif.userId);
            }
          }
        }
      },
      onMessageRead: (receipt: ReadReceipt) => {
        // Read receipt sync
        if (receipt.conversationId === conversationId) {
          // Future: sync individual read indicators if needed
        }
      },
    });

    return () => {
      unsub();
    };
  }, [conversationId, currentUserId, onMessageReceived]);

  // 5. Send Message Action
  const sendMessage = useCallback(
    async (
      content: string,
      files: File[] = [],
      mentions: SendMessageMentionInput[] = [],
      replyToMessageId?: string
    ): Promise<boolean> => {
      if (!conversationId) return false;

      try {
        let attachments: SendMessageAttachmentInput[] = [];
        if (files.length > 0) {
          const uploadRes = await chatApi.uploadAttachments(conversationId, files);
          if (uploadRes.data.success && uploadRes.data.data) {
            attachments = uploadRes.data.data;
          }
        }

        const payload: SendMessagePayload = {
          conversationId,
          content,
          replyToMessageId,
          attachments: attachments.length > 0 ? attachments : undefined,
          mentions: mentions.length > 0 ? mentions : undefined,
        };

        let messageResult: ChatMessage | null = null;
        try {
          messageResult = await chatSignalR.sendMessage(payload);
        } catch (signalRErr) {
          console.warn('SignalR sendMessage threw error, fallback to REST API:', signalRErr);
        }

        if (!messageResult) {
          const restRes = await chatApi.sendMessage(conversationId, payload);
          if (restRes.data.success && restRes.data.data) {
            messageResult = restRes.data.data;
          }
        }

        if (messageResult) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === messageResult!.id)) return prev;
            return [...prev, messageResult!];
          });
          onNewMessageSent?.();
          return true;
        }
        return false;
      } catch (err) {
        console.error('Failed to send message:', err);
        return false;
      }
    },
    [conversationId, onNewMessageSent]
  );

  return {
    messages,
    loadingMessages,
    loadingOlder,
    hasOlderMessages,
    typingUsers,
    fetchMessages,
    loadOlderMessages,
    sendMessage,
    setMessages,
  };
};
