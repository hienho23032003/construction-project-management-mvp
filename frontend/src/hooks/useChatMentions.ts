import { useState, useEffect, useCallback } from 'react';
import { User, TaskItem, Project, SendMessageMentionInput } from '../types';
import { userApi, taskApi, projectApi } from '../services/api/endpoints';
import { CHAT_MENTION_TRIGGERS } from '../constants/chat.constants';

interface UseChatMentionsOptions {
  projectId?: string;
  onSelectTagText?: (newText: string) => void;
}

export const useChatMentions = ({ projectId }: UseChatMentionsOptions = {}) => {
  const [mentionMode, setMentionMode] = useState<'user' | 'task' | 'project' | null>(null);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionAnchor, setMentionAnchor] = useState<HTMLElement | null>(null);

  const [usersList, setUsersList] = useState<User[]>([]);
  const [tasksList, setTasksList] = useState<TaskItem[]>([]);
  const [projectsList, setProjectsList] = useState<Project[]>([]);

  // Load mention targets
  useEffect(() => {
    userApi
      .getAllList()
      .then((res) => {
        if (res.data.success && res.data.data) setUsersList(res.data.data);
      })
      .catch(() => {});

    projectApi
      .getAll({ pageSize: 50 })
      .then((res) => {
        if (res.data.success && res.data.data) setProjectsList(res.data.data.items);
      })
      .catch(() => {});

    const taskParams = projectId ? { projectId, pageSize: 50 } : { pageSize: 50 };
    taskApi
      .getAll(taskParams)
      .then((res) => {
        if (res.data.success && res.data.data) setTasksList(res.data.data.items);
      })
      .catch(() => {});
  }, [projectId]);

  // Handle typing to detect triggers
  const handleDetectTrigger = useCallback(
    (text: string, cursorPosition: number, anchorEl: HTMLElement | null) => {
      const textBeforeCursor = text.slice(0, cursorPosition);

      // Match trigger at start of string or preceded by whitespace, without trailing spaces
      const userMatch = textBeforeCursor.match(/(?:^|\s)@([\p{L}\p{N}\p{M}_]*)$/u);
      const taskMatch = textBeforeCursor.match(/(?:^|\s)#([\p{L}\p{N}\p{M}_-]*)$/u);
      const projMatch = textBeforeCursor.match(/(?:^|\s)!([\p{L}\p{N}\p{M}_-]*)$/u);

      if (userMatch) {
        setMentionMode('user');
        setMentionQuery(userMatch[1]);
        setMentionAnchor(anchorEl);
      } else if (taskMatch) {
        setMentionMode('task');
        setMentionQuery(taskMatch[1]);
        setMentionAnchor(anchorEl);
      } else if (projMatch) {
        setMentionMode('project');
        setMentionQuery(projMatch[1]);
        setMentionAnchor(anchorEl);
      } else {
        setMentionMode(null);
        setMentionAnchor(null);
      }
    },
    []
  );

  const closeMentionPopover = useCallback(() => {
    setMentionMode(null);
    setMentionAnchor(null);
  }, []);

  const buildTagReplacement = useCallback(
    (currentText: string, mode: 'user' | 'task' | 'project', label: string): string => {
      const trigger =
        mode === 'user'
          ? CHAT_MENTION_TRIGGERS.USER
          : mode === 'task'
          ? CHAT_MENTION_TRIGGERS.TASK
          : CHAT_MENTION_TRIGGERS.PROJECT;

      const lastIndex = currentText.lastIndexOf(trigger);
      if (lastIndex !== -1) {
        const prefix = currentText.slice(0, lastIndex);
        return `${prefix}${trigger}${label} `;
      }
      return currentText;
    },
    []
  );

  // Build mentions array with deduplication and numeric enum conversion
  const parseMentions = useCallback(
    (text: string): SendMessageMentionInput[] => {
      const mentions: SendMessageMentionInput[] = [];
      const addedIds = new Set<string>();

      // Tag users @Name
      usersList.forEach((u) => {
        const tag = `@${u.fullName}`;
        if (text.includes(tag) && !addedIds.has(u.id)) {
          addedIds.add(u.id);
          mentions.push({
            mentionType: 0, // ChatMentionType.User
            targetId: u.id,
            displayName: u.fullName,
          });
        }
      });

      // Tag tasks #TaskCode / #TaskName
      tasksList.forEach((t) => {
        const tagCode = `#${t.id.slice(0, 8)}`;
        const tagName = `#${t.name.replace(/\s+/g, '_')}`;
        if (
          (text.includes(tagCode) || text.includes(tagName) || text.includes(`#${t.name}`)) &&
          !addedIds.has(t.id)
        ) {
          addedIds.add(t.id);
          mentions.push({
            mentionType: 1, // ChatMentionType.Task
            targetId: t.id,
            displayName: t.name,
          });
        }
      });

      // Tag projects !ProjectCode / !ProjectName
      projectsList.forEach((p) => {
        const tagCode = `!${p.code}`;
        const tagName = `!${p.name.replace(/\s+/g, '_')}`;
        if (
          (text.includes(tagCode) || text.includes(tagName) || text.includes(`!${p.name}`)) &&
          !addedIds.has(p.id)
        ) {
          addedIds.add(p.id);
          mentions.push({
            mentionType: 2, // ChatMentionType.Project
            targetId: p.id,
            displayName: `${p.code} - ${p.name}`,
          });
        }
      });

      return mentions;
    },
    [projectsList, tasksList, usersList]
  );

  return {
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
  };
};
