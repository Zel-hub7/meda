import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Zap, Database, RefreshCw, AlertTriangle, TrendingDown, Shield, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function KnowledgeBaseVsCurrent() {
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
            Knowledge Base vs <em>Current</em>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Knowledge bases organize information. <em>Current</em> keeps it fresh. One structures content, the other prevents decay.
          </p>
        </div>
      </section>

      {/* Quick Answer */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl p-8 border border-card-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">The Quick Answer</h2>
            <p className="text-muted-foreground text-lg">
              <strong className="text-foreground">Knowledge bases</strong> are systems for organizing and storing team knowledge—but they decay without constant maintenance. 
              <strong className="text-foreground"> <em>Current</em></strong> is an AI layer that monitors your team's Slack conversations and automatically suggests updates to keep your knowledge base accurate. 
              Think of it as an anti-decay system for your existing knowledge base.
            </p>
          </div>
        </div>
      </section>

      {/* Key Differences */}
      <section className="py-16 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">The Fundamental Difference</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl p-8 border border-card-border">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-6">
                <Database className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Knowledge Bases</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Static by nature</strong> — content only changes when someone manually edits it</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Decay over time</strong> — accuracy degrades as reality changes faster than docs</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Maintenance burden</strong> — requires dedicated effort to keep updated</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Trust issues</strong> — outdated content erodes team confidence</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-card rounded-xl p-8 border border-card-border">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4"><em>Current</em></h3>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Dynamic monitoring</strong> — watches for changes in real-time conversations</span>
                </li>
                <li className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Prevents decay</strong> — catches outdated info before it becomes a problem</span>
                </li>
                <li className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Automated maintenance</strong> — AI does the heavy lifting, humans approve</span>
                </li>
                <li className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Builds trust</strong> — team knows docs are always accurate</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Current is Different */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">Why <em>Current</em> is Different</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            <em>Current</em> is built on one insight: the best knowledge base is the one you can trust. And trust requires freshness.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <TrendingDown className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Fights Entropy</h3>
              <p className="text-sm text-muted-foreground">
                Information naturally becomes outdated. <em>Current</em> actively fights this entropy by detecting and suggesting updates.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Maintains Accuracy</h3>
              <p className="text-sm text-muted-foreground">
                Every update is AI-suggested and human-approved, ensuring your knowledge base stays both current and correct.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Works With Any KB</h3>
              <p className="text-sm text-muted-foreground">
                <em>Current</em> integrates with Notion, Confluence, and other platforms. It enhances what you already use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Decay Problem */}
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">The Knowledge Decay Problem</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Research shows that knowledge base content becomes significantly outdated within months. Here's why:
          </p>
          
          <div className="bg-card rounded-xl p-8 border border-card-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-foreground mb-4">Why Knowledge Decays</h4>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Decisions happen in Slack, not in docs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Processes evolve faster than documentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Nobody owns documentation maintenance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>Updating docs is tedious and low-priority</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">How <em>Current</em> Prevents This</h4>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">•</span>
                    <span>Monitors Slack for knowledge-worthy changes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">•</span>
                    <span>AI detects when docs contradict reality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">•</span>
                    <span>Automatically suggests updates for approval</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">•</span>
                    <span>One-click approval syncs changes to your KB</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Stop Knowledge Decay. Stay <em>Current</em>.
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your 14-day free trial and see how <em>Current</em> keeps your knowledge base fresh automatically.
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
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link href="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
              <Link href="/use-cases" className="hover:text-foreground transition-colors">Use Cases</Link>
              <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/compare/notion" className="hover:text-foreground transition-colors">Notion vs Current</Link>
              <Link href="/compare/internal-wiki" className="hover:text-foreground transition-colors">Internal Wiki vs Current</Link>
              <Link href="/compare/sop-tools" className="hover:text-foreground transition-colors">SOP Tools vs Current</Link>
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
