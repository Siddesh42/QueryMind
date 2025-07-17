'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, CircularProgress, Alert, Snackbar } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
}

export function FileUpload({ onUpload }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    try {
      setIsUploading(true);
      setError(null);
      await onUpload(acceptedFiles[0]);
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  return (
    <>
      <Box
        {...getRootProps()}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 1,
          bgcolor: isDragActive ? 'primary.50' : 'background.paper',
          textAlign: 'center',
          cursor: isUploading ? 'wait' : 'pointer',
          opacity: isUploading ? 0.7 : 1,
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'primary.50'
          }
        }}
      >
        <input {...getInputProps()} />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          {isUploading ? (
            <CircularProgress size={48} />
          ) : isDragActive ? (
            <InsertDriveFileIcon sx={{ fontSize: 48, color: 'primary.main' }} />
          ) : (
            <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
          )}
          <Typography color="text.secondary">
            {isUploading 
              ? "Processing file..."
              : isDragActive
                ? "Drop the file here"
                : "Drag and drop a document, or click to select"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Supports PDF and TXT files
          </Typography>
        </Box>
      </Box>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
} 