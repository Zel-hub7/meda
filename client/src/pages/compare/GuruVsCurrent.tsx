import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { CheckCircle, X, ArrowRight, Zap, Search, Sparkles, Brain, Bot, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function GuruVsCurrent() {
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
            Guru vs <em>Current</em>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Both use AI for knowledge management, but with different approaches. Guru focuses on search and cards. <em>Current</em> focuses on keeping your existing knowledge base accurate.
          </p>
        </div>
      </section>

      {/* Quick Answer */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl p-8 border border-card-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">The Quick Answer</h2>
            <p className="text-muted-foreground text-lg">
              <strong className="text-foreground">Guru</strong> is a knowledge management platform with AI-powered search, 
              verification workflows, and browser/Slack extensions for surfacing knowledge cards.
              <strong className="text-foreground"> <em>Current</em></strong> is an AI layer that monitors Slack and 
              automatically suggests updates to your Notion workspace when information changes. 
              Guru replaces your wiki; <em>Current</em> enhances your existing Notion setup.
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
                <Sparkles className="w-5 h-5 text-purple-600" /> Guru
              </div>
              <div className="font-semibold text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" /> <em>Current</em>
              </div>
            </div>
            
            {[
              { feature: "Knowledge card system", guru: true, current: false },
              { feature: "AI-powered search", guru: true, current: false },
              { feature: "Browser extension", guru: true, current: false },
              { feature: "Verification workflows", guru: true, current: true },
              { feature: "Slack bot for surfacing info", guru: true, current: false },
              { feature: "AI content extraction from Slack", guru: false, current: true },
              { feature: "Automatic update detection", guru: false, current: true },
              { feature: "Works with your existing Notion", guru: false, current: true },
              { feature: "Real-time Slack monitoring", guru: false, current: true },
              { feature: "Dual AI validation (extraction + review)", guru: false, current: true },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-4 p-6 border-b border-card-border last:border-0">
                <div className="text-muted-foreground">{row.feature}</div>
                <div>
                  {row.guru ? (
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
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">Different Approaches to AI</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Both tools use AI, but for different purposes
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl p-8 border border-card-border">
              <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Guru's AI Approach</h3>
              <p className="text-muted-foreground mb-4">
                AI helps you find and surface existing knowledge through intelligent search and recommendations.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Search className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Semantic search across your knowledge base</span>
                </li>
                <li className="flex items-start gap-2">
                  <Bot className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>AI suggests relevant cards in context</span>
                </li>
                <li className="flex items-start gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Answers questions from your knowledge</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-card rounded-xl p-8 border border-card-border">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3"><em>Current</em>'s AI Approach</h3>
              <p className="text-muted-foreground mb-4">
                AI detects when information changes and proposes updates to keep your knowledge base accurate.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Brain className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Extracts knowledge-worthy content from Slack</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Validates with second AI model for accuracy</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Proposes specific updates to Notion pages</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Key Differentiators */}
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">Key Differentiators</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            What makes <em>Current</em> unique
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Works with Notion</h3>
              <p className="text-sm text-muted-foreground">
                No need to migrate—<em>Current</em> enhances your existing Notion workspace
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Proactive Updates</h3>
              <p className="text-sm text-muted-foreground">
                AI monitors Slack and proposes updates automatically, not just when you search
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Human Approval</h3>
              <p className="text-sm text-muted-foreground">
                Every suggestion goes through human review before updating your knowledge base
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
              <h3 className="font-semibold text-foreground mb-2">Choose Guru if:</h3>
              <p className="text-muted-foreground">
                You want an all-in-one knowledge management platform that replaces your current wiki. 
                Guru is great for teams that need AI-powered search, verification workflows, and 
                browser extensions to surface knowledge in context. It's a complete knowledge platform.
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-card-border">
              <h3 className="font-semibold text-foreground mb-2">Choose <em>Current</em> if:</h3>
              <p className="text-muted-foreground">
                You already use Notion and love it, but struggle to keep documentation up-to-date. 
                <em>Current</em> integrates with your existing Notion workspace and automatically 
                detects when Slack conversations contain information that should update your docs. 
                It's a maintenance layer, not a replacement.
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-card-border border-primary/50">
              <h3 className="font-semibold text-foreground mb-2">The <em>Current</em> advantage:</h3>
              <p className="text-muted-foreground">
                Unlike Guru, <em>Current</em> doesn't require you to migrate to a new platform. 
                Your team can keep using Notion as they already do, while <em>Current</em> works 
                in the background to ensure information stays accurate. Less change management, 
                faster adoption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Keep Using Notion. Let <em>Current</em> Keep It Accurate.
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Try <em>Current</em> free for 14 days. Works with your existing Notion workspace.
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
              <Link href="/compare/confluence" className="hover:text-foreground transition-colors">Confluence vs Current</Link>
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
