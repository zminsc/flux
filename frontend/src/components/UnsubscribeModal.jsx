import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Switch,
  Typography,
  Box
} from '@mui/material';

function UnsubscribeModal({ 
  sender, 
  onClose, 
  onConfirm 
}) {
  const [includeDelete, setIncludeDelete] = useState(false);

  const handleConfirm = () => {
    onConfirm(includeDelete);
    onClose();
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Unsubscribe from {sender.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography>
            Are you sure you want to unsubscribe from emails from {sender.email}?
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={includeDelete}
              onChange={(e) => setIncludeDelete(e.target.checked)}
            />
          }
          label="Also delete all existing emails from this sender"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UnsubscribeModal; 