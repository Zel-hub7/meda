import { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Resend } from "resend";
import { storage } from "./storage";

function getResendClient(): Resend | null {
  if (process.env.RESEND_API_KEY) {
    return new Resend(process.env.RESEND_API_KEY);
  }
  return null;
}

function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || "Current <noreply@resend.dev>";
}

const SALT_ROUNDS = 12;
const VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const RESET_TOKEN_EXPIRY = 1 * 60 * 60 * 1000; // 1 hour

// Password validation
function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  return { valid: true };
}

// Generate secure random token
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Hash password
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Compare password
async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Send verification email
async function sendVerificationEmail(email: string, token: string, baseUrl: string) {
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;
  const client = getResendClient();
  const fromEmail = getFromEmail();
  
  console.log(`[Email] Attempting to send verification email to: ${email}`);
  console.log(`[Email] From address: ${fromEmail}`);
  console.log(`[Email] Resend API key present: ${!!process.env.RESEND_API_KEY}`);
  
  if (!client) {
    console.warn("[Email] Resend client not configured, skipping verification email");
    console.log(`[Email] Verification URL for ${email}: ${verifyUrl}`);
    return;
  }
  
  try {
    console.log(`[Email] Verification URL (for testing): ${verifyUrl}`);
    const result = await client.emails.send({
      from: fromEmail,
      to: email,
      subject: "Verify your email - Current",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #111; font-size: 24px; margin-bottom: 20px;">Welcome to <em>Current</em></h1>
          <p style="color: #444; font-size: 16px; line-height: 1.6;">
            Thanks for signing up! Please verify your email address by clicking the button below.
          </p>
          <div style="margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #111; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link: <a href="${verifyUrl}" style="color: #111;">${verifyUrl}</a>
          </p>
          <p style="color: #888; font-size: 12px; margin-top: 30px;">
            This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      `,
    });
    console.log(`[Email] Verification email sent successfully to ${email}`, result);
  } catch (error: any) {
    console.error("[Email] Failed to send verification email:", error);
    console.error("[Email] Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}

// Send password reset email
async function sendPasswordResetEmail(email: string, token: string, baseUrl: string) {
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  const client = getResendClient();
  
  if (!client) {
    console.warn("Email client not configured, skipping password reset email");
    console.log(`Reset URL for ${email}: ${resetUrl}`);
    return;
  }
  
  try {
    await client.emails.send({
      from: getFromEmail(),
      to: email,
      subject: "Reset your password - Current",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #111; font-size: 24px; margin-bottom: 20px;">Reset your password</h1>
          <p style="color: #444; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to choose a new password.
          </p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #111; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link: <a href="${resetUrl}" style="color: #111;">${resetUrl}</a>
          </p>
          <p style="color: #888; font-size: 12px; margin-top: 30px;">
            This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
      `,
    });
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
}

export function setupLocalAuth(app: Express) {
  // Signup endpoint
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ error: passwordValidation.message });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "An account with this email already exists" });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Generate verification token
      const verificationToken = generateToken();
      const verificationExpires = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY);

      // Create user
      const user = await storage.createEmailUser({
        email: email.toLowerCase(),
        firstName,
        lastName,
        passwordHash,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      });

      // Create team for user with 14-day trial
      const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      const slug = `${firstName.toLowerCase()}-${Date.now()}`;
      
      const team = await storage.createTeam({
        name: `${firstName}'s Team`,
        slug,
        ownerId: user.id,
        subscriptionStatus: "trialing",
        subscriptionPlan: "starter",
        trialEndsAt,
        suggestionsLimit: 20,
        sourcesLimit: 1,
        seatsLimit: 5,
      });

      // Add user as team member (owner)
      await storage.addTeamMember({
        teamId: team.id,
        userId: user.id,
        role: "owner",
        canApprove: true,
      });

      // Send verification email
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      await sendVerificationEmail(email, verificationToken, baseUrl);

      res.status(201).json({
        message: "Account created. Please check your email to verify your account.",
        userId: user.id,
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create account. Please try again." });
    }
  });

  // Email verification endpoint
  app.get("/api/auth/verify-email", async (req: Request, res: Response) => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        return res.status(400).json({ error: "Verification token is required" });
      }

      const user = await storage.getUserByVerificationToken(token);
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired verification token" });
      }

      if (user.emailVerificationExpires && new Date(user.emailVerificationExpires) < new Date()) {
        return res.status(400).json({ error: "Verification token has expired" });
      }

      // Mark email as verified
      await storage.verifyUserEmail(user.id);

      res.json({ message: "Email verified successfully. You can now log in." });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ error: "Failed to verify email. Please try again." });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email.toLowerCase());
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Check if user uses email auth
      if (user.authProvider !== "email") {
        return res.status(400).json({ 
          error: "This account uses Replit login. Please sign in with Replit." 
        });
      }

      // Check password
      if (!user.passwordHash) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isValidPassword = await comparePassword(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Check if email is verified
      if (!user.emailVerified) {
        return res.status(403).json({ 
          error: "Please verify your email before logging in. Check your inbox for the verification link.",
          needsVerification: true
        });
      }

      // Get user's team
      const team = await storage.getTeamByOwner(user.id);

      // Create session
      (req.session as any).userId = user.id;
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      };
      if (team) {
        (req.session as any).teamId = team.id;
      }

      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Failed to create session" });
        }

        res.json({
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl,
          },
          teamId: team?.id,
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to log in. Please try again." });
    }
  });

  // Forgot password endpoint
  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await storage.getUserByEmail(email.toLowerCase());
      
      // Always return success to prevent email enumeration
      if (!user || user.authProvider !== "email") {
        return res.json({ message: "If an account exists with this email, you will receive a password reset link." });
      }

      // Generate reset token
      const resetToken = generateToken();
      const resetExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY);

      // Save token to user
      await storage.setPasswordResetToken(user.id, resetToken, resetExpires);

      // Send reset email
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      await sendPasswordResetEmail(email, resetToken, baseUrl);

      res.json({ message: "If an account exists with this email, you will receive a password reset link." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process request. Please try again." });
    }
  });

  // Reset password endpoint
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ error: "Token and new password are required" });
      }

      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ error: passwordValidation.message });
      }

      // Find user by reset token
      const user = await storage.getUserByResetToken(token);
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      if (user.passwordResetExpires && new Date(user.passwordResetExpires) < new Date()) {
        return res.status(400).json({ error: "Reset token has expired" });
      }

      // Hash new password and update user
      const passwordHash = await hashPassword(password);
      await storage.updatePassword(user.id, passwordHash);

      res.json({ message: "Password reset successfully. You can now log in with your new password." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password. Please try again." });
    }
  });

  // Resend verification email endpoint
  app.post("/api/auth/resend-verification", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await storage.getUserByEmail(email.toLowerCase());
      
      if (!user || user.authProvider !== "email") {
        return res.json({ message: "If an account exists with this email, a verification link will be sent." });
      }

      if (user.emailVerified) {
        return res.json({ message: "Email is already verified. You can log in." });
      }

      // Generate new verification token
      const verificationToken = generateToken();
      const verificationExpires = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY);

      await storage.setVerificationToken(user.id, verificationToken, verificationExpires);

      // Send verification email
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      await sendVerificationEmail(email, verificationToken, baseUrl);

      res.json({ message: "If an account exists with this email, a verification link will be sent." });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ error: "Failed to send verification email. Please try again." });
    }
  });

  console.log("Local authentication routes initialized");
}
