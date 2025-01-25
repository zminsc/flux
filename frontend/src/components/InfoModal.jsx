import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function InfoModal({ sender, onClose }) {
  const [loading, setLoading] = useState(true);
  const [instructions, setInstructions] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstructions = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/emails/analyze/${encodeURIComponent(sender.email)}`,
          { credentials: 'include' }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch unsubscribe instructions');
        }
        const data = await response.json();
        setInstructions(data.instructions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructions();
  }, [sender.email]);

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Typography variant="h6">
          Unsubscribe Information
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Typography color="error">
            {error}
          </Typography>
        ) : (
          <Typography>
            {instructions || 'No methods for unsubscribing found'}
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default InfoModal; 