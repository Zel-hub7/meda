import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Zap, FileEdit, Calendar, AlertCircle, TrendingDown, Brain, CheckCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function KeepingDocsUpdatedVsCurrent() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="mb-4">
            The Hidden Cost
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
            The Hardest Part of Documentation Isn't Writing—It's Updating
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Initial docs are easy. Maintenance is the killer. <em>Current</em> handles the part that actually matters.
          </p>
        </div>
      </section>

      {/* The Real Problem */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl p-8 border border-card-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">The Real Problem</h2>
            <p className="text-muted-foreground text-lg mb-6">
              Everyone loves a fresh knowledge base. The launch goes great—clean docs, 
              excited team, a promise that "this time we'll keep it updated." Fast forward 
              three months: half the pages are stale, nobody trusts the information, and 
              people are back to asking in Slack.
            </p>
            <p className="text-muted-foreground text-lg">
              <strong className="text-foreground">Writing documentation once is relatively easy.</strong> 
              Keeping it accurate as your company changes, processes evolve, and decisions 
              get made—that's where every knowledge base dies. The maintenance burden is 
              invisible, relentless, and always loses to "real work."
            </p>
          </div>
        </div>
      </section>

      {/* Why This Happens */}
      <section className="py-16 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">Why This Happens</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Documentation maintenance fails for systemic reasons that no amount of good intentions can fix:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl p-6 border border-card-border">
              <FileEdit className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Updates Are an Afterthought</h3>
              <p className="text-sm text-muted-foreground">
                When something changes, updating the docs is never the first priority. 
                It gets added to a to-do list, pushed to "later," and eventually forgotten.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border">
              <Calendar className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No Trigger for Updates</h3>
              <p className="text-sm text-muted-foreground">
                There's no moment when someone is prompted to update docs. Changes happen 
                organically—in meetings, Slack, emails—with no connection to the knowledge base.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border">
              <AlertCircle className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Outdated Docs Look the Same</h3>
              <p className="text-sm text-muted-foreground">
                There's no visual difference between a page updated yesterday and one 
                updated a year ago. Decay is invisible until someone gets burned.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border">
              <TrendingDown className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Trust Erodes Quickly</h3>
              <p className="text-sm text-muted-foreground">
                One bad experience with outdated docs teaches people not to rely on them. 
                Once trust is gone, even updated pages get ignored.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Current Solves This */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">How <em>Current</em> Solves This</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            <em>Current</em> turns documentation maintenance from a human burden into an automated process.
          </p>
          
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Continuous Knowledge Monitoring</h3>
                <p className="text-muted-foreground">
                  <em>Current</em> watches your Slack in real-time. When information changes—a 
                  new process, an updated policy, a corrected procedure—it catches the change 
                  the moment it happens, not months later.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Proactive Update Proposals</h3>
                <p className="text-muted-foreground">
                  Instead of waiting for someone to remember to update docs, <em>Current</em> proactively 
                  creates update proposals. You see exactly what changed and what the new 
                  documentation should say—before anyone even asks.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Zero-Friction Updates</h3>
                <p className="text-muted-foreground">
                  Review the proposed change, click approve, and it's done. The update syncs 
                  to your documentation instantly. What used to take 15 minutes of context-switching 
                  now takes 30 seconds of approval.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Make Documentation Maintenance Effortless
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your 14-day free trial and let <em>Current</em> handle the updates 
            that your team never has time for.
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
              <Link href="/compare/manual-documentation" className="hover:text-foreground transition-colors">Manual Documentation</Link>
              <Link href="/compare/tribal-knowledge" className="hover:text-foreground transition-colors">Tribal Knowledge</Link>
              <Link href="/compare/searching-slack" className="hover:text-foreground transition-colors">Searching Slack</Link>
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
