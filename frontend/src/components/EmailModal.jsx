import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function EmailModal({ sender, emails, loading, onClose }) {
  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '80vh'
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
          Emails from {sender.name}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : emails.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No emails found from this sender.
          </Typography>
        ) : (
          <List>
            {emails.map((email, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={email.subject}
                    secondary={email.date}
                    primaryTypographyProps={{
                      fontWeight: 500
                    }}
                  />
                </ListItem>
                {index < emails.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default EmailModal; 