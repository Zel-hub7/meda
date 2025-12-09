import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { FileText, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Blog() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  const newsletterMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest("/api/newsletter", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    },
    onSuccess: () => {
      setSubscribed(true);
      setEmail("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      newsletterMutation.mutate(email);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="py-20 lg:py-32 px-6 lg:px-8 border-b">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-4xl lg:text-5xl font-bold" data-testid="text-blog-title">
            Knowledge Management Insights
          </h1>
          <p className="text-xl text-muted-foreground">
            Articles, guides, and case studies from the <em>Current</em> team
          </p>
        </div>
      </section>

      {/* Coming Soon Content */}
      <section className="py-20 lg:py-32 px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold" data-testid="text-coming-soon">
                Blog Coming Soon
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're working on insightful articles about AI-powered knowledge management, 
                best practices for team documentation, and case studies from organizations 
                using <em>Current</em>.
              </p>
              <p className="text-muted-foreground">
                In the meantime, you can explore our product features or get started with a free trial.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/">
                  <Button variant="outline" data-testid="link-explore-features">
                    Explore Features
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button data-testid="link-get-started">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 lg:py-32 px-6 lg:px-8 bg-muted/50">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">
              Stay Updated
            </h2>
            <p className="text-muted-foreground">
              Be the first to know when we publish new articles and guides.
            </p>
          </div>

          {subscribed ? (
            <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/20 p-4 rounded-lg max-w-md mx-auto">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">You're subscribed! Check your email.</span>
            </div>
          ) : (
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                data-testid="input-newsletter-email"
                required
              />
              <Button type="submit" disabled={newsletterMutation.isPending} data-testid="button-subscribe">
                {newsletterMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Notify Me"
                )}
              </Button>
            </form>
          )}
          <p className="text-sm text-muted-foreground">
            No spam, unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-bold text-foreground mb-4"><em>Current</em></h4>
              <p className="text-sm text-muted-foreground">
                Self-updating knowledge for fast-moving teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/product" className="hover:text-primary">Product</Link></li>
                <li><Link href="/how-it-works" className="hover:text-primary">How It Works</Link></li>
                <li><Link href="/use-cases" className="hover:text-primary">Use Cases</Link></li>
                <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Compare</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/compare/notion" className="hover:text-primary">vs Notion</Link></li>
                <li><Link href="/compare/confluence" className="hover:text-primary">vs Confluence</Link></li>
                <li><Link href="/compare/guru" className="hover:text-primary">vs Guru</Link></li>
                <li><Link href="/compare/slab" className="hover:text-primary">vs Slab</Link></li>
                <li><Link href="/compare/google-docs" className="hover:text-primary">vs Google Docs</Link></li>
                <li><Link href="/compare/tool-stack" className="hover:text-primary">vs Tool Stack</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Problems</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/compare/hiring-doc-manager" className="hover:text-primary">vs Hiring a Doc Manager</Link></li>
                <li><Link href="/compare/searching-slack" className="hover:text-primary">vs Searching Slack</Link></li>
                <li><Link href="/compare/tribal-knowledge" className="hover:text-primary">vs Tribal Knowledge</Link></li>
                <li><Link href="/compare/manual-documentation" className="hover:text-primary">vs Manual Updates</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                <li><Link href="/book-demo" className="hover:text-primary">Book a Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
                <li><Link href="/security" className="hover:text-primary">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 <em>Current</em>. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground/60">
              Made with clarity and care.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
