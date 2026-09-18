import { useRef, useState, useCallback, useLayoutEffect } from 'react';
import { CHAT_PAGINATION } from '../constants/chat.constants';

interface UseChatScrollOptions {
  messages?: any[];
  onLoadOlder?: () => Promise<void>;
  hasOlderMessages?: boolean;
  isLoadingOlder?: boolean;
}

export const useChatScroll = ({
  messages = [],
  onLoadOlder,
  hasOlderMessages = false,
  isLoadingOlder = false,
}: UseChatScrollOptions = {}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const isInitialScrollDone = useRef(false);
  const scrollRafRef = useRef<number | null>(null);
  const isScrollingToBottomRef = useRef(false);

  // Pagination scroll position preservation (Dual Anchor: Element + Height Delta)
  const isPrependingOlderRef = useRef(false);
  const previousScrollHeightRef = useRef(0);
  const previousScrollTopRef = useRef(0);
  const anchorMessageIdRef = useRef<string | null>(null);
  const anchorElementTopRef = useRef<number>(0);

  // Synchronously restore scroll position when older messages are committed to DOM (before paint)
  useLayoutEffect(() => {
    if (isPrependingOlderRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      let anchored = false;

      // 1. Primary: Exact Element Anchoring
      if (anchorMessageIdRef.current) {
        const anchorEl = document.getElementById(`chat-msg-${anchorMessageIdRef.current}`);
        if (anchorEl) {
          const newRectTop = anchorEl.getBoundingClientRect().top;
          const delta = newRectTop - anchorElementTopRef.current;
          container.scrollTop += delta;
          anchored = true;
        }
      }

      // 2. Fallback: ScrollHeight difference
      if (!anchored) {
        const newScrollHeight = container.scrollHeight;
        const heightDiff = newScrollHeight - previousScrollHeightRef.current;

        if (heightDiff > 0) {
          // Keep the user exactly at the junction point
          container.scrollTop = previousScrollTopRef.current + heightDiff;
        }
      }

      isPrependingOlderRef.current = false;
      anchorMessageIdRef.current = null;
    }
  }, [messages]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    isScrollingToBottomRef.current = true;
    setShowScrollBottom(false);

    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
    }

    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }

    setTimeout(() => {
      isScrollingToBottomRef.current = false;
    }, 700);
  }, []);

  const resetInitialScroll = useCallback(() => {
    isInitialScrollDone.current = false;
    isPrependingOlderRef.current = false;
  }, []);

  const markInitialScrollDone = useCallback(() => {
    isInitialScrollDone.current = true;
  }, []);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      if (scrollRafRef.current) {
        cancelAnimationFrame(scrollRafRef.current);
      }

      scrollRafRef.current = requestAnimationFrame(() => {
        const isNearBottom =
          scrollHeight - scrollTop - clientHeight <
          CHAT_PAGINATION.BOTTOM_SCROLL_THRESHOLD;

        setShowScrollBottom((prev) => {
          const next = !isNearBottom;
          return prev !== next ? next : prev;
        });
      });

      // Do not trigger loading older messages if user is actively jumping to bottom
      if (isScrollingToBottomRef.current) {
        return;
      }

      const isAtTop = scrollTop <= CHAT_PAGINATION.TOP_SCROLL_THRESHOLD;
      if (
        isAtTop &&
        hasOlderMessages &&
        !isLoadingOlder &&
        !isPrependingOlderRef.current &&
        onLoadOlder
      ) {
        if (scrollContainerRef.current) {
          previousScrollHeightRef.current = scrollContainerRef.current.scrollHeight;
          previousScrollTopRef.current = scrollContainerRef.current.scrollTop;
          isPrependingOlderRef.current = true;

          // Capture the top-most visible message element for precise pixel-level anchoring
          if (messages.length > 0) {
            const firstMsgId = messages[0].id;
            const el = document.getElementById(`chat-msg-${firstMsgId}`);
            if (el) {
              anchorMessageIdRef.current = firstMsgId;
              anchorElementTopRef.current = el.getBoundingClientRect().top;
            }
          }
        }

        onLoadOlder().catch(() => {
          isPrependingOlderRef.current = false;
          anchorMessageIdRef.current = null;
        });
      }
    },
    [hasOlderMessages, isLoadingOlder, onLoadOlder]
  );

  return {
    scrollContainerRef,
    messagesEndRef,
    showScrollBottom,
    isInitialScrollDone,
    scrollToBottom,
    handleScroll,
    resetInitialScroll,
    markInitialScrollDone,
  };
};
