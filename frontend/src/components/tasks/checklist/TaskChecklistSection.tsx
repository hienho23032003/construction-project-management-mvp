import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Button, TextField, Menu, MenuItem, Chip, CircularProgress } from '@mui/material';
import { CheckSquare, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { ChecklistItem, ChecklistItemData } from './ChecklistItem';
import { ProgressBar } from '../../common/ProgressBar';
import {
  useTaskChecklistQuery,
  useCreateChecklistItemMutation,
  useUpdateChecklistItemMutation,
  useDeleteChecklistItemMutation,
  useBatchSaveChecklistMutation,
} from '../../../hooks/useTasks';

interface TaskChecklistSectionProps {
  taskId: string;
  taskTitle?: string;
}

const TEMPLATES: Record<string, string[]> = {
  'Nghiệm thu Bê tông': [
    'Kiểm tra độ sụt bê tông tươi tại công trường',
    'Lấy mẫu thí nghiệm nén R7, R28',
    'Kiểm tra đầm dùi và chiều dày lớp bảo vệ',
    'Bảo dưỡng ẩm bê tông sau đổ',
  ],
  'Nghiệm thu Cốt thép': [
    'Kiểm tra chủng loại, đường kính và khoảng cách cốt thép',
    'Kiểm tra chiều dài nối buộc/hàn theo bản vẽ',
    'Kiểm tra con kê bảo vệ lớp bê tông',
    'Vệ sinh rỉ sét và rác trong lòng cốt thép',
  ],
  'An toàn lao động': [
    'Trang bị đầy đủ mũ, giày bảo hộ, dây an toàn trên cao',
    'Kiểm tra rào chắn và lưới an toàn xung quanh',
    'Kiểm tra tủ điện thi công và tiếp địa chống giật',
    'Dọn dẹp mặt bằng, thông thoáng lối thoát hiểm',
  ],
  'Nghiệm thu Xây trát': [
    'Kiểm tra độ phẳng và độ thẳng đứng của tường',
    'Kiểm tra tỷ lệ vữa xây trát và độ kết dính',
    'Đóng lưới chống nứt tại vị trí tiếp giáp cột/dầm',
    'Tưới nước ẩm bảo dưỡng tường sau trát',
  ],
};

export const TaskChecklistSection: React.FC<TaskChecklistSectionProps> = ({ taskId }) => {
  const { data: dbItems = [], isLoading } = useTaskChecklistQuery(taskId);
  const createMutation = useCreateChecklistItemMutation(taskId);
  const updateMutation = useUpdateChecklistItemMutation(taskId);
  const deleteMutation = useDeleteChecklistItemMutation(taskId);
  const batchMutation = useBatchSaveChecklistMutation(taskId);

  const [newTitle, setNewTitle] = useState('');
  const [templateAnchorEl, setTemplateAnchorEl] = useState<null | HTMLElement>(null);

  // Auto-migrate legacy localStorage items to Database if database is currently empty
  useEffect(() => {
    if (!isLoading && taskId) {
      try {
        const storageKey = `task_checklist_${taskId}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const localParsed: ChecklistItemData[] = JSON.parse(saved);
          if (localParsed.length > 0 && dbItems.length === 0) {
            batchMutation.mutate(
              localParsed.map((item, idx) => ({
                title: item.title,
                isCompleted: item.isCompleted,
                sortOrder: idx + 1,
              }))
            );
          }
          localStorage.removeItem(storageKey);
        }
      } catch (err) {
        console.error('Migration error', err);
      }
    }
  }, [isLoading, dbItems.length, taskId]);

  const items: ChecklistItemData[] = useMemo(() => {
    return dbItems.map((i) => ({
      id: i.id,
      title: i.title,
      isCompleted: i.isCompleted,
      createdAt: i.createdAt,
    }));
  }, [dbItems]);

  const handleAddItem = (titleToAdd?: string) => {
    const text = (titleToAdd || newTitle).trim();
    if (!text) return;

    createMutation.mutate({
      title: text,
      isCompleted: false,
    });

    if (!titleToAdd) {
      setNewTitle('');
    }
  };

  const handleToggle = useCallback(
    (id: string) => {
      const current = items.find((i) => i.id === id);
      if (!current) return;
      updateMutation.mutate({
        itemId: id,
        data: { isCompleted: !current.isCompleted },
      });
    },
    [items, updateMutation]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const handleUpdateTitle = useCallback(
    (id: string, newTitleStr: string) => {
      if (!newTitleStr.trim()) return;
      updateMutation.mutate({
        itemId: id,
        data: { title: newTitleStr.trim() },
      });
    },
    [updateMutation]
  );

  const handleApplyTemplate = (templateName: string) => {
    const templateItems = TEMPLATES[templateName] || [];
    if (templateItems.length === 0) return;

    const combined = [
      ...items.map((i, idx) => ({ title: i.title, isCompleted: i.isCompleted, sortOrder: idx + 1 })),
      ...templateItems.map((title, idx) => ({ title, isCompleted: false, sortOrder: items.length + idx + 1 })),
    ];

    batchMutation.mutate(combined);
    setTemplateAnchorEl(null);
  };

  const totalCount = items.length;
  const completedCount = useMemo(
    () => items.filter((i) => i.isCompleted).length,
    [items]
  );
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Box sx={{ mt: 1 }}>
      {/* Header & Progress */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckSquare size={18} color="#0284c7" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Tiêu Chí Nghiệm Thu / To-do ({completedCount}/{totalCount})
          </Typography>
          {isLoading && <CircularProgress size={14} sx={{ color: '#0284c7' }} />}
          {totalCount > 0 && completedCount === totalCount && (
            <Chip
              icon={<CheckCircle2 size={13} color="#10b981" style={{ marginLeft: 4 }} />}
              label="Đã nghiệm thu đủ"
              size="small"
              sx={{
                height: 22,
                fontSize: '0.72rem',
                fontWeight: 700,
                bgcolor: '#ecfdf5',
                color: '#059669',
                border: '1px solid #a7f3d0',
              }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Sparkles size={14} color="#0284c7" />}
            onClick={(e) => setTemplateAnchorEl(e.currentTarget)}
            sx={{
              textTransform: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              py: 0.25,
              px: 1,
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': { borderColor: '#0284c7', bgcolor: 'action.hover' },
            }}
          >
            Mẫu Nghiệm Thu
          </Button>
          <Menu
            anchorEl={templateAnchorEl}
            open={Boolean(templateAnchorEl)}
            onClose={() => setTemplateAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            {Object.keys(TEMPLATES).map((tplName) => (
              <MenuItem
                key={tplName}
                onClick={() => handleApplyTemplate(tplName)}
                sx={{ fontSize: '0.85rem', fontWeight: 600 }}
              >
                + Thêm mẫu: {tplName}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      {/* Progress Bar when items exist */}
      {totalCount > 0 && (
        <Box sx={{ mb: 1.75 }}>
          <ProgressBar value={progressPercent} height={6} showText={true} />
        </Box>
      )}

      {/* Items List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5 }}>
        {items.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onUpdateTitle={handleUpdateTitle}
          />
        ))}
      </Box>

      {/* Quick Add Input */}
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleAddItem();
        }}
        sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
      >
        <TextField
          size="small"
          placeholder="Thêm tiêu chí nghiệm thu / việc cần kiểm tra..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          fullWidth
          disabled={createMutation.isPending}
          sx={{
            bgcolor: 'background.paper',
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              fontSize: '0.875rem',
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          size="small"
          disabled={!newTitle.trim() || createMutation.isPending}
          startIcon={<Plus size={16} />}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.8rem',
            px: 1.75,
            py: 0.9,
            borderRadius: '8px',
            bgcolor: '#0284c7',
            whiteSpace: 'nowrap',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#0369a1', boxShadow: 'none' },
          }}
        >
          {createMutation.isPending ? 'Đang thêm...' : 'Thêm'}
        </Button>
      </Box>
    </Box>
  );
};
