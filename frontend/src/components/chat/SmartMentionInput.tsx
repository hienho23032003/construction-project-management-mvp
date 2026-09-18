import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  InputBase,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  SentimentSatisfiedAlt as EmojiIcon,
  Close as CloseIcon,
  ThumbUp as ThumbUpIcon,
  Assignment as TaskIcon,
  Business as ProjectIcon,
  AlternateEmail as AtIcon,
} from '@mui/icons-material';
import { ChatMessage, SendMessageMentionInput } from '../../types';
import { useChatMentions } from '../../hooks/useChatMentions';
import { MentionPopover } from './MentionPopover';
import { EmojiPickerPopover } from './EmojiPickerPopover';
import { ChatAttachmentPreview } from './ChatAttachmentPreview';
import { CHAT_COLORS, CHAT_TIMERS } from '../../constants/chat.constants';

interface SmartMentionInputProps {
  conversationId: string;
  projectId?: string;
  replyTo: ChatMessage | null;
  onCancelReply?: () => void;
  onSendMessage: (
    content: string,
    files: File[],
    mentions: SendMessageMentionInput[]
  ) => Promise<boolean>;
  onTyping?: (isTyping: boolean) => void;
}

export const SmartMentionInput: React.FC<SmartMentionInputProps> = ({
  projectId,
  replyTo,
  onCancelReply,
  onSendMessage,
  onTyping,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    mentionMode,
    mentionQuery,
    mentionAnchor,
    usersList,
    tasksList,
    projectsList,
    handleDetectTrigger,
    closeMentionPopover,
    buildTagReplacement,
    parseMentions,
  } = useChatMentions({ projectId });

  // Filtered lists for autocomplete
  const filteredUsers = useMemo(() => {
    if (mentionMode !== 'user') return [];
    const q = mentionQuery.toLowerCase().trim();
    if (!q) return usersList.slice(0, 10);
    return usersList
      .filter((u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .slice(0, 10);
  }, [mentionMode, mentionQuery, usersList]);

  const filteredTasks = useMemo(() => {
    if (mentionMode !== 'task') return [];
    const q = mentionQuery.toLowerCase().trim();
    if (!q) return tasksList.slice(0, 10);
    return tasksList.filter((t) => t.name.toLowerCase().includes(q)).slice(0, 10);
  }, [mentionMode, mentionQuery, tasksList]);

  const filteredProjects = useMemo(() => {
    if (mentionMode !== 'project') return [];
    const q = mentionQuery.toLowerCase().trim();
    if (!q) return projectsList.slice(0, 10);
    return projectsList
      .filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
      .slice(0, 10);
  }, [mentionMode, mentionQuery, projectsList]);

  const activeItemsCount =
    mentionMode === 'user'
      ? filteredUsers.length
      : mentionMode === 'task'
      ? filteredTasks.length
      : mentionMode === 'project'
      ? filteredProjects.length
      : 0;

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset selectedIndex whenever query or mode changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [mentionMode, mentionQuery]);

  // Handle typing notification & trigger detection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setContent(val);

    if (onTyping) {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, CHAT_TIMERS.TYPING_DEBOUNCE_MS);
    }

    const cursor = e.target.selectionStart || val.length;
    handleDetectTrigger(val, cursor, inputRef.current);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isPopoverOpen = Boolean(mentionAnchor && mentionMode && activeItemsCount > 0);

    if (isPopoverOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % activeItemsCount);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + activeItemsCount) % activeItemsCount);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (mentionMode === 'user') {
          const user = filteredUsers[selectedIndex];
          if (user) handleSelectMention('user', user.fullName);
        } else if (mentionMode === 'task') {
          const task = filteredTasks[selectedIndex];
          if (task) handleSelectMention('task', task.name.replace(/\s+/g, '_'));
        } else if (mentionMode === 'project') {
          const project = filteredProjects[selectedIndex];
          if (project) handleSelectMention('project', project.code || project.name.replace(/\s+/g, '_'));
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMentionPopover();
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArr]);
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectMention = (mode: 'user' | 'task' | 'project', label: string) => {
    const updated = buildTagReplacement(content, mode, label);
    setContent(updated);
    closeMentionPopover();
    inputRef.current?.focus();
  };

  const handleSelectEmoji = (emoji: string) => {
    setContent((prev) => `${prev}${emoji}`);
    setEmojiAnchor(null);
    inputRef.current?.focus();
  };

  const handleSubmit = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed && selectedFiles.length === 0) return;

    setIsSubmitting(true);
    try {
      const mentions = parseMentions(trimmed);
      const ok = await onSendMessage(trimmed, selectedFiles, mentions);
      if (ok) {
        setContent('');
        setSelectedFiles([]);
        if (onCancelReply) onCancelReply();
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [content, onCancelReply, onSendMessage, parseMentions, selectedFiles]);

  const sendQuickLike = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSendMessage('👍', [], []);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, onSendMessage]);

  const hasInput = content.trim().length > 0 || selectedFiles.length > 0;

  return (
    <Box
      sx={{
        width: '100%',
        flexShrink: 0,
        backgroundColor: isDark ? CHAT_COLORS.dark.surface : CHAT_COLORS.light.bg,
        borderTop: '1px solid',
        borderColor: 'divider',
        p: { xs: 1, sm: 1.25 },
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Hidden file inputs */}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <input
        type="file"
        accept="image/*"
        multiple
        ref={imageInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Replying Banner */}
      {replyTo && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: isDark ? 'rgba(168, 85, 247, 0.15)' : '#f3e8ff',
            px: 2,
            py: 0.75,
            borderRadius: '12px',
            mb: 1,
            borderLeft: `4px solid ${CHAT_COLORS.primary}`,
          }}
        >
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: CHAT_COLORS.primary, display: 'block' }}>
              Đang trả lời {replyTo.senderName}
            </Typography>
            <Typography variant="body2" noWrap sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
              {replyTo.content || '[Tệp đính kèm]'}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onCancelReply}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* File Attachment Previews */}
      <ChatAttachmentPreview files={selectedFiles} onRemoveFile={removeFile} />

      {/* Main Composer Row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        {/* Left Action Buttons (Images, Attachments, Mention triggers) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
          <Tooltip title="Đính kèm hình ảnh">
            <IconButton
              size="small"
              onClick={() => imageInputRef.current?.click()}
              sx={{ color: CHAT_COLORS.primary, p: 0.75 }}
            >
              <ImageIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Đính kèm tệp tin">
            <IconButton
              size="small"
              onClick={() => fileInputRef.current?.click()}
              sx={{ color: CHAT_COLORS.primary, p: 0.75 }}
            >
              <AttachFileIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Nhắc tên thành viên (@)">
            <IconButton
              size="small"
              onClick={() => {
                setContent((prev) => `${prev}@`);
                inputRef.current?.focus();
              }}
              sx={{ color: 'text.secondary', p: 0.75, display: { xs: 'none', sm: 'inline-flex' } }}
            >
              <AtIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Gắn thẻ công việc (#)">
            <IconButton
              size="small"
              onClick={() => {
                setContent((prev) => `${prev}#`);
                inputRef.current?.focus();
              }}
              sx={{ color: 'text.secondary', p: 0.75, display: { xs: 'none', sm: 'inline-flex' } }}
            >
              <TaskIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Gắn thẻ dự án (!)">
            <IconButton
              size="small"
              onClick={() => {
                setContent((prev) => `${prev}!`);
                inputRef.current?.focus();
              }}
              sx={{ color: 'text.secondary', p: 0.75, display: { xs: 'none', sm: 'inline-flex' } }}
            >
              <ProjectIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Center Pill Input */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: isDark ? '#3a3b3c' : '#f0f2f5',
            borderRadius: '20px',
            px: { xs: 1.25, sm: 2 },
            py: { xs: 0.35, sm: 0.5 },
          }}
        >
          <InputBase
            inputRef={inputRef}
            placeholder={isMobile ? 'Nhắn tin...' : 'Nhắn tin... (dùng @, #, ! để gắn thẻ)'}
            value={content}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            multiline
            maxRows={4}
            fullWidth
            sx={{
              fontSize: { xs: '0.85rem', sm: '0.9375rem' },
              color: isDark ? CHAT_COLORS.dark.textPrimary : CHAT_COLORS.light.textPrimary,
              '& ::placeholder': {
                color: 'text.secondary',
                opacity: 0.8,
              },
            }}
          />

          <Tooltip title="Chọn biểu tượng cảm xúc">
            <IconButton
              size="small"
              onClick={(e) => setEmojiAnchor(e.currentTarget)}
              sx={{ color: 'text.secondary', p: 0.5, ml: 0.5 }}
            >
              <EmojiIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Right Action: Send Button or Quick Like 👍 */}
        {hasInput ? (
          <Tooltip title="Gửi tin nhắn (Enter)">
            <span>
              <IconButton
                color="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{
                  bgcolor: CHAT_COLORS.primary,
                  color: '#fff',
                  p: 0.85,
                  '&:hover': { bgcolor: CHAT_COLORS.primaryHover },
                  '&.Mui-disabled': { bgcolor: isDark ? '#3a3b3c' : '#e4e6eb' },
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <SendIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </span>
          </Tooltip>
        ) : (
          <Tooltip title="Gửi lượt thích nhanh 👍">
            <IconButton
              onClick={sendQuickLike}
              sx={{
                color: CHAT_COLORS.primary,
                p: 0.75,
                transition: 'transform 0.15s ease',
                '&:hover': { transform: 'scale(1.2)' },
              }}
            >
              <ThumbUpIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Autocomplete Mention Popover with keyboard navigation & selection */}
      <MentionPopover
        open={Boolean(mentionAnchor && mentionMode)}
        anchorEl={mentionAnchor}
        onClose={closeMentionPopover}
        mentionMode={mentionMode}
        filteredUsers={filteredUsers}
        filteredTasks={filteredTasks}
        filteredProjects={filteredProjects}
        selectedIndex={selectedIndex}
        onHoverIndex={(idx) => setSelectedIndex(idx)}
        onSelectUser={(u) => handleSelectMention('user', u.fullName)}
        onSelectTask={(t) => handleSelectMention('task', t.name.replace(/\s+/g, '_'))}
        onSelectProject={(p) => handleSelectMention('project', p.code || p.name.replace(/\s+/g, '_'))}
      />

      {/* Emoji Picker Popover */}
      <EmojiPickerPopover
        open={Boolean(emojiAnchor)}
        anchorEl={emojiAnchor}
        onClose={() => setEmojiAnchor(null)}
        onSelectEmoji={handleSelectEmoji}
      />
    </Box>
  );
};
