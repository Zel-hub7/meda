import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { CheckCircle, X, ArrowRight, Zap, FileText, RefreshCw, Users, ShieldAlert, FolderSearch } from "lucide-react";
import { SiGoogledocs } from "react-icons/si";
import { Badge } from "@/components/ui/badge";

export default function GoogleDocsVsCurrent() {
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
            Google Docs vs <em>Current</em>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Google Docs stores knowledge. <em>Current</em> keeps it accurate. One is a file cabinet, the other ensures what's inside stays true.
          </p>
        </div>
      </section>

      {/* Quick Answer */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl p-8 border border-card-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">The Quick Answer</h2>
            <p className="text-muted-foreground text-lg">
              <strong className="text-foreground">Google Docs</strong> is where most small teams store their SOPs, processes, and team knowledge. 
              It's free, familiar, and easy—but it has zero governance, no approval workflows, and no way to detect when documents become outdated.
              <strong className="text-foreground"> <em>Current</em></strong> is an AI layer that monitors your Slack and meetings, 
              automatically detecting when your Google Docs need updates and suggesting changes with human approval. 
              For many teams, Google Docs is the biggest "competitor"—and <em>Current</em> is the solution to its limitations.
            </p>
          </div>
        </div>
      </section>

      {/* Key Clarification */}
      <section className="py-12 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-8 border border-blue-200 dark:border-blue-800">
            <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              The Reality for Small Teams
            </h2>
            <p className="text-muted-foreground">
              Most small and growing teams don't use Notion or Confluence—they use Google Docs. It's already there, 
              it's free, and everyone knows how to use it. The problem? Documents become outdated within weeks, 
              and there's no way to know until someone stumbles on wrong information. <em>Current</em> solves this 
              without forcing you to switch tools.
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
                <SiGoogledocs className="w-5 h-5" /> Google Docs
              </div>
              <div className="font-semibold text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" /> <em>Current</em>
              </div>
            </div>
            
            {[
              { feature: "Free document editing", gdocs: true, current: false },
              { feature: "Real-time collaboration", gdocs: true, current: true },
              { feature: "Familiar interface", gdocs: true, current: true },
              { feature: "Basic sharing & permissions", gdocs: true, current: false },
              { feature: "Slack message monitoring", gdocs: false, current: true },
              { feature: "Meeting transcript sync", gdocs: false, current: true },
              { feature: "Automatic update suggestions", gdocs: false, current: true },
              { feature: "Knowledge drift detection", gdocs: false, current: true },
              { feature: "Approval workflow for changes", gdocs: false, current: true },
              { feature: "Source-linked updates", gdocs: false, current: true },
              { feature: "Knowledge governance", gdocs: false, current: true },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-4 p-6 border-b border-card-border last:border-0">
                <div className="text-muted-foreground">{row.feature}</div>
                <div>
                  {row.gdocs ? (
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

      {/* How They Differ */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">The Core Difference</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Google Docs is a file. <em>Current</em> is an intelligent layer that keeps your files accurate.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl p-8 border border-card-border">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
                <SiGoogledocs className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Google Docs Reality</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Free and universally accessible</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Everyone already knows how to use it</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>No way to detect outdated content</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-card rounded-xl p-8 border border-card-border">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3"><em>Current</em>'s Solution</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Monitors Slack and meetings for changes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>AI detects when docs become outdated</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Suggests updates with approval workflow</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Current Solves */}
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">Google Docs' Hidden Costs</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Google Docs is "free"—but the cost of outdated documentation compounds quickly. Here's what you're really paying:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <ShieldAlert className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Zero Governance</h3>
              <p className="text-sm text-muted-foreground">
                Anyone can edit anything with no approval process
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <RefreshCw className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Impossible to Maintain</h3>
              <p className="text-sm text-muted-foreground">
                Docs get outdated within weeks with no alerts
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <Users className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No Accountability</h3>
              <p className="text-sm text-muted-foreground">
                No clear owners or approval workflows for changes
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <FolderSearch className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No Drift Detection</h3>
              <p className="text-sm text-muted-foreground">
                You find out docs are wrong when mistakes happen
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Keep Your Google Docs <em>Current</em>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your 14-day free trial and see how <em>Current</em> keeps your documentation accurate—no matter where it lives.
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
              <Link href="/compare/slab" className="hover:text-foreground transition-colors">Slab vs Current</Link>
              <Link href="/compare/loom" className="hover:text-foreground transition-colors">Loom vs Current</Link>
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
