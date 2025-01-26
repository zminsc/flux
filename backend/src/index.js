const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport');

const authRoutes = require('./routes/auth');
const emailRoutes = require('./routes/emails');

const app = express();
const port = process.env.PORT || 3001;

// Trust proxy is required for secure cookies behind Render's proxy
app.set('trust proxy', 1);

console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  FRONTEND_URL: process.env.FRONTEND_URL,
  BACKEND_URL: process.env.BACKEND_URL
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev')); // Logging middleware

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true,  // trust the reverse proxy
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'  // Required for cross-site cookies in production
  },
  store: {
    get: function(sid, callback) {
      console.log('Session get:', sid);
      callback();
    },
    set: function(sid, session, callback) {
      console.log('Session set:', {
        sid,
        session: {
          ...session,
          cookie: session.cookie.toJSON()
        }
      });
      callback();
    },
    destroy: function(sid, callback) {
      console.log('Session destroy:', sid);
      callback();
    }
  }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 