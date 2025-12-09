import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { CheckCircle, Zap, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

type BillingInterval = "monthly" | "yearly";

interface Price {
  id: string;
  unit_amount: number;
  currency: string;
  recurring: { interval: string };
  active: boolean;
  metadata: { billing_period?: string; plan?: string };
}

interface Product {
  id: string;
  name: string;
  description: string;
  active: boolean;
  metadata: { plan?: string; features?: string };
  prices: Price[];
}

const PLAN_ORDER = ["Starter", "Growth", "Scale", "Pro Scale"];
const PLAN_LIMITS: Record<string, { suggestions: string; sources: string; seats: string; features: string[] }> = {
  Starter: {
    suggestions: "20 AI suggestions/month",
    sources: "Slack integration",
    seats: "Up to 5 team members",
    features: ["Manual approvals only", "Email support", "Basic analytics"],
  },
  Growth: {
    suggestions: "75 AI suggestions/month",
    sources: "Slack + Drive, Zoom, Meet (coming soon)",
    seats: "Up to 15 team members",
    features: ["Auto-approval for high confidence", "Priority support", "Activity audit trail"],
  },
  Scale: {
    suggestions: "200 AI suggestions/month",
    sources: "All sources (Slack + Drive, Zoom, Meet coming soon)",
    seats: "Up to 30 team members",
    features: ["API access", "Dedicated support", "Custom confidence thresholds"],
  },
  "Pro Scale": {
    suggestions: "Unlimited AI suggestions",
    sources: "All sources + priority access",
    seats: "Up to 75 team members",
    features: ["Audit logs & compliance", "Early access to new integrations", "SSO & advanced security"],
  },
};

export default function Pricing() {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: productsData, isLoading } = useQuery<{ data: Product[] }>({
    queryKey: ["/api/stripe/products"],
  });

  const checkoutMutation = useMutation({
    mutationFn: async ({ priceId, plan }: { priceId: string; plan: string }) => {
      const response = await apiRequest("/api/checkout", {
        method: "POST",
        body: JSON.stringify({ priceId, plan }),
      });
      return response;
    },
    onSuccess: (data: { url: string }) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  const handleSubscribe = (product: Product) => {
    if (!isAuthenticated) {
      setLocation("/signup?redirect=/pricing");
      return;
    }

    const price = product.prices.find(p => {
      const interval = billingInterval === "monthly" ? "month" : "year";
      return p.recurring?.interval === interval && p.active;
    });

    if (price) {
      checkoutMutation.mutate({ priceId: price.id, plan: product.metadata.plan || product.name.toLowerCase() });
    }
  };

  const products = productsData?.data
    ?.filter(p => p.active && PLAN_ORDER.includes(p.name))
    ?.sort((a, b) => PLAN_ORDER.indexOf(a.name) - PLAN_ORDER.indexOf(b.name)) || [];

  const formatPrice = (price: Price | undefined) => {
    if (!price) return "$0";
    const amount = price.unit_amount / 100;
    return `$${amount.toLocaleString()}`;
  };

  const getMonthlyEquivalent = (price: Price | undefined) => {
    if (!price || price.recurring.interval !== "year") return "";
    const monthly = Math.round(price.unit_amount / 12 / 100);
    return `$${monthly}/mo`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="py-20 lg:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-slate-600">
              Start with a 14-day free trial. No credit card required.
            </p>

            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setBillingInterval("monthly")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  billingInterval === "monthly"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                data-testid="button-monthly-billing"
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval("yearly")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  billingInterval === "yearly"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                data-testid="button-yearly-billing"
              >
                Yearly
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => {
                const price = product.prices.find(p => {
                  const interval = billingInterval === "monthly" ? "month" : "year";
                  return p.recurring?.interval === interval && p.active;
                });
                const limits = PLAN_LIMITS[product.name];
                const isPopular = product.name === "Scale";

                return (
                  <div
                    key={product.id}
                    className={`rounded-2xl p-6 lg:p-8 border transition-all flex flex-col ${
                      isPopular
                        ? "border-2 border-primary shadow-2xl bg-gradient-to-br from-blue-50 to-white relative"
                        : "border-slate-200 bg-white hover:shadow-lg"
                    }`}
                    data-testid={`card-pricing-${product.name.toLowerCase().replace(" ", "-")}`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Most Popular
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-slate-600 min-h-[40px]">
                        {product.description}
                      </p>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-slate-900">
                          {formatPrice(price)}
                        </span>
                        <span className="text-slate-600">
                          /{billingInterval === "monthly" ? "mo" : "yr"}
                        </span>
                      </div>
                      {billingInterval === "yearly" && price && (
                        <p className="text-sm text-green-600 mt-1">
                          {getMonthlyEquivalent(price)} billed annually
                        </p>
                      )}
                    </div>

                    <Button
                      size="lg"
                      className={`w-full mb-6 font-semibold ${
                        isPopular
                          ? "bg-primary hover:bg-primary/90 text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                      }`}
                      onClick={() => handleSubscribe(product)}
                      disabled={checkoutMutation.isPending}
                      data-testid={`button-subscribe-${product.name.toLowerCase().replace(" ", "-")}`}
                    >
                      {checkoutMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Start Free Trial"
                      )}
                    </Button>

                    <div className="space-y-3 flex-1">
                      {limits && (
                        <>
                          <div className="flex gap-2">
                            <CheckCircle className="w-4 h-4 flex-shrink-0 text-primary mt-0.5" />
                            <span className="text-sm text-slate-700 font-medium">{limits.suggestions}</span>
                          </div>
                          <div className="flex gap-2">
                            <CheckCircle className="w-4 h-4 flex-shrink-0 text-primary mt-0.5" />
                            <span className="text-sm text-slate-700">{limits.sources}</span>
                          </div>
                          <div className="flex gap-2">
                            <CheckCircle className="w-4 h-4 flex-shrink-0 text-primary mt-0.5" />
                            <span className="text-sm text-slate-700">{limits.seats}</span>
                          </div>
                          {limits.features.map((feature, fIdx) => (
                            <div key={fIdx} className="flex gap-2">
                              <CheckCircle className="w-4 h-4 flex-shrink-0 text-slate-400 mt-0.5" />
                              <span className="text-sm text-slate-600">{feature}</span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              <div
                className="rounded-2xl p-6 lg:p-8 border border-slate-200 bg-gradient-to-br from-slate-50 to-white flex flex-col"
                data-testid="card-pricing-enterprise"
              >
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Enterprise
                  </h3>
                  <p className="text-sm text-slate-600 min-h-[40px]">
                    Custom solutions for large organizations
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900">Custom</span>
                  <p className="text-sm text-slate-500 mt-1">Contact us for pricing</p>
                </div>

                <Link href="/book-demo">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full mb-6 font-semibold"
                    data-testid="button-contact-enterprise"
                  >
                    Talk to an Expert
                  </Button>
                </Link>

                <div className="space-y-3 flex-1">
                  <div className="flex gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 text-primary mt-0.5" />
                    <span className="text-sm text-slate-700 font-medium">Unlimited everything</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 text-primary mt-0.5" />
                    <span className="text-sm text-slate-700">Unlimited team members</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 text-primary mt-0.5" />
                    <span className="text-sm text-slate-700">Custom integrations</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 text-primary mt-0.5" />
                    <span className="text-sm text-slate-700">SOC 2 (in progress)</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 text-primary mt-0.5" />
                    <span className="text-sm text-slate-700">Custom SLAs</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 text-slate-400 mt-0.5" />
                    <span className="text-sm text-slate-600">SSO & SAML</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 text-slate-400 mt-0.5" />
                    <span className="text-sm text-slate-600">Dedicated account manager</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 text-slate-400 mt-0.5" />
                    <span className="text-sm text-slate-600">SLA guarantees</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-2xl mx-auto space-y-8 pt-12 border-t">
            <h2 className="text-3xl font-bold text-slate-900 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              {[
                {
                  q: "Can I try for free?",
                  a: "Yes! All plans come with a 14-day free trial. No credit card required. Start building your self-updating knowledge base today."
                },
                {
                  q: "Can I change plans anytime?",
                  a: "Absolutely. Upgrade or downgrade your plan at any time from your billing settings. Changes take effect immediately."
                },
                {
                  q: "What happens if I exceed my suggestion limit?",
                  a: "We'll notify you as you approach your limit. You can upgrade to a higher plan, or the system will queue suggestions until the next billing cycle."
                },
                {
                  q: "What integrations are supported?",
                  a: "Slack is fully supported as a knowledge source, with Notion as the output destination. Google Drive, Zoom, and Google Meet integrations are coming soon."
                },
                {
                  q: "How does auto-approval work?",
                  a: "On Growth plans and above, you can set a confidence threshold. Suggestions above that threshold are automatically approved and synced to Notion without manual review."
                }
              ].map((faq, idx) => (
                <div key={idx}>
                  <h4 className="font-semibold text-slate-900 mb-2">
                    {faq.q}
                  </h4>
                  <p className="text-slate-600">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-8 pt-12 border-t" data-testid="section-why-enterprise">
            <h2 className="text-3xl font-bold text-slate-900 text-center">
              Why Enterprise?
            </h2>
            <p className="text-center text-slate-600 max-w-2xl mx-auto">
              For organizations that need more than just a tool—a true knowledge partner.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
              <div className="text-center space-y-3" data-testid="enterprise-feature-dedicated-support">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Dedicated Support</h3>
                <p className="text-sm text-slate-600">
                  Get a dedicated account manager and priority support with guaranteed response times. Your success is our priority.
                </p>
              </div>

              <div className="text-center space-y-3" data-testid="enterprise-feature-security-compliance">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Security & Compliance</h3>
                <p className="text-sm text-slate-600">
                  Enterprise-grade security with SOC 2 compliance (in progress), SSO/SAML, and audit logs to meet your organization's requirements.
                </p>
              </div>

              <div className="text-center space-y-3" data-testid="enterprise-feature-custom-integrations">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Custom Integrations</h3>
                <p className="text-sm text-slate-600">
                  Connect Current to your existing tools and workflows with custom integrations tailored to your organization's needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-slate-50 py-12 px-6 lg:px-8 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-bold text-slate-900 mb-4"><em>Current</em></h4>
              <p className="text-sm text-slate-600">
                AI-powered knowledge management for teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/" className="hover:text-primary">Home</Link></li>
                <li><Link href="/product" className="hover:text-primary">Product</Link></li>
                <li><Link href="/how-it-works" className="hover:text-primary">How It Works</Link></li>
                <li><Link href="/use-cases" className="hover:text-primary">Use Cases</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm">Compare</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/compare/notion" className="hover:text-primary">vs Notion</Link></li>
                <li><Link href="/compare/confluence" className="hover:text-primary">vs Confluence</Link></li>
                <li><Link href="/compare/guru" className="hover:text-primary">vs Guru</Link></li>
                <li><Link href="/compare/slab" className="hover:text-primary">vs Slab</Link></li>
                <li><Link href="/compare/google-docs" className="hover:text-primary">vs Google Docs</Link></li>
                <li><Link href="/compare/tool-stack" className="hover:text-primary">vs Tool Stack</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm">Problems</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/compare/hiring-doc-manager" className="hover:text-primary">vs Hiring Doc Manager</Link></li>
                <li><Link href="/compare/searching-slack" className="hover:text-primary">vs Searching Slack</Link></li>
                <li><Link href="/compare/tribal-knowledge" className="hover:text-primary">vs Tribal Knowledge</Link></li>
                <li><Link href="/compare/manual-documentation" className="hover:text-primary">vs Manual Updates</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                <li><Link href="/book-demo" className="hover:text-primary">Book a Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
                <li><Link href="/security" className="hover:text-primary">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              © 2025 <em>Current</em>. All rights reserved.
            </p>
            <p className="text-sm text-slate-500">
              Made with clarity and care.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
