import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Lock, Server, Users, Brain, FileCheck, AlertTriangle, Mail } from "lucide-react";
import { Link } from "wouter";

export default function Security() {
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
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold" data-testid="text-security-title">Security & Trust</h1>
            </div>
            <p className="text-muted-foreground mb-8">Last updated: December 1, 2025</p>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-muted-foreground mb-8">
                At <em>Current</em>, security is foundational to everything we build. We understand that you're trusting us with your organization's knowledge and communications. This page outlines our comprehensive approach to protecting your data and maintaining your trust.
              </p>

              <section className="mb-8" data-testid="section-data-security">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-semibold">1. Data Security</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  We implement enterprise-grade security measures to protect your data at every layer:
                </p>
                <h3 className="text-lg font-medium mb-2">1.1 Encryption</h3>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li><strong>In Transit:</strong> All data is encrypted using TLS 1.3, the latest and most secure transport layer protocol</li>
                  <li><strong>At Rest:</strong> Data is encrypted using AES-256 encryption, the industry standard for data protection</li>
                  <li><strong>Key Management:</strong> Encryption keys are managed using secure key management services with regular rotation</li>
                </ul>

                <h3 className="text-lg font-medium mb-2">1.2 Secure Infrastructure</h3>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Hosted on enterprise-grade cloud infrastructure with SOC 2 certified data centers</li>
                  <li>Network security with firewalls, intrusion detection, and DDoS protection</li>
                  <li>Regular vulnerability scanning and penetration testing</li>
                  <li>Automated security patching and updates</li>
                </ul>
              </section>

              <section className="mb-8" data-testid="section-data-retention">
                <div className="flex items-center gap-2 mb-4">
                  <Server className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-semibold">2. Data Retention & Deletion</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  We maintain clear policies for data retention and deletion to ensure you remain in control of your information:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li><strong>Active Accounts:</strong> Data is retained for as long as your account is active and as needed to provide our services</li>
                  <li><strong>Account Deletion:</strong> Upon account deletion, all personal and organizational data is permanently deleted within <strong>30 days</strong></li>
                  <li><strong>Backups:</strong> Backup copies are purged within <strong>90 days</strong> of account deletion</li>
                  <li><strong>Anonymized Data:</strong> Aggregated, anonymized data may be retained for analytics and service improvement</li>
                  <li><strong>Legal Requirements:</strong> Data subject to legal hold is retained as required by applicable law</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  You can request data export at any time through your account settings or by contacting our support team.
                </p>
              </section>

              <section className="mb-8" data-testid="section-data-residency">
                <div className="flex items-center gap-2 mb-4">
                  <Server className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-semibold">3. Data Residency</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  Your data is stored and processed in secure, compliant facilities:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li><strong>Primary Data Centers:</strong> All primary data storage and processing occurs in United States-based data centers</li>
                  <li><strong>Data Center Certifications:</strong> Our infrastructure providers maintain SOC 2 Type II, ISO 27001, and other relevant certifications</li>
                  <li><strong>International Transfers:</strong> For users outside the US, data may be transferred internationally. We ensure appropriate safeguards through Standard Contractual Clauses (SCCs) and other legally approved transfer mechanisms</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  Enterprise customers may inquire about regional data residency options by contacting our sales team.
                </p>
              </section>

              <section className="mb-8" data-testid="section-access-controls">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-semibold">4. Access Controls</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  We implement strict access controls to protect your data:
                </p>
                <h3 className="text-lg font-medium mb-2">4.1 Least-Privilege Principles</h3>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Employees are granted the minimum level of access required to perform their job functions</li>
                  <li>Access to customer data is strictly limited and logged</li>
                  <li>Regular access reviews ensure permissions remain appropriate</li>
                </ul>

                <h3 className="text-lg font-medium mb-2">4.2 Role-Based Access Control (RBAC)</h3>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Your organization can configure role-based permissions for team members</li>
                  <li>Admins have full control over who can access, approve, or manage knowledge updates</li>
                  <li>Granular permissions for integration connections and settings</li>
                </ul>

                <h3 className="text-lg font-medium mb-2">4.3 Audit Logging</h3>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Comprehensive audit logs track all system access and actions</li>
                  <li>Logs are immutable and retained for security analysis</li>
                  <li>Activity logs are available to organization admins for review</li>
                </ul>
              </section>

              <section className="mb-8" data-testid="section-ai-data-handling">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-semibold">5. AI Data Handling</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  We take special care with how your data is processed by our AI systems:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li><strong>No Model Training:</strong> Your data is <strong>never used to train AI models</strong>. We do not use your content to improve third-party AI systems</li>
                  <li><strong>Service-Only Processing:</strong> Data is processed solely to provide the Current service - identifying knowledge updates and proposing changes to your knowledge base</li>
                  <li><strong>Ephemeral Processing:</strong> Content sent to AI providers for analysis is not retained by those providers beyond the immediate processing request</li>
                  <li><strong>Human Review:</strong> All AI-suggested changes require human approval before being applied to your knowledge base</li>
                  <li><strong>AI Provider Security:</strong> We partner with enterprise-grade AI providers (Anthropic) who maintain strict security and privacy commitments</li>
                </ul>
              </section>

              <section className="mb-8" data-testid="section-compliance-roadmap">
                <div className="flex items-center gap-2 mb-4">
                  <FileCheck className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-semibold">6. Compliance Roadmap</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  We are committed to meeting the highest compliance standards. Here's our current status and roadmap:
                </p>
                <div className="space-y-4 mb-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg" data-testid="compliance-soc2">
                    <div>
                      <h3 className="font-medium">SOC 2 Type II</h3>
                      <p className="text-sm text-muted-foreground">Security, availability, and confidentiality controls</p>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      In Progress - Expected Q2 2025
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg" data-testid="compliance-sso">
                    <div>
                      <h3 className="font-medium">SSO (SAML/OIDC)</h3>
                      <p className="text-sm text-muted-foreground">Enterprise single sign-on integration</p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      On Roadmap - Expected Q1 2025
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg" data-testid="compliance-gdpr">
                    <div>
                      <h3 className="font-medium">GDPR</h3>
                      <p className="text-sm text-muted-foreground">European Union data protection regulation</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Compliant
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg" data-testid="compliance-ccpa">
                    <div>
                      <h3 className="font-medium">CCPA</h3>
                      <p className="text-sm text-muted-foreground">California Consumer Privacy Act</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Compliant
                    </Badge>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  For enterprise compliance requirements or to discuss specific certifications, please contact our sales team.
                </p>
              </section>

              <section className="mb-8" data-testid="section-third-party-security">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-semibold">7. Third-Party Security</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  We carefully vet and monitor all third-party services we integrate with:
                </p>
                <h3 className="text-lg font-medium mb-2">7.1 Payment Processing</h3>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li><strong>Stripe:</strong> All payment processing is handled by Stripe, a PCI DSS Level 1 certified payment processor</li>
                  <li>We never store credit card numbers or sensitive payment information on our servers</li>
                  <li>Stripe's security practices are independently audited and certified</li>
                </ul>

                <h3 className="text-lg font-medium mb-2">7.2 Infrastructure Partners</h3>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Cloud infrastructure providers maintain SOC 2, ISO 27001, and other relevant certifications</li>
                  <li>Regular security assessments of all critical vendors</li>
                  <li>Contractual security requirements with all service providers</li>
                </ul>

                <h3 className="text-lg font-medium mb-2">7.3 Integration Security</h3>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>OAuth 2.0 is used for all third-party integrations (Slack, Notion, Google, Zoom)</li>
                  <li>We request only the minimum permissions required for functionality</li>
                  <li>Integration tokens are encrypted and can be revoked at any time</li>
                </ul>
              </section>

              <section className="mb-8" data-testid="section-incident-response">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-semibold">8. Incident Response</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  We maintain a comprehensive incident response program to handle security events:
                </p>
                <h3 className="text-lg font-medium mb-2">8.1 Detection & Response</h3>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>24/7 security monitoring and alerting systems</li>
                  <li>Defined incident classification and escalation procedures</li>
                  <li>Dedicated security response team</li>
                </ul>

                <h3 className="text-lg font-medium mb-2">8.2 Communication</h3>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Affected customers are notified within 72 hours of confirmed security incidents</li>
                  <li>Transparent communication about incident scope, impact, and remediation</li>
                  <li>Post-incident reports provided upon request</li>
                </ul>

                <h3 className="text-lg font-medium mb-2">8.3 Continuous Improvement</h3>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Post-incident reviews to identify and address root causes</li>
                  <li>Regular updates to security controls based on lessons learned</li>
                  <li>Annual tabletop exercises and incident response drills</li>
                </ul>
              </section>

              <section className="mb-8" data-testid="section-contact">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-semibold">9. Contact Us</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  We welcome questions about our security practices. For security-related inquiries:
                </p>
                <p className="text-muted-foreground mb-4">
                  <strong>Security Team:</strong> <a href="mailto:security@current.app" className="text-indigo-600 hover:underline" data-testid="link-security-email">security@current.app</a>
                </p>
                <p className="text-muted-foreground mb-4">
                  <strong>Vulnerability Disclosure:</strong> If you discover a security vulnerability, please report it responsibly to <a href="mailto:security@current.app" className="text-indigo-600 hover:underline">security@current.app</a>. We appreciate your help in keeping Current secure.
                </p>
                <p className="text-muted-foreground">
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
