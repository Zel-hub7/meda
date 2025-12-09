import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Zap, UserMinus, MessageSquare, Lock, HelpCircle, Brain, CheckCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TribalKnowledgeVsCurrent() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="mb-4">
            Knowledge Risk
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
            Stop Losing Knowledge to Tribal Memory
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Critical information lives in people's heads, leaves when they leave, and was never documented in the first place. <em>Current</em> captures it before it's gone.
          </p>
        </div>
      </section>

      {/* The Real Problem */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl p-8 border border-card-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">The Real Problem</h2>
            <p className="text-muted-foreground text-lg mb-6">
              Your most experienced team members hold institutional knowledge that exists 
              nowhere else. They know why that system was built that way, what the client 
              actually meant, and which workarounds actually work. When they leave—or even 
              go on vacation—that knowledge goes with them.
            </p>
            <p className="text-muted-foreground text-lg">
              <strong className="text-foreground">The real cost isn't just onboarding new hires.</strong> 
              It's the mistakes that get repeated, the decisions that get reversed, and the 
              hours spent rediscovering what someone once knew. Tribal knowledge is a ticking 
              time bomb for scaling teams.
            </p>
          </div>
        </div>
      </section>

      {/* Why This Happens */}
      <section className="py-16 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">Why This Happens</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Tribal knowledge accumulates naturally—and documenting it feels unnatural. Here's why it stays trapped:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl p-6 border border-card-border">
              <MessageSquare className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Knowledge Flows in Conversations</h3>
              <p className="text-sm text-muted-foreground">
                The best explanations happen in Slack threads, meetings, and quick chats. 
                These moments are rich with context—and completely ephemeral.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border">
              <Lock className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Experts Don't Realize What They Know</h3>
              <p className="text-sm text-muted-foreground">
                The curse of knowledge: people who deeply understand something can't always 
                identify what's worth documenting. It's "obvious" to them.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border">
              <HelpCircle className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">"Just Ask Me" Culture</h3>
              <p className="text-sm text-muted-foreground">
                It's faster to ask the person who knows than to document it properly. 
                Until that person is unavailable—or gone.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border">
              <UserMinus className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No Offboarding Process</h3>
              <p className="text-sm text-muted-foreground">
                When someone leaves, there's rarely a systematic way to capture what they 
                know. By then, it's too late to remember everything.
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
            <em>Current</em> captures tribal knowledge as it's shared—before it can be lost.
          </p>
          
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">AI That Recognizes Knowledge Worth Keeping</h3>
                <p className="text-muted-foreground">
                  <em>Current</em> monitors your Slack conversations and identifies when someone 
                  shares something important—a process explanation, a decision rationale, 
                  a workaround that works. It flags these moments automatically.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Automatic Documentation Proposals</h3>
                <p className="text-muted-foreground">
                  When <em>Current</em> spots knowledge that should be documented, it drafts the 
                  update for you. The expert doesn't have to stop and write—they just 
                  approve what the AI captured from their explanation.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Knowledge That Persists</h3>
                <p className="text-muted-foreground">
                  With one-click approval, that tribal knowledge becomes permanent documentation. 
                  New hires can find it. The next person who needs it won't have to ask. 
                  And when the expert moves on, the knowledge stays.
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
            Capture What Your Team Knows—Before It's Gone
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your 14-day free trial and turn tribal knowledge into documented knowledge 
            with <em>Current</em>.
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
              <Link href="/compare/searching-slack" className="hover:text-foreground transition-colors">Searching Slack</Link>
              <Link href="/compare/keeping-docs-updated" className="hover:text-foreground transition-colors">Keeping Docs Updated</Link>
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
