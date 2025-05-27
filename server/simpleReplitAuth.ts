import passport from 'passport';
import session from 'express-session';
import type { Express, RequestHandler } from 'express';
import connectPgSimple from 'connect-pg-simple';
import { storage } from './storage';
import * as crypto from 'crypto';

// For development purposes - in production we would use REPLIT_DOMAINS 
// to determine the callback URL
const DOMAIN = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// Simplified auth mechanism for development
export function setupAuth(app: Express) {
  // Configure session
  const pgSession = connectPgSimple(session);
  app.use(
    session({
      store: new pgSession({
        conObject: {
          connectionString: process.env.DATABASE_URL,
          ssl: false
        },
        createTableIfMissing: true,
        tableName: 'sessions',
      }),
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 45 * 60 * 1000, // 45 minutes (as per recommendation of 30-60 minutes)
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: 'lax',
      },
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport serialization/deserialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || undefined);
    } catch (err) {
      done(err, undefined);
    }
  });

  // Login route - for development, we'll handle with a mock login
  app.get('/api/login', (req, res) => {
    // Create a dummy user if not already in session
    const user = {
      id: "123456789",
      email: "hr-admin@groearlylearning.com",
      firstName: "HR",
      lastName: "Admin",
      profileImageUrl: "https://ui-avatars.com/api/?name=HR+Admin&background=0052CC&color=fff",
      role: "hr_admin"
    };

    // Store in database first
    storage.upsertUser(user).then(storedUser => {
      // Log the user in
      req.login(storedUser, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ error: "Login failed" });
        }
        
        // Create audit log
        storage.createAuditLog({
          userId: storedUser.id,
          action: "login",
          details: "User authenticated via development auth",
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        }).catch(err => console.error("Audit log error:", err));
        
        return res.redirect('/');
      });
    }).catch(err => {
      console.error("User storage error:", err);
      return res.status(500).json({ error: "User storage failed" });
    });
  });

  // Callback route
  app.get('/api/callback', (req, res) => {
    res.redirect('/');
  });

  // Logout route
  app.get('/api/logout', (req, res) => {
    req.logout(() => {
      res.redirect('/');
    });
  });

  return app;
}

// Middleware to check if user is authenticated
// TEMPORARILY DISABLED FOR DEVELOPMENT
export const isAuthenticated: RequestHandler = (req, res, next) => {
  // Automatically add mock user data for development
  if (!req.user) {
    req.user = {
      id: "123456789",
      email: "hr-admin@groearlylearning.com",
      firstName: "HR",
      lastName: "Admin",
      profileImageUrl: "https://ui-avatars.com/api/?name=HR+Admin&background=0052CC&color=fff",
      role: "hr_admin"
    };
  }
  return next();
};

// Get current user from request
export function getUser(req: any) {
  // Return mock user if no user in session
  if (!req.user) {
    return {
      id: "123456789",
      email: "hr-admin@groearlylearning.com",
      firstName: "HR",
      lastName: "Admin",
      profileImageUrl: "https://ui-avatars.com/api/?name=HR+Admin&background=0052CC&color=fff",
      role: "hr_admin"
    };
  }
  return req.user;
}