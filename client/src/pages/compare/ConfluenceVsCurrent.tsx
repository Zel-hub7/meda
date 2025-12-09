import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { CheckCircle, X, ArrowRight, Zap, FileText, Clock, Brain, AlertTriangle } from "lucide-react";
import { SiAtlassian } from "react-icons/si";
import { Badge } from "@/components/ui/badge";

export default function ConfluenceVsCurrent() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="mb-4">
            Comparison
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
            Confluence vs <em>Current</em>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Confluence stores documentation. <em>Current</em> keeps any knowledge base—including Notion—accurate and up-to-date automatically.
          </p>
        </div>
      </section>

      {/* Quick Answer */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl p-8 border border-card-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">The Quick Answer</h2>
            <p className="text-muted-foreground text-lg">
              <strong className="text-foreground">Confluence</strong> is Atlassian's enterprise wiki and documentation platform. 
              <strong className="text-foreground"> <em>Current</em></strong> is an AI-powered knowledge maintenance layer that monitors 
              Slack conversations and proposes updates to your knowledge base (currently Notion, with more integrations coming). 
              They solve different problems: Confluence is for storing docs, <em>Current</em> is for keeping docs accurate.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Feature Comparison</h2>
          
          <div className="bg-card rounded-xl border border-card-border overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-6 border-b border-card-border bg-muted/50">
              <div className="font-semibold text-foreground">Feature</div>
              <div className="font-semibold text-foreground flex items-center gap-2">
                <SiAtlassian className="w-5 h-5 text-[#0052CC]" /> Confluence
              </div>
              <div className="font-semibold text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" /> <em>Current</em>
              </div>
            </div>
            
            {[
              { feature: "Enterprise wiki & documentation", confluence: true, current: false },
              { feature: "Page hierarchies & spaces", confluence: true, current: false },
              { feature: "Jira integration", confluence: true, current: false },
              { feature: "Macros & templates", confluence: true, current: false },
              { feature: "AI content extraction from Slack", confluence: false, current: true },
              { feature: "Automatic update detection", confluence: false, current: true },
              { feature: "Human approval workflow", confluence: false, current: true },
              { feature: "Confidence scoring", confluence: false, current: true },
              { feature: "Real-time Slack monitoring", confluence: false, current: true },
              { feature: "Knowledge drift alerts", confluence: false, current: true },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-4 p-6 border-b border-card-border last:border-0">
                <div className="text-muted-foreground">{row.feature}</div>
                <div>
                  {row.confluence ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground/40" />
                  )}
                </div>
                <div>
                  {row.current ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground/40" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Differences */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">Key Differences</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Understanding when to use each tool
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl p-8 border border-card-border">
              <div className="w-12 h-12 rounded-lg bg-[#0052CC] flex items-center justify-center mb-6">
                <SiAtlassian className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Confluence</h3>
              <p className="text-muted-foreground mb-4">
                Enterprise-grade documentation platform, ideal for large organizations already using Atlassian products.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Deep Jira & Atlassian ecosystem integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Complex permission structures</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Enterprise compliance features</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-card rounded-xl p-8 border border-card-border">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3"><em>Current</em></h3>
              <p className="text-muted-foreground mb-4">
                AI-powered maintenance layer that keeps your existing knowledge base accurate without manual effort.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Monitors Slack for knowledge-worthy updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>AI extracts and validates information</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Human-in-the-loop approval workflow</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Common Pain Points */}
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">Common Confluence Pain Points</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Issues that <em>Current</em> helps solve (when paired with Notion)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Stale Documentation</h3>
              <p className="text-sm text-muted-foreground">
                Pages become outdated because updates require manual effort
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <Clock className="w-10 h-10 text-amber-500 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Time-Consuming Maintenance</h3>
              <p className="text-sm text-muted-foreground">
                Teams spend hours updating docs instead of doing real work
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <FileText className="w-10 h-10 text-amber-500 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Scattered Information</h3>
              <p className="text-sm text-muted-foreground">
                Important decisions live in Slack, not in the wiki
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* When to Choose */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">When to Choose Each</h2>
          
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border border-card-border">
              <h3 className="font-semibold text-foreground mb-2">Choose Confluence if:</h3>
              <p className="text-muted-foreground">
                You're an enterprise heavily invested in the Atlassian ecosystem (Jira, Bitbucket, Trello) 
                and need deep integrations with those tools. Confluence works best when your workflows 
                are centered around Jira tickets and Atlassian products.
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-card-border">
              <h3 className="font-semibold text-foreground mb-2">Choose <em>Current</em> if:</h3>
              <p className="text-muted-foreground">
                You use Notion for documentation and Slack for communication, and you're tired of 
                knowledge becoming outdated. <em>Current</em> automatically detects when information in 
                Slack should update your Notion pages, saving hours of manual maintenance.
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-card-border border-primary/50">
              <h3 className="font-semibold text-foreground mb-2">Best of both worlds:</h3>
              <p className="text-muted-foreground">
                Many teams are migrating from Confluence to Notion for its flexibility and modern UX. 
                If you're considering that switch, <em>Current</em> makes it even more valuable by 
                ensuring your new Notion workspace stays accurate without constant manual updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready for Self-Updating Documentation?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Try <em>Current</em> free for 14 days. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2" data-testid="button-start-trial">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/book-demo">
              <Button size="lg" variant="outline" data-testid="button-book-demo">
                Book a Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-8 border-t border-card-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl"><em>Current</em></span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <Link href="/product" className="hover:text-foreground transition-colors">Product</Link>
              <Link href="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
              <Link href="/use-cases" className="hover:text-foreground transition-colors">Use Cases</Link>
              <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/compare/notion" className="hover:text-foreground transition-colors">Notion vs Current</Link>
              <Link href="/compare/guru" className="hover:text-foreground transition-colors">Guru vs Current</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-card-border text-center text-sm text-muted-foreground">
            © 2025 <em>Current</em>. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
