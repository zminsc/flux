require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Add error checking for required environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.BACKEND_URL) {
  throw new Error('Missing required Google OAuth credentials in environment variables');
}

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
      scope: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify'
      ],
      accessType: 'offline',
      prompt: 'consent'
    },
    (accessToken, refreshToken, profile, done) => {
      try {
        // Pass the full profile object to maintain the session
        profile.accessToken = accessToken;  // Add access token to profile
        return done(null, profile);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport; 