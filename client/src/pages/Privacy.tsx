import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="link-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-8 md:p-12">
            <h1 className="text-3xl font-bold mb-2" data-testid="text-privacy-title">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: December 1, 2025</p>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground mb-4">
                  Welcome to <em>Current</em> ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered knowledge base service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
                <h3 className="text-lg font-medium mb-2">2.1 Information You Provide</h3>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Account information (name, email address, password)</li>
                  <li>Team and organization details</li>
                  <li>Payment and billing information (processed securely via Stripe)</li>
                  <li>Content you create, upload, or share through our service</li>
                  <li>Communications with our support team</li>
                </ul>

                <h3 className="text-lg font-medium mb-2">2.2 Information from Connected Services</h3>
                <p className="text-muted-foreground mb-4">
                  When you connect third-party services (Slack, Google Drive, Notion, Zoom, Google Meet), we access:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Messages and content from authorized Slack channels</li>
                  <li>Documents from authorized Google Drive folders</li>
                  <li>Pages and databases from your connected Notion workspace</li>
                  <li>Meeting transcripts from Zoom and Google Meet (with your permission)</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  <strong>Important:</strong> We only access data you explicitly authorize, and we never access personal messages or private content outside your designated channels and folders.
                </p>

                <h3 className="text-lg font-medium mb-2">2.3 Automatically Collected Information</h3>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Usage data and analytics (pages visited, features used)</li>
                  <li>Device and browser information</li>
                  <li>IP address and general location</li>
                  <li>Log data and error reports</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>To provide and improve our knowledge base automation services</li>
                  <li>To process and analyze content for knowledge extraction using AI</li>
                  <li>To send you notifications about detected knowledge updates</li>
                  <li>To process payments and manage your subscription</li>
                  <li>To communicate with you about service updates and support</li>
                  <li>To ensure security and prevent fraud</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">4. AI Processing</h2>
                <p className="text-muted-foreground mb-4">
                  <em>Current</em> uses artificial intelligence (powered by Anthropic's Claude) to analyze content from your connected services. This processing:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Occurs on secure servers with enterprise-grade encryption</li>
                  <li>Is used solely to identify potential knowledge updates for your team</li>
                  <li>Does not train external AI models on your data</li>
                  <li>Is subject to human review before any changes are made to your Notion workspace</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
                <p className="text-muted-foreground mb-4">We do not sell your personal information. We may share data with:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li><strong>Service Providers:</strong> Trusted partners who assist in operating our service (hosting, payment processing, analytics)</li>
                  <li><strong>Connected Platforms:</strong> Third-party services you authorize (Slack, Notion, etc.) to provide our core functionality</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">6. Data Security</h2>
                <p className="text-muted-foreground mb-4">
                  We implement industry-standard security measures including:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Encryption in transit (TLS 1.3) and at rest (AES-256)</li>
                  <li>Secure authentication and session management</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Access controls and audit logging</li>
                  <li>Secure data centers with SOC 2 compliance</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">7. Data Retention</h2>
                <p className="text-muted-foreground mb-4">
                  We retain your data for as long as your account is active or as needed to provide services. Upon account deletion:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Personal data is deleted within 30 days</li>
                  <li>Aggregated, anonymized data may be retained for analytics</li>
                  <li>Backups are purged within 90 days</li>
                  <li>Legal hold data is retained as required by law</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">8. Your Rights</h2>
                <p className="text-muted-foreground mb-4">Depending on your location, you may have the right to:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Delete your data ("right to be forgotten")</li>
                  <li>Export your data in a portable format</li>
                  <li>Object to or restrict certain processing</li>
                  <li>Withdraw consent for optional processing</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  To exercise these rights, contact us at privacy@current.app or through your account settings.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">9. International Data Transfers</h2>
                <p className="text-muted-foreground mb-4">
                  Your data may be processed in countries outside your residence. We ensure appropriate safeguards through Standard Contractual Clauses and other legally approved transfer mechanisms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">10. Children's Privacy</h2>
                <p className="text-muted-foreground mb-4">
                  <em>Current</em> is not intended for children under 16. We do not knowingly collect personal information from children. If you believe we have collected such data, please contact us immediately.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">11. Changes to This Policy</h2>
                <p className="text-muted-foreground mb-4">
                  We may update this Privacy Policy periodically. We will notify you of significant changes via email or in-app notification. Continued use after changes constitutes acceptance.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">12. Contact Us</h2>
                <p className="text-muted-foreground mb-4">
                  If you have questions about this Privacy Policy or our data practices, please contact:
                </p>
                <p className="text-muted-foreground">
                  <strong>Email:</strong> privacy@current.app<br />
                  <strong>Address:</strong> Current, Inc.<br />
                  123 Innovation Drive<br />
                  San Francisco, CA 94105
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
