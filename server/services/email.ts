import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export interface EmailConnectionStatus {
  connected: boolean;
  error?: string;
}

export async function testEmailConnection(): Promise<EmailConnectionStatus> {
  if (!process.env.RESEND_API_KEY) {
    return {
      connected: false,
      error: "RESEND_API_KEY not configured. Add it in Settings > Secrets.",
    };
  }

  try {
    const client = getResendClient();
    if (!client) {
      return { connected: false, error: "Failed to initialize email client" };
    }
    return { connected: true };
  } catch (error: any) {
    return { connected: false, error: error.message || "Failed to connect to email service" };
  }
}

function getFromEmail(): string {
  if (process.env.RESEND_FROM_EMAIL) {
    return process.env.RESEND_FROM_EMAIL;
  }
  console.warn("RESEND_FROM_EMAIL not configured - using default sender. For production, set RESEND_FROM_EMAIL in Secrets.");
  return "Current <noreply@resend.dev>";
}

function getBaseUrl(): string {
  const domains = process.env.REPLIT_DOMAINS?.split(",");
  if (domains && domains.length > 0) {
    return `https://${domains[0]}`;
  }
  return process.env.BASE_URL || "http://localhost:5000";
}

export async function sendTeamInvitation(params: {
  email: string;
  teamName: string;
  inviterName: string;
  token: string;
}): Promise<boolean> {
  const client = getResendClient();
  if (!client) {
    console.warn("Email client not available, skipping invitation email");
    return false;
  }

  const baseUrl = getBaseUrl();
  const inviteUrl = `${baseUrl}/invite/${params.token}`;

  try {
    await client.emails.send({
      from: getFromEmail(),
      to: params.email,
      subject: `You've been invited to join ${params.teamName} on Current`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Current</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">AI-Powered Knowledge Base</p>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="margin-top: 0; color: #333;">You're Invited!</h2>
              <p><strong>${params.inviterName}</strong> has invited you to join <strong>${params.teamName}</strong> on Current.</p>
              <p>Current helps your team automatically keep your Notion knowledge base up-to-date by detecting important information from Slack, Google Drive, and meetings.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Accept Invitation</a>
              </div>
              <p style="color: #666; font-size: 14px;">This invitation will expire in 7 days.</p>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
              <p style="color: #999; font-size: 12px; margin-bottom: 0;">If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`Invitation email sent to ${params.email}`);
    return true;
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    return false;
  }
}

export async function sendSuggestionNotification(params: {
  email: string;
  userName: string;
  suggestions: Array<{
    title: string;
    confidence: number;
    source: string;
  }>;
}): Promise<boolean> {
  const client = getResendClient();
  if (!client) {
    console.warn("Email client not available, skipping notification email");
    return false;
  }

  const baseUrl = getBaseUrl();

  try {
    const suggestionsList = params.suggestions
      .map(s => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
            <strong style="color: #333;">${s.title}</strong>
            <br><span style="color: #666; font-size: 13px;">From: ${s.source}</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">
            <span style="background: ${s.confidence >= 80 ? '#dcfce7' : '#fef3c7'}; color: ${s.confidence >= 80 ? '#166534' : '#92400e'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${s.confidence}%</span>
          </td>
        </tr>
      `)
      .join("");

    await client.emails.send({
      from: getFromEmail(),
      to: params.email,
      subject: `${params.suggestions.length} new knowledge suggestions awaiting your review`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Current</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="margin-top: 0; color: #333;">Hi ${params.userName},</h2>
              <p>You have <strong>${params.suggestions.length} new knowledge suggestion${params.suggestions.length > 1 ? 's' : ''}</strong> waiting for your review:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                ${suggestionsList}
              </table>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Review Suggestions</a>
              </div>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
              <p style="color: #999; font-size: 12px; margin-bottom: 0;">You're receiving this because you have notifications enabled. <a href="${baseUrl}/settings" style="color: #999;">Manage preferences</a></p>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`Notification email sent to ${params.email}`);
    return true;
  } catch (error) {
    console.error("Failed to send notification email:", error);
    return false;
  }
}

export async function sendApprovalNotification(params: {
  email: string;
  userName: string;
  suggestionTitle: string;
  approvedBy: string;
  notionPageUrl: string;
}): Promise<boolean> {
  const client = getResendClient();
  if (!client) {
    return false;
  }

  try {
    await client.emails.send({
      from: getFromEmail(),
      to: params.email,
      subject: `Knowledge update approved: ${params.suggestionTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Update Approved</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="margin-top: 0; color: #333;">Hi ${params.userName},</h2>
              <p>A knowledge base update has been approved:</p>
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-weight: 600; color: #333;">${params.suggestionTitle}</p>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Approved by ${params.approvedBy}</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${params.notionPageUrl}" style="background: #333; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">View in Notion</a>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return true;
  } catch (error) {
    console.error("Failed to send approval notification:", error);
    return false;
  }
}

export async function sendTrialWarning(params: {
  email: string;
  userName: string;
  teamName: string;
  daysRemaining: number;
}): Promise<boolean> {
  const client = getResendClient();
  if (!client) {
    return false;
  }

  const baseUrl = getBaseUrl();
  const urgency = params.daysRemaining <= 3 ? "high" : "medium";
  const headerColor = params.daysRemaining <= 3 ? "#ef4444" : "#f59e0b";

  try {
    await client.emails.send({
      from: getFromEmail(),
      to: params.email,
      subject: `Your ${params.teamName} trial ends in ${params.daysRemaining} day${params.daysRemaining !== 1 ? 's' : ''}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: ${headerColor}; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Trial Ending Soon</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">${params.daysRemaining} day${params.daysRemaining !== 1 ? 's' : ''} remaining</p>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="margin-top: 0; color: #333;">Hi ${params.userName},</h2>
              <p>Your <strong>${params.teamName}</strong> trial on <em>Current</em> is ending soon.</p>
              <p>To continue using <em>Current</em> and keep your AI-powered knowledge base running:</p>
              <ul style="color: #666;">
                <li>All your suggestions and settings will be preserved</li>
                <li>Your integrations will continue working seamlessly</li>
                <li>Upgrade anytime to unlock more features</li>
              </ul>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/settings#subscription" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Upgrade Now</a>
              </div>
              <p style="color: #666; font-size: 14px;">Questions? Reply to this email and we'll be happy to help.</p>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
              <p style="color: #999; font-size: 12px; margin-bottom: 0;"><a href="${baseUrl}/settings" style="color: #999;">Manage email preferences</a></p>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`Trial warning email sent to ${params.email} (${params.daysRemaining} days remaining)`);
    return true;
  } catch (error) {
    console.error("Failed to send trial warning email:", error);
    return false;
  }
}

export async function sendTrialExpired(params: {
  email: string;
  userName: string;
  teamName: string;
}): Promise<boolean> {
  const client = getResendClient();
  if (!client) {
    return false;
  }

  const baseUrl = getBaseUrl();

  try {
    await client.emails.send({
      from: getFromEmail(),
      to: params.email,
      subject: `Your ${params.teamName} trial has ended`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #667eea; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;"><em>Current</em></h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">AI-Powered Knowledge Base</p>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="margin-top: 0; color: #333;">Hi ${params.userName},</h2>
              <p>Your trial for <strong>${params.teamName}</strong> has ended.</p>
              <p>Your data is safe, but new suggestions won't be generated until you upgrade. Choose a plan that fits your team:</p>
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0;"><strong>Starter:</strong> $99/mo - Perfect for small teams</p>
                <p style="margin: 0 0 8px 0;"><strong>Growth:</strong> $299/mo - For growing organizations</p>
                <p style="margin: 0;"><strong>Scale:</strong> $599/mo - Full power for larger teams</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/settings#subscription" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Choose a Plan</a>
              </div>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
              <p style="color: #999; font-size: 12px; margin-bottom: 0;">Questions? Reply to this email and we'll help you find the right plan.</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`Trial expired email sent to ${params.email}`);
    return true;
  } catch (error) {
    console.error("Failed to send trial expired email:", error);
    return false;
  }
}

export async function sendWeeklyDigest(params: {
  email: string;
  userName: string;
  teamName: string;
  stats: {
    totalSuggestions: number;
    approved: number;
    rejected: number;
    pending: number;
  };
  topSuggestions: Array<{
    title: string;
    status: string;
    confidence: number;
  }>;
}): Promise<boolean> {
  const client = getResendClient();
  if (!client) {
    return false;
  }

  const baseUrl = getBaseUrl();

  try {
    await client.emails.send({
      from: getFromEmail(),
      to: params.email,
      subject: `Weekly Knowledge Update - ${params.teamName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Weekly Digest</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">${params.teamName}</p>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="margin-top: 0; color: #333;">Hi ${params.userName},</h2>
              <p>Here's your weekly knowledge base summary:</p>
              
              <div style="display: flex; gap: 16px; margin: 24px 0;">
                <div style="flex: 1; text-align: center; padding: 16px; background: #f0fdf4; border-radius: 8px;">
                  <div style="font-size: 32px; font-weight: 700; color: #22c55e;">${params.stats.approved}</div>
                  <div style="font-size: 13px; color: #666;">Approved</div>
                </div>
                <div style="flex: 1; text-align: center; padding: 16px; background: #fef3c7; border-radius: 8px;">
                  <div style="font-size: 32px; font-weight: 700; color: #f59e0b;">${params.stats.pending}</div>
                  <div style="font-size: 13px; color: #666;">Pending</div>
                </div>
                <div style="flex: 1; text-align: center; padding: 16px; background: #fee2e2; border-radius: 8px;">
                  <div style="font-size: 32px; font-weight: 700; color: #ef4444;">${params.stats.rejected}</div>
                  <div style="font-size: 13px; color: #666;">Rejected</div>
                </div>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">View Dashboard</a>
              </div>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
              <p style="color: #999; font-size: 12px; margin-bottom: 0;"><a href="${baseUrl}/settings" style="color: #999;">Manage email preferences</a></p>
            </div>
          </body>
        </html>
      `,
    });

    return true;
  } catch (error) {
    console.error("Failed to send weekly digest:", error);
    return false;
  }
}

export async function sendDemoRequest(params: {
  fullName: string;
  email: string;
  company: string;
  teamSize: string;
  mainUseCase: string;
}): Promise<boolean> {
  const client = getResendClient();
  if (!client) {
    console.warn("Email client not available, skipping demo request email");
    return false;
  }

  try {
    await client.emails.send({
      from: getFromEmail(),
      to: process.env.DEMO_NOTIFY_EMAIL || "demos@current.app",
      replyTo: params.email,
      subject: `Demo Request: ${params.company} (${params.teamSize})`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">New Demo Request</h1>
            </div>
            <div style="background: #ffffff; padding: 24px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; width: 120px;">Name:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: 600;">${params.fullName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Email:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee;"><a href="mailto:${params.email}" style="color: #667eea;">${params.email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Company:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: 600;">${params.company}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Team Size:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee;">${params.teamSize}</td>
                </tr>
              </table>
              <div style="margin-top: 20px; padding: 16px; background: #f9fafb; border-radius: 8px;">
                <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">Use Case:</p>
                <p style="margin: 0; color: #333;">${params.mainUseCase}</p>
              </div>
              <div style="margin-top: 24px; text-align: center;">
                <a href="mailto:${params.email}?subject=Your%20Current%20Demo" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Reply to Lead</a>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    await client.emails.send({
      from: getFromEmail(),
      to: params.email,
      subject: `Your Current Demo Request - We'll be in touch!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;"><em>Current</em></h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">AI-Powered Knowledge Base</p>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="margin-top: 0; color: #333;">Thanks for your interest, ${params.fullName}!</h2>
              <p>We've received your demo request for <strong>${params.company}</strong>.</p>
              <p>Our team will review your submission and reach out within <strong>24 hours</strong> to schedule your personalized demo.</p>
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0; font-weight: 600; color: #0369a1;">What to expect:</p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #0c4a6e;">
                  <li>15-minute intro call to understand your needs</li>
                  <li>Live product demo with your use cases</li>
                  <li>Q&A and pricing discussion</li>
                </ul>
              </div>
              <p style="color: #666;">In the meantime, feel free to explore our <a href="${getBaseUrl()}/pricing" style="color: #667eea;">pricing plans</a>.</p>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">
              <p style="color: #999; font-size: 12px; margin-bottom: 0;">Questions? Just reply to this email.</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`Demo request emails sent for ${params.email}`);
    return true;
  } catch (error) {
    console.error("Failed to send demo request email:", error);
    return false;
  }
}

export async function sendNewsletterSubscription(params: {
  email: string;
}): Promise<boolean> {
  const client = getResendClient();
  if (!client) {
    console.warn("Email client not available, skipping newsletter email");
    return false;
  }

  try {
    await client.emails.send({
      from: getFromEmail(),
      to: params.email,
      subject: `You're subscribed to Current updates!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;"><em>Current</em></h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="margin-top: 0; color: #333; text-align: center;">You're on the list!</h2>
              <p style="text-align: center;">Thanks for subscribing to <em>Current</em> updates. We'll keep you posted on:</p>
              <ul style="color: #666; padding-left: 20px;">
                <li>New features and product updates</li>
                <li>AI & knowledge management insights</li>
                <li>Best practices for team documentation</li>
              </ul>
              <p style="text-align: center; color: #666; margin-top: 24px;">No spam, ever. Unsubscribe anytime.</p>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">
              <div style="text-align: center;">
                <a href="${getBaseUrl()}" style="color: #667eea; text-decoration: none;">Visit Current</a>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`Newsletter subscription email sent to ${params.email}`);
    return true;
  } catch (error) {
    console.error("Failed to send newsletter subscription email:", error);
    return false;
  }
}

export async function sendErrorAlert(params: {
  email: string;
  severity: string;
  category: string;
  message: string;
  teamName: string;
  timestamp: string;
  context: Record<string, any>;
}): Promise<boolean> {
  const client = getResendClient();
  if (!client) {
    console.warn("Email client not available, skipping error alert");
    return false;
  }

  const baseUrl = getBaseUrl();
  const severityColor = params.severity === "critical" ? "#dc2626" : params.severity === "error" ? "#f59e0b" : "#6b7280";
  const severityBg = params.severity === "critical" ? "#fef2f2" : params.severity === "error" ? "#fffbeb" : "#f9fafb";

  try {
    await client.emails.send({
      from: getFromEmail(),
      to: params.email,
      subject: `[${params.severity.toUpperCase()}] ${params.category}: ${params.message.substring(0, 50)}...`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: ${severityColor}; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">${params.severity.toUpperCase()} Alert</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;"><em>Current</em> Error Monitoring</p>
            </div>
            <div style="background: #ffffff; padding: 24px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
              <div style="background: ${severityBg}; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; font-weight: 600; color: ${severityColor};">${params.category}</p>
                <p style="margin: 8px 0 0 0; color: #374151;">${params.message}</p>
              </div>
              
              <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; width: 100px;">Team:</td>
                  <td style="padding: 8px 0; font-weight: 500;">${params.teamName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Time:</td>
                  <td style="padding: 8px 0;">${new Date(params.timestamp).toLocaleString()}</td>
                </tr>
                ${Object.entries(params.context).map(([key, value]) => `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">${key}:</td>
                  <td style="padding: 8px 0;">${String(value)}</td>
                </tr>
                `).join('')}
              </table>

              <div style="text-align: center; margin: 24px 0;">
                <a href="${baseUrl}/health" style="background: ${severityColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">View Health Dashboard</a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
              <p style="color: #999; font-size: 12px; margin-bottom: 0;">This is an automated alert from <em>Current</em> error monitoring.</p>
            </div>
          </body>
        </html>
      `,
    });

    return true;
  } catch (error) {
    console.error("Failed to send error alert:", error);
    return false;
  }
}
