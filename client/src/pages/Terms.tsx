import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Terms() {
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
            <h1 className="text-3xl font-bold mb-2" data-testid="text-terms-title">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last updated: December 1, 2025</p>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">1. Agreement to Terms</h2>
                <p className="text-muted-foreground mb-4">
                  By accessing or using <em>Current</em> ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
                </p>
                <p className="text-muted-foreground mb-4">
                  These Terms apply to all visitors, users, and others who access or use the Service. If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
                <p className="text-muted-foreground mb-4">
                  <em>Current</em> is an AI-powered knowledge base management tool that:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Monitors your connected communication channels (Slack, Google Drive, Zoom, Google Meet) for potential knowledge updates</li>
                  <li>Uses artificial intelligence to extract and validate relevant information</li>
                  <li>Proposes updates to your Notion knowledge base for human review and approval</li>
                  <li>Maintains an audit trail of all knowledge base changes</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">3. Account Registration</h2>
                <p className="text-muted-foreground mb-4">
                  To use certain features of the Service, you must register for an account. You agree to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Promptly notify us of any unauthorized access</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  We reserve the right to refuse service, terminate accounts, or remove content at our sole discretion.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">4. Subscription and Payments</h2>
                <h3 className="text-lg font-medium mb-2">4.1 Plans and Pricing</h3>
                <p className="text-muted-foreground mb-4">
                  We offer various subscription plans with different features and pricing. Current pricing is available on our pricing page. Prices are subject to change with 30 days notice.
                </p>

                <h3 className="text-lg font-medium mb-2">4.2 Free Trial</h3>
                <p className="text-muted-foreground mb-4">
                  New accounts receive a 14-day free trial. After the trial period, you must subscribe to a paid plan to continue using the Service.
                </p>

                <h3 className="text-lg font-medium mb-2">4.3 Billing</h3>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Subscriptions are billed in advance on a monthly or annual basis</li>
                  <li>Payment is processed securely via Stripe</li>
                  <li>You authorize us to charge your payment method on file</li>
                  <li>Failed payments may result in service suspension</li>
                </ul>

                <h3 className="text-lg font-medium mb-2">4.4 Refunds</h3>
                <p className="text-muted-foreground mb-4">
                  Annual subscriptions are eligible for a pro-rated refund within 30 days of purchase. Monthly subscriptions are non-refundable. Contact support@current.app for refund requests.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">5. Acceptable Use</h2>
                <p className="text-muted-foreground mb-4">You agree NOT to use the Service to:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit malware, viruses, or harmful code</li>
                  <li>Attempt to gain unauthorized access to systems</li>
                  <li>Interfere with the Service's operation or security</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Use automated systems to access the Service (except authorized APIs)</li>
                  <li>Reverse engineer or decompile the Service</li>
                  <li>Resell or redistribute the Service without authorization</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">6. Your Content</h2>
                <h3 className="text-lg font-medium mb-2">6.1 Ownership</h3>
                <p className="text-muted-foreground mb-4">
                  You retain ownership of all content you submit, post, or display through the Service ("Your Content"). We do not claim ownership of Your Content.
                </p>

                <h3 className="text-lg font-medium mb-2">6.2 License Grant</h3>
                <p className="text-muted-foreground mb-4">
                  By using the Service, you grant us a limited, non-exclusive license to access, process, and analyze Your Content solely for the purpose of providing the Service. This includes:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Processing content through our AI systems to detect knowledge</li>
                  <li>Storing and transmitting content as necessary</li>
                  <li>Displaying content to authorized team members</li>
                </ul>

                <h3 className="text-lg font-medium mb-2">6.3 Responsibility</h3>
                <p className="text-muted-foreground mb-4">
                  You are solely responsible for Your Content and the consequences of sharing it. You represent that you have all necessary rights to submit Your Content.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">7. Third-Party Integrations</h2>
                <p className="text-muted-foreground mb-4">
                  The Service integrates with third-party platforms (Slack, Notion, Google, Zoom). Your use of these integrations is subject to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>The respective platform's terms of service</li>
                  <li>The permissions you grant during connection</li>
                  <li>Any rate limits or restrictions imposed by those platforms</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  We are not responsible for the availability, accuracy, or policies of third-party services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">8. Intellectual Property</h2>
                <p className="text-muted-foreground mb-4">
                  The Service, including its original content, features, and functionality, is owned by Current, Inc. and protected by copyright, trademark, and other intellectual property laws. Our trademarks may not be used without prior written consent.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">9. Disclaimer of Warranties</h2>
                <p className="text-muted-foreground mb-4">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>The Service will be uninterrupted or error-free</li>
                  <li>AI-generated suggestions will be accurate or appropriate</li>
                  <li>The Service will meet your specific requirements</li>
                  <li>Any defects will be corrected</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  <strong>You are responsible for reviewing and approving all knowledge base updates.</strong> We recommend human review of all AI-generated suggestions before approval.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">10. Limitation of Liability</h2>
                <p className="text-muted-foreground mb-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, CURRENT, INC. SHALL NOT BE LIABLE FOR:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Any indirect, incidental, special, or consequential damages</li>
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Errors in AI-generated suggestions that are approved by users</li>
                  <li>Actions of third-party services or integrations</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  Our total liability shall not exceed the amount you paid for the Service in the 12 months preceding the claim.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">11. Indemnification</h2>
                <p className="text-muted-foreground mb-4">
                  You agree to indemnify and hold harmless Current, Inc. and its affiliates from any claims, damages, or expenses arising from:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Your use of the Service</li>
                  <li>Your Content</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any third-party rights</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">12. Termination</h2>
                <p className="text-muted-foreground mb-4">
                  We may terminate or suspend your account immediately, without prior notice, for:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Breach of these Terms</li>
                  <li>Fraudulent or illegal activity</li>
                  <li>Non-payment of fees</li>
                  <li>Extended inactivity</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  Upon termination, your right to use the Service ceases immediately. You may request data export before or within 30 days of termination.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">13. Governing Law</h2>
                <p className="text-muted-foreground mb-4">
                  These Terms shall be governed by the laws of the State of California, United States, without regard to conflict of law provisions. Any disputes shall be resolved in the courts of San Francisco County, California.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">14. Changes to Terms</h2>
                <p className="text-muted-foreground mb-4">
                  We reserve the right to modify these Terms at any time. We will provide notice of significant changes via email or in-app notification at least 30 days before they take effect. Continued use after changes constitutes acceptance.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">15. Contact Us</h2>
                <p className="text-muted-foreground mb-4">
                  If you have questions about these Terms, please contact:
                </p>
                <p className="text-muted-foreground">
                  <strong>Email:</strong> legal@current.app<br />
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
