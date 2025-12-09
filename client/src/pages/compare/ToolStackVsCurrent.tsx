import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { CheckCircle, X, ArrowRight, Zap, Layers, RefreshCw, AlertTriangle, Search, Puzzle } from "lucide-react";
import { SiNotion, SiConfluence } from "react-icons/si";
import { Badge } from "@/components/ui/badge";

export default function ToolStackVsCurrent() {
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
            Replace 3 Tools with One System That Keeps Itself Updated
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stop juggling Guru + Notion + Confluence. <em>Current</em> consolidates your knowledge and automatically keeps it accurate across all sources.
          </p>
        </div>
      </section>

      {/* Quick Answer */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl p-8 border border-card-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">The Quick Answer</h2>
            <p className="text-muted-foreground text-lg">
              Many companies cobble together <strong className="text-foreground">2-3 knowledge tools</strong>—Guru for quick answers, Notion for docs, Confluence for technical specs. 
              This creates fragmented knowledge, multiple places to update, and inconsistent governance. 
              <strong className="text-foreground"> <em>Current</em></strong> is a unified AI layer that monitors all your sources and keeps them in sync—automatically detecting conflicts and suggesting updates across your entire knowledge ecosystem.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem Visualization */}
      <section className="py-16 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">The Multi-Tool Problem</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Multi-Tool Stack */}
            <div className="bg-card rounded-xl p-8 border border-card-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Typical Tool Stack</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <SiNotion className="w-6 h-6" />
                  <div>
                    <p className="font-medium text-foreground">Notion</p>
                    <p className="text-sm text-muted-foreground">Team wikis & docs</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-6 h-6 rounded bg-green-500 flex items-center justify-center text-white text-xs font-bold">G</div>
                  <div>
                    <p className="font-medium text-foreground">Guru</p>
                    <p className="text-sm text-muted-foreground">Quick answers & cards</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <SiConfluence className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="font-medium text-foreground">Confluence</p>
                    <p className="text-sm text-muted-foreground">Technical documentation</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm text-destructive font-medium">3 tools = 3 places to update</p>
                <p className="text-sm text-muted-foreground mt-1">Changes in one tool don't sync to others</p>
              </div>
            </div>
            
            {/* Current Solution */}
            <div className="bg-card rounded-xl p-8 border border-card-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground"><em>Current</em> Solution</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <CheckCircle className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Unified Monitoring</p>
                    <p className="text-sm text-muted-foreground">One AI watches all sources</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <CheckCircle className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Cross-Source Sync</p>
                    <p className="text-sm text-muted-foreground">Detects conflicts between tools</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <CheckCircle className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Single Approval Queue</p>
                    <p className="text-sm text-muted-foreground">Review all updates in one place</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">1 system = automatic consistency</p>
                <p className="text-sm text-muted-foreground mt-1">AI keeps everything in sync</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Stack vs Single System</h2>
          
          <div className="bg-card rounded-xl border border-card-border overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-6 border-b border-card-border bg-muted/50">
              <div className="font-semibold text-foreground">Capability</div>
              <div className="font-semibold text-foreground flex items-center gap-2">
                <Layers className="w-5 h-5" /> Multi-Tool Stack
              </div>
              <div className="font-semibold text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" /> <em>Current</em>
              </div>
            </div>
            
            {[
              { feature: "Single source of truth", stack: false, current: true },
              { feature: "One update applies everywhere", stack: false, current: true },
              { feature: "Automatic conflict detection", stack: false, current: true },
              { feature: "Unified search across sources", stack: false, current: true },
              { feature: "AI-powered update suggestions", stack: false, current: true },
              { feature: "Consistent governance policies", stack: false, current: true },
              { feature: "Single approval workflow", stack: false, current: true },
              { feature: "Slack conversation monitoring", stack: false, current: true },
              { feature: "Lower tool costs", stack: false, current: true },
              { feature: "Reduced context switching", stack: false, current: true },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-4 p-6 border-b border-card-border last:border-0">
                <div className="text-muted-foreground">{row.feature}</div>
                <div>
                  {row.stack ? (
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

      {/* The Problem Current Solves */}
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">The Real Cost of Tool Sprawl</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Multiple knowledge tools seem flexible—until you realize the hidden costs of keeping them all in sync.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <Puzzle className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Fragmented Knowledge</h3>
              <p className="text-sm text-muted-foreground">
                Information lives in multiple places with no single source of truth
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <RefreshCw className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Update Fatigue</h3>
              <p className="text-sm text-muted-foreground">
                Every change requires updates in 2-3 different systems
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <Search className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Search Confusion</h3>
              <p className="text-sm text-muted-foreground">
                Teams don't know which tool has the correct, current answer
              </p>
            </div>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <AlertTriangle className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Inconsistent Governance</h3>
              <p className="text-sm text-muted-foreground">
                Different approval processes and ownership models per tool
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <Layers className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Higher Costs</h3>
              <p className="text-sm text-muted-foreground">
                Paying for multiple tool subscriptions adds up quickly
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <RefreshCw className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Version Conflicts</h3>
              <p className="text-sm text-muted-foreground">
                Same topic, different answers across tools
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Consolidate and Stay <em>Current</em>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your 14-day free trial and see how <em>Current</em> can replace your fragmented tool stack with a single, self-updating knowledge system.
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
              <Link href="/compare/confluence" className="hover:text-foreground transition-colors">Confluence vs Current</Link>
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
