import React, { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  TextField,
  List,
  ListItem,
  Avatar,
  CircularProgress,
  Paper,
  Dialog,
} from '@mui/material';
import {
  SendHorizontal,
  FileText,
  MessageSquare,
  Paperclip,
  Image as ImageIcon,
  Download,
  Maximize2,
  X,
  FileSpreadsheet,
  FileArchive,
  File,
} from 'lucide-react';
import { TaskComment } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDateTime } from '../../../utils/dateUtils';
import { getMediaUrl } from '../../../utils/fileUtils';
import { ImagePreviewModal } from '../../common/ImagePreviewModal';

interface TaskCommentsTabProps {
  comments: TaskComment[];
  loadingComments: boolean;
  canComment: boolean;
  onAddComment: (content: string, files?: File[]) => Promise<void>;
}

interface CommentFormData {
  content: string;
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const isImageAttachment = (filePath?: string, fileName?: string): boolean => {
  const target = (fileName || filePath || '').toLowerCase();
  return (
    target.endsWith('.jpg') ||
    target.endsWith('.jpeg') ||
    target.endsWith('.png') ||
    target.endsWith('.webp') ||
    target.endsWith('.gif') ||
    target.endsWith('.bmp') ||
    target.endsWith('.svg')
  );
};

const getFileIconComponent = (fileName?: string) => {
  const name = (fileName || '').toLowerCase();
  if (name.endsWith('.pdf')) {
    return <FileText size={18} color="#dc2626" />;
  }
  if (name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.csv')) {
    return <FileSpreadsheet size={18} color="#059669" />;
  }
  if (name.endsWith('.doc') || name.endsWith('.docx')) {
    return <FileText size={18} color="#0284c7" />;
  }
  if (name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.7z')) {
    return <FileArchive size={18} color="#d97706" />;
  }
  if (name.endsWith('.dwg') || name.endsWith('.dxf')) {
    return <FileText size={18} color="#7c3aed" />;
  }
  return <File size={18} color="#64748b" />;
};

export const TaskCommentsTab: React.FC<TaskCommentsTabProps> = ({
  comments,
  loadingComments,
  canComment,
  onAddComment,
}) => {
  const { user } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<{ url: string; fileName?: string } | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<CommentFormData>({
    defaultValues: {
      content: '',
    },
  });

  const contentValue = watch('content');
  const canSubmit = Boolean((contentValue && contentValue.trim().length > 0) || selectedFiles.length > 0);

  const handleFilesAdded = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: File[] = [];
    for (const f of fileArray) {
      if (f.size > 25 * 1024 * 1024) {
        alert(`Tệp "${f.name}" vượt quá dung lượng tối đa 25MB.`);
        continue;
      }
      validFiles.push(f);
    }
    setSelectedFiles((prev) => [...prev, ...validFiles].slice(0, 10));
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
      handleFilesAdded(e.clipboardData.files);
    }
  };

  const onSubmitComment = async (formData: CommentFormData) => {
    const text = (formData.content || '').trim();
    if (!text && selectedFiles.length === 0) return;
    await onAddComment(text, selectedFiles);
    reset({ content: '' });
    setSelectedFiles([]);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Comments List */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, pr: 0.5 }}>
        {loadingComments ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : comments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, color: '#94a3b8' }}>
            <MessageSquare size={36} strokeWidth={1.5} style={{ marginBottom: 8, opacity: 0.6 }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Chưa có trao đổi nào cho công việc này.
            </Typography>
            <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
              Hãy gửi ý kiến hoặc báo cáo hiện trường đầu tiên bên dưới.
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {comments.map((c) => {
              const isSelf = user && (c.userId === user.id || c.userName === user.fullName || c.userName === user.email);
              const imageAttachments = (c.attachments || []).filter((a) => isImageAttachment(a.filePath, a.fileName));
              const docAttachments = (c.attachments || []).filter((a) => !isImageAttachment(a.filePath, a.fileName));

              return (
                <ListItem
                  key={c.id}
                  sx={{
                    px: 0,
                    py: 0.25,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: isSelf ? 'flex-end' : 'flex-start',
                  }}
                >
                  {!isSelf && (
                    <Avatar
                      src={getMediaUrl(c.userAvatarUrl) || undefined}
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '0.8rem',
                        mr: 1.25,
                        mt: 0.5,
                        bgcolor: '#64748b',
                        color: '#ffffff',
                        fontWeight: 700,
                        flexShrink: 0,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      {c.userName.charAt(0)}
                    </Avatar>
                  )}

                  <Box
                    sx={{
                      maxWidth: '85%',
                      width: 'fit-content',
                      bgcolor: isSelf ? '#0284c7' : '#ffffff',
                      color: isSelf ? '#ffffff' : '#0f172a',
                      border: isSelf ? 'none' : '1px solid #e2e8f0',
                      p: 1.5,
                      borderRadius: isSelf ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      boxShadow: isSelf
                        ? '0 2px 8px rgba(2, 132, 199, 0.25)'
                        : '0 1px 4px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: isSelf ? '#ffffff' : '#0f172a',
                          fontSize: '0.78rem',
                        }}
                      >
                        {isSelf ? `${c.userName} (Bạn)` : c.userName}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: isSelf ? 'rgba(255, 255, 255, 0.8)' : '#94a3b8',
                          fontSize: '0.7rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatDateTime(c.createdAt)}
                      </Typography>
                    </Box>

                    {c.content && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: isSelf ? '#ffffff' : '#334155',
                          fontSize: '0.85rem',
                          lineHeight: 1.5,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {c.content}
                      </Typography>
                    )}

                    {/* Image Attachments */}
                    {imageAttachments.length > 0 && (
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1,
                          mt: c.content ? 1.25 : 0.5,
                        }}
                      >
                        {imageAttachments.map((img) => (
                          <Box
                            key={img.id}
                            onClick={() =>
                              setPreviewImage({
                                url: getMediaUrl(img.filePath) || '',
                                fileName: img.fileName,
                              })
                            }
                            sx={{
                              position: 'relative',
                              width: imageAttachments.length === 1 ? '100%' : 110,
                              maxWidth: 240,
                              height: imageAttachments.length === 1 ? 160 : 85,
                              borderRadius: '8px',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: isSelf ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid #cbd5e1',
                              '&:hover .img-overlay': { opacity: 1 },
                            }}
                          >
                            <img
                              src={getMediaUrl(img.filePath)}
                              alt={img.fileName}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                            <Box
                              className="img-overlay"
                              sx={{
                                position: 'absolute',
                                inset: 0,
                                bgcolor: 'rgba(0,0,0,0.3)',
                                opacity: 0,
                                transition: 'opacity 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                              }}
                            >
                              <Maximize2 size={18} />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* Document / File Attachments List */}
                    {docAttachments.length > 0 && (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.75,
                          mt: c.content || imageAttachments.length > 0 ? 1.25 : 0.5,
                        }}
                      >
                        {docAttachments.map((doc) => (
                          <Box
                            key={doc.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 1.5,
                              p: 1,
                              borderRadius: '6px',
                              bgcolor: isSelf ? 'rgba(255, 255, 255, 0.15)' : '#f8fafc',
                              border: isSelf ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid #e2e8f0',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                              {getFileIconComponent(doc.fileName)}
                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: '0.8rem',
                                    color: isSelf ? '#ffffff' : '#0f172a',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: 200,
                                  }}
                                  title={doc.fileName}
                                >
                                  {doc.fileName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: isSelf ? 'rgba(255, 255, 255, 0.75)' : '#64748b',
                                    fontSize: '0.7rem',
                                  }}
                                >
                                  {formatFileSize(doc.fileSize)}
                                </Typography>
                              </Box>
                            </Box>

                            <IconButton
                              component="a"
                              href={getMediaUrl(doc.filePath)}
                              download={doc.fileName}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="small"
                              sx={{
                                color: isSelf ? '#ffffff' : '#0284c7',
                                bgcolor: isSelf ? 'rgba(255, 255, 255, 0.2)' : '#e0f2fe',
                                '&:hover': {
                                  bgcolor: isSelf ? 'rgba(255, 255, 255, 0.3)' : '#bae6fd',
                                },
                                p: 0.75,
                              }}
                            >
                              <Download size={15} />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>

                  {isSelf && (
                    <Avatar
                      src={getMediaUrl(c.userAvatarUrl || user?.avatarUrl) || undefined}
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '0.8rem',
                        ml: 1.25,
                        mt: 0.5,
                        bgcolor: '#0369a1',
                        color: '#ffffff',
                        fontWeight: 700,
                        flexShrink: 0,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      {c.userName.charAt(0)}
                    </Avatar>
                  )}
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>

      {/* Add Comment Input */}
      {canComment ? (
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmitComment)}
          onPaste={handlePaste}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.25,
            p: 1.5,
            bgcolor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
          }}
        >
          <input
            type="file"
            ref={imageInputRef}
            onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
            accept="image/*, .jfif, .pjpeg, .pjp, .bmp, .png, .jpg, .jpeg, .webp"
            multiple
            style={{ display: 'none' }}
          />
          <input
            type="file"
            ref={docInputRef}
            onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.zip,.rar,.7z,.dwg,.dxf,.txt"
            multiple
            style={{ display: 'none' }}
          />

          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                multiline
                rows={2}
                fullWidth
                placeholder="Nhập nội dung trao đổi, hoặc chọn tệp/dán ảnh (Ctrl+V) để gửi..."
                disabled={isSubmitting}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    if (canSubmit) {
                      handleSubmit(onSubmitComment)();
                    }
                  }
                }}
                sx={{
                  bgcolor: '#ffffff',
                  '& .MuiOutlinedInput-root': {
                    p: 1.25,
                    borderRadius: '8px',
                  },
                }}
              />
            )}
          />

          {selectedFiles.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 1, bgcolor: '#ffffff', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              {selectedFiles.map((f, idx) => (
                <Chip
                  key={idx}
                  icon={isImageAttachment(undefined, f.name) ? <ImageIcon size={14} /> : <Paperclip size={14} />}
                  label={`${f.name} (${formatFileSize(f.size)})`}
                  onDelete={() => handleRemoveFile(idx)}
                  deleteIcon={<X size={14} />}
                  size="small"
                  sx={{
                    bgcolor: '#f1f5f9',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    maxWidth: 260,
                    '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
                  }}
                />
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ImageIcon size={15} color="#0284c7" />}
                onClick={() => imageInputRef.current?.click()}
                disabled={isSubmitting}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 1.25,
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  '&:hover': { borderColor: '#0284c7', bgcolor: '#f0f9ff' },
                }}
              >
                Thêm Ảnh
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Paperclip size={15} color="#059669" />}
                onClick={() => docInputRef.current?.click()}
                disabled={isSubmitting}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 1.25,
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  '&:hover': { borderColor: '#059669', bgcolor: '#ecfdf5' },
                }}
              >
                Đính Kèm Tệp
              </Button>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem', display: { xs: 'none', sm: 'block' } }}>
                (Hỗ trợ Ctrl+V dán ảnh)
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || !canSubmit}
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SendHorizontal size={16} />}
              sx={{
                bgcolor: canSubmit ? '#0284c7' : '#94a3b8',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.8rem',
                py: 0.75,
                px: 2,
                borderRadius: '8px',
                boxShadow: 'none',
                '&:hover': { bgcolor: canSubmit ? '#0369a1' : '#94a3b8', boxShadow: canSubmit ? '0 2px 6px rgba(2, 132, 199, 0.25)' : 'none' },
              }}
            >
              Gửi Trao Đổi
            </Button>
          </Box>
        </Box>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            textAlign: 'center',
            bgcolor: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '10px',
          }}
        >
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Bạn không có quyền gửi bình luận hoặc đính kèm tệp cho công việc này.
          </Typography>
        </Paper>
      )}

      {/* Image Lightbox Preview Modal with Zoom, Rotate, Download */}
      <ImagePreviewModal
        open={Boolean(previewImage)}
        imageUrl={previewImage?.url || null}
        fileName={previewImage?.fileName}
        onClose={() => setPreviewImage(null)}
      />
    </Box>
  );
};
