const express = require('express');
const passport = require('passport');
const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    // TODO: Implement email login logic
    res.status(501).json({ message: 'Login functionality not implemented yet' });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Initiate Google OAuth login
router.get('/google',
  passport.authenticate('google', { 
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ],
    accessType: 'offline',
    prompt: 'consent'
  })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login-failed`,
    session: true
  }),
  (req, res) => {
    console.log('OAuth callback successful:', {
      user: req.user,
      session: req.session,
      cookies: req.cookies
    });
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

// Check authentication status
router.get('/status', (req, res) => {
  console.log('Auth status check:', {
    isAuthenticated: req.isAuthenticated(),
    session: req.session,
    user: req.user,
    cookies: req.cookies
  });

  if (req.isAuthenticated()) {
    res.json({ 
      isAuthenticated: true, 
      user: req.user 
    });
  } else {
    console.log('User not authenticated');
    res.json({ 
      isAuthenticated: false 
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error logging out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router; 