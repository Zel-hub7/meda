import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Zap, Clock, AlertTriangle, Brain, RefreshCw, CheckCircle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ManualDocumentationVsCurrent() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="mb-4">
            The Real Competitor
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
            You don't need more documentation—you need documentation that stays accurate.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manual updates are the silent killer of every knowledge base. <em>Current</em> automates what humans forget to do.
          </p>
        </div>
      </section>

      {/* The Real Problem */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl p-8 border border-card-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">The Real Problem</h2>
            <p className="text-muted-foreground text-lg mb-6">
              Every team has the same story: You launch a knowledge base with great intentions. 
              For the first few weeks, people update it. Then reality hits—everyone's busy, 
              updates get skipped, and within months your "single source of truth" is full of 
              half-truths and outdated information.
            </p>
            <p className="text-muted-foreground text-lg">
              <strong className="text-foreground">The problem isn't that people don't want to update docs.</strong> 
              It's that manual documentation requires constant human effort, and humans have other priorities. 
              Every manual update is time stolen from actual work.
            </p>
          </div>
        </div>
      </section>

      {/* Why This Happens */}
      <section className="py-16 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">Why This Happens</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Manual documentation fails for predictable, human reasons. Here are the symptoms every team recognizes:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl p-6 border border-card-border">
              <Clock className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Time Pressure</h3>
              <p className="text-sm text-muted-foreground">
                When deadlines hit, documentation is the first thing to get deprioritized. 
                "I'll update it later" becomes "I forgot it existed."
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border">
              <AlertTriangle className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Context Switching</h3>
              <p className="text-sm text-muted-foreground">
                The person who knows the answer is deep in work. Stopping to update docs 
                breaks their flow—so they don't.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border">
              <Brain className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Invisible Decay</h3>
              <p className="text-sm text-muted-foreground">
                Outdated docs don't announce themselves. By the time someone notices, 
                the damage is done—wrong decisions have been made.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border">
              <Users className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Diffuse Responsibility</h3>
              <p className="text-sm text-muted-foreground">
                When everyone owns documentation, no one owns it. Updates fall through 
                the cracks because there's no clear owner.
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
            <em>Current</em> removes the manual work from documentation maintenance. Here's how:
          </p>
          
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Automatic Detection</h3>
                <p className="text-muted-foreground">
                  <em>Current</em> monitors your Slack conversations and automatically identifies 
                  when something has changed that should be reflected in your docs. No one has 
                  to remember to update—the system catches it.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">AI-Generated Updates</h3>
                <p className="text-muted-foreground">
                  Instead of someone stopping their work to write an update, <em>Current</em>'s AI 
                  drafts the change for you. It understands context, maintains your tone, and 
                  shows you exactly what will change.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">One-Click Approval</h3>
                <p className="text-muted-foreground">
                  Humans stay in control. You review the proposed change, approve with one click, 
                  and <em>Current</em> syncs it to your docs. The total time investment? About 30 seconds 
                  instead of 15 minutes.
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
            Stop Fighting Manual Updates
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your 14-day free trial and let <em>Current</em> handle the documentation work 
            that no one has time for.
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
              <Link href="/compare/tribal-knowledge" className="hover:text-foreground transition-colors">Tribal Knowledge</Link>
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
