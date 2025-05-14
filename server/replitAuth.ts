import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true, // Create table if it doesn't exist
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    name: "ats_session", // Custom cookie name
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      sameSite: 'lax',
      maxAge: sessionTtl,
      path: '/',
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
    role: "hr_admin", // Default role for all Replit Auth users
  });
}

export async function setupAuth(app: Express) {
  console.log("Setting up Auth with REPL_ID:", process.env.REPL_ID);
  console.log("REPLIT_DOMAINS:", process.env.REPLIT_DOMAINS); 
  
  // Trust all proxies in the Replit environment
  app.set("trust proxy", true);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  try {
    const config = await getOidcConfig();
    console.log("Successfully retrieved OIDC config");
    
    const verify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback
    ) => {
      console.log("In verify function with tokens:", !!tokens);
      const user = {};
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      verified(null, user);
    };

    // Create a strategy for each domain in REPLIT_DOMAINS
    const domains = process.env.REPLIT_DOMAINS!.split(",");
    
    for (const domain of domains) {
      const strategyName = `replitauth:${domain}`;
      const callbackURL = `https://${domain}/api/callback`;
      
      console.log(`Creating auth strategy for domain: ${domain}`);
      console.log(`Using absolute callback URL: ${callbackURL}`);
      
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL,
        },
        verify,
      );
      
      passport.use(strategy);
      console.log(`Auth strategy created with name: ${strategyName}`);
    }
  } catch (error) {
    console.error("Error setting up auth:", error);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    console.log("Login attempt with hostname:", req.hostname, "protocol:", req.protocol);
    try {
      // Use the domain-specific strategy
      const strategyName = `replitauth:${req.hostname}`;
      console.log("Using strategy:", strategyName);
      
      passport.authenticate(strategyName, {
        prompt: "login consent",
      })(req, res, next);
    } catch (error) {
      console.error("Error during login authentication:", error);
      res.redirect(`/login?error=${encodeURIComponent("Login failed")}`);
    }
  });

  app.get("/api/callback", (req, res, next) => {
    console.log("Callback received with hostname:", req.hostname, "protocol:", req.protocol);
    console.log("Query params:", req.query);
    
    if (req.query.error) {
      console.error("Auth error from provider:", req.query.error, req.query.error_description);
      return res.redirect(`/login?error=${encodeURIComponent(req.query.error_description || "Authentication error")}`);
    }

    try {
      const strategyName = `replitauth:${req.hostname}`;
      console.log("Using strategy for callback:", strategyName);
      
      passport.authenticate(strategyName, {
        successRedirect: "/", 
        failureRedirect: "/login?error=Authentication+failed",
      })(req, res, next);
    } catch (error) {
      console.error("Error during callback:", error);
      res.redirect(`/login?error=${encodeURIComponent("Authentication failed")}`);
    }
  });
  
  // Simple error page for login failures
  app.get("/login-failed", (req, res) => {
    console.log("Login failed route accessed");
    res.send(`
      <html>
        <head><title>Login Failed</title></head>
        <body>
          <h1>Authentication Failed</h1>
          <p>Sorry, there was a problem with authentication. Please try again.</p>
          <a href="/api/login">Try Again</a>
        </body>
      </html>
    `);
  });

  app.get("/api/logout", async (req, res) => {
    try {
      console.log("Logout requested by user");
      const config = await getOidcConfig();
      req.logout(() => {
        try {
          const logoutUrl = client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href;
          
          console.log("Redirecting to logout URL:", logoutUrl);
          res.redirect(logoutUrl);
        } catch (error) {
          console.error("Error building end session URL:", error);
          // Fallback to simple redirect
          res.redirect('/');
        }
      });
    } catch (error) {
      console.error("Error in logout route:", error);
      res.redirect('/');
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  console.log("isAuthenticated check, user:", !!req.user);
  
  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.expires_at) {
    console.log("User not authenticated or no expires_at");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    console.log("Token still valid, proceeding");
    return next();
  }

  console.log("Token expired, attempting refresh");
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    console.log("No refresh token, redirecting to login");
    return res.redirect("/api/login");
  }

  try {
    const config = await getOidcConfig();
    console.log("Got OIDC config for refresh");
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    console.log("Token refreshed successfully");
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    console.error("Token refresh failed:", error);
    return res.redirect("/api/login");
  }
};