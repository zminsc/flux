import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Tooltip,
  TextField,
  InputAdornment
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import UnsubscribeIcon from '@mui/icons-material/Unsubscribe';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import EmailModal from './EmailModal';
import InfoModal from './InfoModal';
import UnsubscribeModal from './UnsubscribeModal';

function Dashboard() {
  const [senderStats, setSenderStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSender, setSelectedSender] = useState(null);
  const [senderEmails, setSenderEmails] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [infoSender, setInfoSender] = useState(null);
  const [unsubscribeSender, setUnsubscribeSender] = useState(null);

  const filteredStats = senderStats.filter(stat => {
    const query = searchQuery.toLowerCase();
    return (
      stat.name.toLowerCase().includes(query) ||
      stat.email.toLowerCase().includes(query)
    );
  });

  const handleCardClick = async (sender) => {
    setSelectedSender(sender);
    setModalLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/emails/from/${encodeURIComponent(sender.email)}`,
        { credentials: 'include' }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch sender emails');
      }
      const data = await response.json();
      setSenderEmails(data);
    } catch (err) {
      console.error('Error fetching sender emails:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUnsubscribe = async (includeDelete) => {
    try {
      if (includeDelete) {
        await handleDeleteEmails(unsubscribeSender.email);
      }
      window.open(unsubscribeSender.unsubscribeUrl, '_blank');
    } catch (err) {
      console.error('Error during unsubscribe process:', err);
      alert('Failed to complete the unsubscribe process');
    }
  };

  const handleDeleteEmails = async (email) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/emails/delete/${encodeURIComponent(email)}`,
        { method: 'POST', credentials: 'include' }
      );
      if (!response.ok) {
        throw new Error('Failed to delete emails');
      }
      alert('Successfully deleted emails from sender');
    } catch (err) {
      console.error('Error deleting emails:', err);
      alert('Failed to delete emails');
    }
  };

  useEffect(() => {
    const fetchEmailStats = async () => {
      try {
        console.log('Fetching email stats from:', `${process.env.REACT_APP_BACKEND_URL}/api/emails/recent`);
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/emails/recent`,
          { credentials: 'include' }
        );
        console.log('Response status:', response.status);
        const responseData = await response.json();
        
        if (!response.ok) {
          console.error('Failed to fetch emails:', {
            status: response.status,
            statusText: response.statusText,
            data: responseData
          });
          throw new Error('Failed to fetch email statistics');
        }
        setSenderStats(responseData);
      } catch (err) {
        console.error('Dashboard error:', {
          message: err.message,
          stack: err.stack,
          type: err.name
        });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmailStats();
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );
  
  if (error) return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Alert severity="error">Error: {error}</Alert>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom sx={{ mb: 4 }}>
        Flux
      </Typography>
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            sx: {
              backgroundColor: 'white',
              '&:hover': {
                backgroundColor: 'white',
              },
              '&.Mui-focused': {
                backgroundColor: 'white',
              }
            }
          }}
          sx={{
            display: 'block',
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
      </Box>
      <TableContainer component={Paper} sx={{ 
        boxShadow: 2,
        borderRadius: 2,
        overflow: 'hidden'
      }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sender Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email Address</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Last Email</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email Count</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStats.map((stat, index) => (
              <TableRow
                key={index}
                hover
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
                onClick={() => handleCardClick(stat)}
              >
                <TableCell>
                  <Typography variant="body1" fontWeight="medium">
                    {stat.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {stat.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(stat.lastEmailDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <EmailIcon color="primary" />
                    <Typography variant="body1" color="primary" fontWeight="medium">
                      {stat.count}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {stat.unsubscribeUrl ? (
                    <>
                      <Tooltip title="Unsubscribe from sender">
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          fullWidth
                          startIcon={<UnsubscribeIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setUnsubscribeSender(stat);
                          }}
                          sx={{
                            justifyContent: 'flex-start',
                            minWidth: '140px',
                            mb: 1
                          }}
                        >
                          Unsubscribe
                        </Button>
                      </Tooltip>
                      <Tooltip title="Delete all emails">
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          fullWidth
                          startIcon={<DeleteIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEmails(stat.email);
                          }}
                          sx={{
                            justifyContent: 'flex-start',
                            minWidth: '140px'
                          }}
                        >
                          Delete All
                        </Button>
                      </Tooltip>
                    </>
                  ) : (
                    <Tooltip title="View unsubscribe information">
                      <Button
                        variant="outlined"
                        color="info"
                        size="small"
                        fullWidth
                        startIcon={<InfoIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setInfoSender(stat);
                        }}
                        sx={{
                          justifyContent: 'flex-start',
                          minWidth: '140px'
                        }}
                      >
                        Info
                      </Button>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredStats.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No results found for "{searchQuery}"
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedSender && (
        <EmailModal
          sender={selectedSender}
          loading={modalLoading}
          emails={senderEmails}
          onClose={() => {
            setSelectedSender(null);
            setSenderEmails([]);
          }}
        />
      )}

      {infoSender && (
        <InfoModal
          sender={infoSender}
          onClose={() => setInfoSender(null)}
        />
      )}

      {unsubscribeSender && (
        <UnsubscribeModal
          sender={unsubscribeSender}
          onClose={() => setUnsubscribeSender(null)}
          onConfirm={handleUnsubscribe}
        />
      )}
    </Container>
  );
}

export default Dashboard; 