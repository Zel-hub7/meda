import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { CheckCircle, X, ArrowRight, Zap, BookOpen, RefreshCw, Users, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HelpjuiceVsCurrent() {
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
            Helpjuice vs <em>Current</em>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Helpjuice publishes knowledge to customers. <em>Current</em> keeps that knowledge accurate—automatically detecting when your internal decisions should update external docs.
          </p>
        </div>
      </section>

      {/* Quick Answer */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl p-8 border border-card-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">The Quick Answer</h2>
            <p className="text-muted-foreground text-lg">
              <strong className="text-foreground">Helpjuice</strong> (and similar tools like Document360) are purpose-built for publishing external knowledge bases—help centers, FAQs, and customer-facing documentation. 
              <strong className="text-foreground"> <em>Current</em></strong> is an AI governance layer that monitors your Slack conversations and automatically detects when internal decisions should trigger updates to your knowledge base. 
              Helpjuice excels at presentation; <em>Current</em> ensures the content stays accurate.
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
                <BookOpen className="w-5 h-5 text-orange-500" /> Helpjuice
              </div>
              <div className="font-semibold text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" /> <em>Current</em>
              </div>
            </div>
            
            {[
              { feature: "Customer-facing knowledge base", helpjuice: true, current: false },
              { feature: "Beautiful public documentation", helpjuice: true, current: false },
              { feature: "Search analytics & insights", helpjuice: true, current: false },
              { feature: "Custom branding & themes", helpjuice: true, current: false },
              { feature: "AI-powered content detection", helpjuice: false, current: true },
              { feature: "Slack message monitoring", helpjuice: false, current: true },
              { feature: "Automatic update suggestions", helpjuice: false, current: true },
              { feature: "Human-in-the-loop approval", helpjuice: false, current: true },
              { feature: "Knowledge drift detection", helpjuice: false, current: true },
              { feature: "Internal-to-external sync triggers", helpjuice: false, current: true },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-4 p-6 border-b border-card-border last:border-0">
                <div className="text-muted-foreground">{row.feature}</div>
                <div>
                  {row.helpjuice ? (
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

      {/* How They Work Together */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">Better Together for Support Teams</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Your support team uses Helpjuice to publish help articles. <em>Current</em> ensures those articles stay accurate as your product evolves.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl p-8 border border-card-border">
              <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Helpjuice's Strength</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Beautiful, searchable help centers for customers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Analytics on what customers are searching for</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>SEO-optimized public documentation</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-card rounded-xl p-8 border border-card-border">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3"><em>Current</em>'s Strength</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Detects when product changes affect help articles</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>AI suggests updates before customers notice errors</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Human approval ensures quality control</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Current Solves */}
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">The Hidden Cost of Outdated Help Docs</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Static knowledge bases create real problems for support teams—increased ticket volume, frustrated customers, and wasted agent time.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <Users className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Increased Tickets</h3>
              <p className="text-sm text-muted-foreground">
                Customers can't self-serve when help articles are outdated or incorrect
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <AlertCircle className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Customer Frustration</h3>
              <p className="text-sm text-muted-foreground">
                Following outdated instructions leads to failed workflows and complaints
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <RefreshCw className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Manual Review Burden</h3>
              <p className="text-sm text-muted-foreground">
                Support teams spend hours reviewing docs that might or might not need updates
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Keep Your Help Center <em>Current</em>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your 14-day free trial and see how <em>Current</em> helps support teams maintain accurate documentation—automatically.
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
              <Link href="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
              <Link href="/use-cases" className="hover:text-foreground transition-colors">Use Cases</Link>
              <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/compare/notion" className="hover:text-foreground transition-colors">Notion vs Current</Link>
              <Link href="/compare/guru" className="hover:text-foreground transition-colors">Guru vs Current</Link>
              <Link href="/compare/tool-stack" className="hover:text-foreground transition-colors">Tool Stack vs Current</Link>
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
