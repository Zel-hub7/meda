import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { CheckCircle, X, ArrowRight, Zap, FileText, RefreshCw, Clock, AlertTriangle } from "lucide-react";
import { SiDropbox } from "react-icons/si";
import { Badge } from "@/components/ui/badge";

export default function DropboxPaperVsCurrent() {
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
            Dropbox Paper vs <em>Current</em>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Paper is great for lightweight collaboration. <em>Current</em> ensures your docs stay accurate over time—even when decisions happen in Slack.
          </p>
        </div>
      </section>

      {/* Quick Answer */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl p-8 border border-card-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">The Quick Answer</h2>
            <p className="text-muted-foreground text-lg">
              <strong className="text-foreground">Dropbox Paper</strong> is a simple, lightweight tool for real-time collaboration on documents. 
              <strong className="text-foreground"> <em>Current</em></strong> is an AI-powered knowledge governance layer that monitors your Slack conversations 
              and automatically suggests updates when information in your docs becomes outdated. 
              Paper excels at quick collaboration, but lacks the automation to maintain long-term documentation accuracy.
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
                <SiDropbox className="w-5 h-5 text-blue-500" /> Dropbox Paper
              </div>
              <div className="font-semibold text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" /> <em>Current</em>
              </div>
            </div>
            
            {[
              { feature: "Real-time document editing", paper: true, current: false },
              { feature: "Lightweight collaboration", paper: true, current: false },
              { feature: "Task management basics", paper: true, current: false },
              { feature: "Meeting notes templates", paper: true, current: false },
              { feature: "AI-powered content detection", paper: false, current: true },
              { feature: "Slack message monitoring", paper: false, current: true },
              { feature: "Automatic update suggestions", paper: false, current: true },
              { feature: "Human-in-the-loop approval", paper: false, current: true },
              { feature: "Knowledge drift detection", paper: false, current: true },
              { feature: "Long-term accuracy tracking", paper: false, current: true },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-4 p-6 border-b border-card-border last:border-0">
                <div className="text-muted-foreground">{row.feature}</div>
                <div>
                  {row.paper ? (
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
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">Different Problems, Different Solutions</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Paper and <em>Current</em> solve fundamentally different challenges in your knowledge workflow:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl p-8 border border-card-border">
              <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center mb-6">
                <SiDropbox className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Dropbox Paper Excels At</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Quick brainstorming and meeting notes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Simple, distraction-free writing experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Ad-hoc team collaboration on projects</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-card rounded-xl p-8 border border-card-border">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3"><em>Current</em> Excels At</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Keeping documentation accurate over time</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Detecting when Slack conversations invalidate docs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>AI-powered governance with human approval</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Current Solves */}
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">Why Ops Teams Struggle with Paper</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Dropbox Paper is beloved for its simplicity—but simplicity has limits when it comes to long-term documentation accuracy.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <Clock className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No Update Triggers</h3>
              <p className="text-sm text-muted-foreground">
                Paper has no way to know when a doc becomes outdated from conversations elsewhere
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <FileText className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Static Once Written</h3>
              <p className="text-sm text-muted-foreground">
                Docs stay as-is until someone manually remembers to update them
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <AlertTriangle className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Knowledge Drift</h3>
              <p className="text-sm text-muted-foreground">
                Teams lose trust in docs that fall out of sync with reality
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Keep Your Documentation <em>Current</em>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your 14-day free trial and see how <em>Current</em> keeps your knowledge base accurate—whether you use Paper, Notion, or any other tool.
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
              <Link href="/compare/helpjuice" className="hover:text-foreground transition-colors">Helpjuice vs Current</Link>
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
