const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { cleanHtml, analyzeEmailForUnsubscribe } = require('../utils/emailAnalyzer');

// Cache for unsubscribe instructions
const instructionsCache = new Map();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  console.log('Auth Check:', {
    cookies: req.cookies,
    session: req.session,
    isAuthenticated: req.isAuthenticated(),
    user: req.user,
    headers: {
      origin: req.headers.origin,
      cookie: req.headers.cookie,
      'user-agent': req.headers['user-agent'],
      referer: req.headers.referer
    }
  });

  // Check if session exists
  if (!req.session) {
    console.error('No session found in request');
    return res.status(401).json({ error: 'No session found' });
  }

  // Check if passport session exists
  if (!req.session.passport) {
    console.error('No passport session found:', {
      sessionContent: req.session,
      cookies: req.cookies
    });
    return res.status(401).json({ error: 'No passport session found' });
  }

  if (req.isAuthenticated()) {
    console.log('User authenticated:', {
      userId: req.user.id,
      email: req.user.emails[0].value
    });
    return next();
  }

  console.error('Authentication failed:', {
    session: req.session,
    passport: req.session.passport,
    cookies: req.cookies
  });
  res.status(401).json({ error: 'Not authenticated' });
};

// Get email statistics by sender
router.get('/recent', isAuthenticated, async (req, res) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: req.user.accessToken  // Now getting from the profile object
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Calculate date 7 days ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const afterDate = Math.floor(oneWeekAgo.getTime() / 1000); // Convert to Unix timestamp

    // Get last 10 emails
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 500,  // Increase max results
      q: `after:${afterDate}`  // Get emails after specified date
    });

    if (!response.data.messages) {
      return res.json([]);
    }

    const emails = await Promise.all(
      response.data.messages.map(async (message) => {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full',
          metadataHeaders: ['from', 'list-unsubscribe', 'date']
        });

        const from = email.data.payload.headers.find(
          header => header.name === 'From'
        );
        const date = email.data.payload.headers.find(
          header => header.name === 'Date'
        );

        // Try to find unsubscribe link from header or body
        const unsubscribeHeader = email.data.payload.headers.find(
          header => header.name.toLowerCase() === 'list-unsubscribe'
        );
        
        let unsubscribeUrl = null;

        if (unsubscribeHeader) {
          const matches = unsubscribeHeader.value.match(/<(https?:\/\/[^>]+)>/);
          if (matches) {
            unsubscribeUrl = matches[1];
          }
        } else if (email.data.payload.parts) {
          // Search for unsubscribe link in email body
          const htmlPart = email.data.payload.parts.find(part => 
            part.mimeType === 'text/html'
          );
          if (htmlPart) {
            const content = Buffer.from(htmlPart.body.data, 'base64').toString();
            const unsubscribeMatch = content.match(
              /href="([^"]*unsubscribe[^"]*)"/i
            );
            if (unsubscribeMatch) {
              unsubscribeUrl = unsubscribeMatch[1];
            }
          }
        }

        // Extract name and email from "Name <email@domain.com>" or "email@domain.com" format
        let senderName, senderEmail;
        if (from) {
          // Try to match "Name <email@domain.com>" format
          const matches = from.value.match(/^(.*?)\s*<(.+?)>$/);
          if (matches) {
            // Found both name and email
            senderName = matches[1].trim();
            senderEmail = matches[2].trim();
          } else {
            // No match, assume the whole value is an email address
            senderEmail = from.value.trim();
            // Try to extract a name from the email prefix
            senderName = senderEmail.split('@')[0].replace(/[.+]/g, ' ');
            // Capitalize first letter of each word
            senderName = senderName
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          }
        } else {
          senderName = 'Unknown Sender';
          senderEmail = 'unknown';
        }

        return {
          name: senderName || 'Unknown Sender',
          email: senderEmail,
          unsubscribeUrl,
          date: date ? new Date(date.value) : new Date(0)
        };
      })
    );

    // Group emails by sender and count them
    const senderStats = emails.reduce((acc, email) => {
      const key = email.email;
      if (!acc[key]) {
        acc[key] = {
          name: email.name,
          email: email.email,
          unsubscribeUrl: null,
          lastEmailDate: email.date,
          count: 0
        };
      }
      if (!acc[key].unsubscribeUrl && email.unsubscribeUrl) {
        acc[key].unsubscribeUrl = email.unsubscribeUrl;
      }
      if (email.date > acc[key].lastEmailDate) {
        acc[key].lastEmailDate = email.date;
      }
      acc[key].count += 1;
      return acc;
    }, {});

    // Convert to array format for frontend
    const stats = Object.values(senderStats);

    // Sort by most recent email date
    stats.sort((a, b) => b.lastEmailDate - a.lastEmailDate);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// Get emails from specific sender
router.get('/from/:email', isAuthenticated, async (req, res) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: req.user.accessToken  // Now getting from the profile object
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Calculate date 7 days ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const afterDate = Math.floor(oneWeekAgo.getTime() / 1000);

    // Get all recent emails and filter by sender
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 500,
      q: `from:${req.params.email} after:${afterDate}`
    });

    if (!response.data.messages) {
      return res.json([]);
    }

    const emails = await Promise.all(
      response.data.messages.map(async (message) => {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'metadata',
          metadataHeaders: ['subject', 'from', 'date']
        });

        const subject = email.data.payload.headers.find(
          header => header.name === 'Subject'
        );
        const date = email.data.payload.headers.find(
          header => header.name === 'Date'
        );

        return {
          id: message.id,
          subject: subject ? subject.value : 'No Subject',
          date: date ? new Date(date.value).toLocaleDateString() : 'Unknown Date'
        };
      })
    );

    // Sort emails by date (most recent first)
    const sortedEmails = emails.sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    res.json(sortedEmails);
  } catch (error) {
    console.error('Error fetching sender emails:', error);
    res.status(500).json({ error: 'Failed to fetch sender emails' });
  }
});

// Get unsubscribe instructions for a specific sender
router.get('/analyze/:email', isAuthenticated, async (req, res) => {
  try {
    console.log('Starting analysis for email:', req.params.email);
    
    // Check cache first
    if (instructionsCache.has(req.params.email)) {
      console.log('Cache hit for', req.params.email);
      return res.json({ instructions: instructionsCache.get(req.params.email) });
    }
    console.log('Cache miss, proceeding with analysis');

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: req.user.accessToken  // Now getting from the profile object
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Get recent emails from this sender
    console.log('Fetching recent emails from sender...');
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 5,
      q: `from:${req.params.email}`
    });

    if (!response.data.messages) {
      console.log('No messages found for sender');
      return res.json({ instructions: 'No emails found to analyze' });
    }
    console.log(`Found ${response.data.messages.length} messages`);

    // Analyze the most recent email
    console.log('Fetching full content of most recent email...');
    const email = await gmail.users.messages.get({
      userId: 'me',
      id: response.data.messages[0].id,
      format: 'full'
    });

    let instructions = 'No methods for unsubscribing found';

    if (email.data.payload.parts) {
      console.log('Email has parts, looking for HTML content...');
      const htmlPart = email.data.payload.parts.find(part => 
        part.mimeType === 'text/html'
      );
      if (htmlPart) {
        console.log('Found HTML content, cleaning and analyzing...');
        const content = Buffer.from(htmlPart.body.data, 'base64').toString();
        console.log('Content length before cleaning:', content.length);
        const cleanedContent = cleanHtml(content);
        console.log('Content length after cleaning:', cleanedContent.length);
        instructions = await analyzeEmailForUnsubscribe(cleanedContent);
        console.log('Analysis complete, instructions:', instructions);
      } else {
        console.log('No HTML content found in email');
      }
    } else {
      console.log('Email has no parts structure');
    }

    // Cache the result
    console.log('Caching result for future use');
    instructionsCache.set(req.params.email, instructions);

    res.json({ instructions });
  } catch (error) {
    console.error('Error analyzing email:', error);
    console.error('Full error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    res.status(500).json({ error: 'Failed to analyze email' });
  }
});

module.exports = router; 