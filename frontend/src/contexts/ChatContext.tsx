import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Conversation, ChatMessage } from '../types';
import { chatApi } from '../services/api/endpoints';
import { chatSignalR } from '../services/chatSignalR';
import { useAuth } from './AuthContext';

interface ChatContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  totalUnreadCount: number;
  isLoading: boolean;
  setActiveConversationId: (id: string | null) => void;
  fetchConversations: () => Promise<void>;
  openDirectChatWithUser: (targetUserId: string) => Promise<string | null>;
  openProjectChat: (projectId: string) => Promise<string | null>;
  markConversationAsRead: (conversationId: string, lastMessageId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const res = await chatApi.getConversations();
      if (res.data.success && res.data.data) {
        setConversations(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Connect to SignalR when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      chatSignalR.startConnection();
      fetchConversations();
    } else {
      chatSignalR.stopConnection();
      setConversations([]);
      setActiveConversationId(null);
    }

    return () => {
      // Clean up on unmount if needed
    };
  }, [isAuthenticated, fetchConversations]);

  // Handle SignalR Global Events
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsub = chatSignalR.setListeners({
      onReceiveMessage: (msg: ChatMessage) => {
        setConversations((prev) => {
          const exists = prev.find((c) => c.id === msg.conversationId);
          if (exists) {
            const isCurrentChat = activeConversationId === msg.conversationId;
            const isOwnMessage = msg.senderId === user?.id;
            return prev
              .map((c) => {
                if (c.id === msg.conversationId) {
                  return {
                    ...c,
                    lastMessage: msg,
                    lastMessageAt: msg.createdAt,
                    unreadCount: isCurrentChat || isOwnMessage ? c.unreadCount : c.unreadCount + 1,
                  };
                }
                return c;
              })
              .sort((a, b) => new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime());
          } else {
            // New conversation created or loaded
            fetchConversations();
            return prev;
          }
        });
      },
      onConversationUpdated: (updatedConv: Conversation) => {
        setConversations((prev) => {
          const index = prev.findIndex((c) => c.id === updatedConv.id);
          if (index >= 0) {
            const copy = [...prev];
            copy[index] = { ...copy[index], ...updatedConv };
            return copy.sort((a, b) => new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime());
          }
          return [updatedConv, ...prev];
        });
      },
    });

    return () => {
      unsub();
    };
  }, [isAuthenticated, activeConversationId, user?.id, fetchConversations]);

  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }, [conversations]);

  const openDirectChatWithUser = useCallback(
    async (targetUserId: string): Promise<string | null> => {
      try {
        const res = await chatApi.getOrCreateDirectChat(targetUserId);
        if (res.data.success && res.data.data) {
          const conv = res.data.data;
          setConversations((prev) => {
            if (!prev.some((c) => c.id === conv.id)) {
              return [conv, ...prev];
            }
            return prev;
          });
          setActiveConversationId(conv.id);
          chatSignalR.joinConversation(conv.id);
          return conv.id;
        }
      } catch (err) {
        console.error('Failed to open direct chat:', err);
      }
      return null;
    },
    []
  );

  const openProjectChat = useCallback(
    async (projectId: string): Promise<string | null> => {
      try {
        const res = await chatApi.createProjectChat(projectId);
        if (res.data.success && res.data.data) {
          const conv = res.data.data;
          setConversations((prev) => {
            if (!prev.some((c) => c.id === conv.id)) {
              return [conv, ...prev];
            }
            return prev;
          });
          setActiveConversationId(conv.id);
          chatSignalR.joinConversation(conv.id);
          return conv.id;
        }
      } catch (err) {
        console.error('Failed to open project chat:', err);
      }
      return null;
    },
    []
  );

  const markConversationAsRead = useCallback(
    async (conversationId: string, lastMessageId: string) => {
      try {
        await chatApi.markAsRead(conversationId, lastMessageId);
        await chatSignalR.markAsRead(conversationId, lastMessageId);
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
        );
      } catch (err) {
        console.error('Failed to mark conversation as read:', err);
      }
    },
    []
  );

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversationId,
        totalUnreadCount,
        isLoading,
        setActiveConversationId,
        fetchConversations,
        openDirectChatWithUser,
        openProjectChat,
        markConversationAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
