import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Zap, Search, RefreshCw, AlertTriangle, Database, FileEdit, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AIKnowledgeToolsVsCurrent() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="mb-4">
            Enterprise Comparison
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
            Glean vs <em>Current</em>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Glean finds answers. <em>Current</em> updates the answers. One is an AI search layer, the other is the canonical update system.
          </p>
        </div>
      </section>

      {/* Quick Answer */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl p-8 border border-card-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">The Quick Answer</h2>
            <p className="text-muted-foreground text-lg">
              <strong className="text-foreground">Glean, Guru, and similar AI knowledge tools</strong> index your existing content and make it searchable with AI—but they don't update the underlying documents. When information changes, those docs stay stale.
              <strong className="text-foreground"> <em>Current</em></strong> is fundamentally different: it monitors your Slack conversations and automatically suggests updates to your documentation. 
              The search tools help you find what exists. <em>Current</em> ensures what exists is accurate.
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
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">AI Search Tools (Glean, etc.)</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Index existing content</strong> — makes your docs searchable, but doesn't verify accuracy</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">AI answers from stale data</strong> — if docs are wrong, AI answers are wrong</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Read-only layer</strong> — finds information but never updates the source</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Amplifies stale content</strong> — makes outdated info easier to find, not more accurate</span>
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
                  <span><strong className="text-foreground">Monitors for changes</strong> — watches Slack for knowledge that needs updating</span>
                </li>
                <li className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Updates the source</strong> — fixes docs at the source, not just the search layer</span>
                </li>
                <li className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Write-capable</strong> — suggests and applies updates with human approval</span>
                </li>
                <li className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Improves accuracy</strong> — makes your docs trustworthy, not just searchable</span>
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
            <em>Current</em> is the canonical update system for your documentation. It doesn't just help you find answers—it ensures those answers are correct.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <Database className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Source of Truth</h3>
              <p className="text-sm text-muted-foreground">
                <em>Current</em> updates your actual documentation—Notion, Confluence, or wherever you keep knowledge. It's not a search layer on top.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <FileEdit className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Write, Not Just Read</h3>
              <p className="text-sm text-muted-foreground">
                AI search tools are read-only. <em>Current</em> writes updates back to your docs with human approval in the loop.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <Building2 className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Enterprise-Grade</h3>
              <p className="text-sm text-muted-foreground">
                Confidence scoring, approval workflows, and audit trails. Built for organizations that need accuracy and accountability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Enterprise Problem */}
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">The Enterprise Knowledge Problem</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            AI search tools solve discoverability. But finding answers doesn't help if those answers are wrong.
          </p>
          
          <div className="bg-card rounded-xl p-8 border border-card-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  What AI Search Does
                </h4>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Indexes documents across your stack</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Provides AI-powered search results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Summarizes and synthesizes content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span>Does NOT update stale documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span>Does NOT detect when info is outdated</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span>Does NOT fix accuracy at the source</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  What <em>Current</em> Does
                </h4>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Monitors Slack for knowledge changes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Detects when docs contradict reality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Suggests specific updates to documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Syncs approved changes to your docs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Maintains accuracy at the source</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Creates audit trail of all changes</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-card-border">
              <p className="text-foreground font-medium text-center">
                AI search makes stale content easier to find. <em>Current</em> makes your content accurate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Better Together Note */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-primary/5 rounded-xl p-8 border border-primary/20">
            <h3 className="text-xl font-semibold text-foreground mb-4 text-center">They Work Together</h3>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              <em>Current</em> and AI search tools are complementary. Use Glean to find information across your organization. 
              Use <em>Current</em> to ensure that information is accurate. Better search on accurate docs = better outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Make Your Knowledge Base Canonical
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your 14-day free trial and see how <em>Current</em> transforms your documentation from searchable to trustworthy.
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
