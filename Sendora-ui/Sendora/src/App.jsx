import React, { useState } from 'react';
import './App.css'; // Import the main CSS file
import {
  Container,
  TextField,
  Typography,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  CircularProgress,
  Paper,
  Fade,
  Zoom,
  Chip
} from '@mui/material';
import {
  Email as EmailIcon,
  Send as SendIcon,
  ContentCopy as CopyIcon,
  AutoAwesome as SparkleIcon
} from '@mui/icons-material';
import axios from 'axios';

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setGeneratedReply(''); // Clear previous reply on new submission
    try {
      // For Canvas environment, LLM calls are handled slightly differently
      // The user provided an axios call to a local backend, which is valid for an external server.
      // If the intent was to use LLM directly in the client, the fetch method would be used.
      // Assuming the user's intent is to call their local backend.
      const response = await axios.post("http://localhost:8080/api/email/generate", {
        emailContent,
        tone
      });
      // Handle response, assuming response.data contains the generated text
      setGeneratedReply(typeof response.data === 'string' ? response.data : JSON.stringify(response.data));
    } catch (error) {
      setError('Failed to generate email reply. Please try again');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    // This uses the modern Clipboard API, which is preferred over document.execCommand
    navigator.clipboard.writeText(generatedReply)
      .then(() => {
        setCopied(true);
        // Reset "Copied!" message after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        setError('Failed to copy text to clipboard.');
      });
  };

  return (
    <Box className="app-background">
      <Container maxWidth="lg" sx={{ py: 6, minHeight: '100vh' }}>
        {/* Header Section */}
        <Fade in timeout={800}>
          <Box className="header-section">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <SparkleIcon className="sparkle-icon" />
              <Typography className="main-title">
                Sendora
              </Typography>
            </Box>
            <Typography className="subtitle">
              AI-powered email reply generator that crafts perfect responses in seconds
            </Typography>
          </Box>
        </Fade>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 4,
          mt: 6
        }}>
          {/* Input Section */}
          <Zoom in timeout={1000}>
            <Paper className="glass-card input-card">
              <Box className="card-header">
                <EmailIcon className="section-icon" />
                <Typography variant="h5" className="section-title">
                  Original Email
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  variant="outlined"
                  label="Paste your email content here..."
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  className="custom-textfield"
                />

                <FormControl fullWidth className="custom-select">
                  <InputLabel>Response Tone (Optional)</InputLabel>
                  <Select
                    value={tone}
                    label="Response Tone (Optional)"
                    onChange={(e) => setTone(e.target.value)}
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="professional">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        🎯 Professional
                      </Box>
                    </MenuItem>
                    <MenuItem value="casual">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        😊 Casual
                      </Box>
                    </MenuItem>
                    <MenuItem value="friendly">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        🤝 Friendly
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!emailContent || loading}
                  fullWidth
                  size="large"
                  className="generate-button"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                >
                  {loading ? 'Generating...' : 'Generate Reply'}
                </Button>

                {error && (
                  <Fade in>
                    <Paper className="error-message">
                      <Typography color="error">
                        {error}
                      </Typography>
                    </Paper>
                  </Fade>
                )}
              </Box>
            </Paper>
          </Zoom>

          {/* Output Section */}
          {generatedReply && (
            <Zoom in timeout={1200}>
              <Paper className="glass-card output-card">
                <Box className="card-header">
                  <SparkleIcon sx={{ fontSize: 28, color: '#764ba2', mr: 2 }} />
                  <Typography variant="h5" className="section-title">
                    Generated Reply
                  </Typography>
                  {tone && (
                    <Chip
                      label={`${tone} tone`}
                      size="small"
                      className="tone-chip"
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    variant="outlined"
                    value={generatedReply}
                    InputProps={{ readOnly: true }}
                    className="output-textfield"
                  />

                  <Button
                    variant="outlined"
                    onClick={handleCopy}
                    fullWidth
                    size="large"
                    className="copy-button"
                    startIcon={<CopyIcon />}
                  >
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                  </Button>
                </Box>
              </Paper>
            </Zoom>
          )}
        </Box>

        {/* Footer */}
        <Fade in timeout={1500}>
          <Box className="footer-section">
            <Typography variant="body2" className="footer-text">
              Powered by AI • Crafted with precision • Built for productivity
            </Typography>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default App;
