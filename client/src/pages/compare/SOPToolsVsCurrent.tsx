import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Zap, FileText, RefreshCw, AlertTriangle, CheckSquare, GitBranch, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SOPToolsVsCurrent() {
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
            SOP Tools vs <em>Current</em>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            SOP tools manage documents. <em>Current</em> is a self-updating source of truth that keeps procedures aligned with reality.
          </p>
        </div>
      </section>

      {/* Quick Answer */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl p-8 border border-card-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">The Quick Answer</h2>
            <p className="text-muted-foreground text-lg">
              <strong className="text-foreground">SOP tools</strong> help you create, organize, and distribute standard operating procedures—but they rely on humans to keep those procedures updated. 
              <strong className="text-foreground"> <em>Current</em></strong> monitors your team's Slack conversations and automatically detects when processes change, suggesting updates to keep your SOPs aligned with how work actually gets done.
              SOPs are only useful if they reflect reality. <em>Current</em> ensures they do.
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
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Traditional SOP Tools</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Document management</strong> — great at organizing, but blind to real-world changes</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Manual updates only</strong> — SOPs change when someone remembers to update them</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Process drift</strong> — actual practices diverge from documented procedures</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Compliance risk</strong> — outdated SOPs create audit and quality issues</span>
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
                  <span><strong className="text-foreground">Active monitoring</strong> — watches conversations for process changes</span>
                </li>
                <li className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Automatic suggestions</strong> — AI proposes SOP updates for review</span>
                </li>
                <li className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Reality-aligned</strong> — keeps documentation in sync with actual practices</span>
                </li>
                <li className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Audit-ready</strong> — always-current SOPs reduce compliance risk</span>
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
            <em>Current</em> isn't just SOP management—it's a self-updating source of truth for your operational knowledge.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <CheckSquare className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Catches Process Changes</h3>
              <p className="text-sm text-muted-foreground">
                When a manager says "we're changing how we do X" in Slack, <em>Current</em> catches it and suggests an SOP update.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <GitBranch className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Prevents Drift</h3>
              <p className="text-sm text-muted-foreground">
                No more gap between how things are documented and how they're actually done. SOPs stay aligned with reality.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <Target className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Ensures Accuracy</h3>
              <p className="text-sm text-muted-foreground">
                Every suggested change is human-reviewed. You maintain control while eliminating the maintenance burden.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The SOP Problem */}
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">The SOP Accuracy Problem</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Standard Operating Procedures are only valuable if they're accurate. Here's the challenge:
          </p>
          
          <div className="bg-card rounded-xl p-8 border border-card-border">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 text-xl">📋</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">SOPs Are Written Once</h4>
                  <p className="text-muted-foreground">A process is documented carefully when it's first established. The SOP is accurate on day one.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-yellow-600 text-xl">💬</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Reality Evolves in Conversations</h4>
                  <p className="text-muted-foreground">"Hey team, we're changing the approval workflow starting Monday." A Slack message changes everything—but the SOP doesn't know.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 text-xl">⚠️</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">The Gap Grows</h4>
                  <p className="text-muted-foreground">New hires follow the documented (wrong) process. Experienced staff know the real process. Quality suffers.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground"><em>Current</em> Bridges the Gap</h4>
                  <p className="text-muted-foreground">AI monitors Slack for process changes, suggests SOP updates, and keeps your documentation aligned with reality—automatically.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Keep Your SOPs <em>Current</em>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your 14-day free trial and see how <em>Current</em> keeps your standard operating procedures aligned with how work actually gets done.
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
              <Link href="/compare/knowledge-base" className="hover:text-foreground transition-colors">Knowledge Base vs Current</Link>
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
