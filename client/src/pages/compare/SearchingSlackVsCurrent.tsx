import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Zap, Search, Clock, MessageSquare, FileQuestion, Brain, CheckCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SiSlack } from "react-icons/si";

export default function SearchingSlackVsCurrent() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="mb-4">
            Daily Frustration
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
            Stop Searching Slack for Answers
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Slack is real-time. Your docs are static. <em>Current</em> is the bridge that keeps them in sync.
          </p>
        </div>
      </section>

      {/* The Real Problem */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl p-8 border border-card-border">
            <div className="flex items-center gap-3 mb-4">
              <SiSlack className="w-8 h-8 text-[#4A154B]" />
              <h2 className="text-2xl font-bold text-foreground">The Real Problem</h2>
            </div>
            <p className="text-muted-foreground text-lg mb-6">
              You know the drill: You need an answer. You check the docs—they're outdated or 
              incomplete. So you search Slack. You scroll through threads from six months ago. 
              You find three different answers from three different people. You still don't 
              know what's current.
            </p>
            <p className="text-muted-foreground text-lg">
              <strong className="text-foreground">Slack was designed for communication, not documentation.</strong> 
              It's where real decisions happen, but it's a terrible place to find them later. 
              Every hour spent searching Slack is an hour lost to friction that shouldn't exist.
            </p>
          </div>
        </div>
      </section>

      {/* Why This Happens */}
      <section className="py-16 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">Why This Happens</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Slack is where work happens—but it was never meant to be where knowledge lives. Here's the disconnect:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl p-6 border border-card-border">
              <Search className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Slack Search Is Broken by Design</h3>
              <p className="text-sm text-muted-foreground">
                Slack search returns messages, not answers. You get 50 results and no way to 
                know which one is still accurate or who has the final word.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border">
              <MessageSquare className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Conversations Aren't Structured</h3>
              <p className="text-sm text-muted-foreground">
                The answer you need is buried in a 47-message thread, sandwiched between 
                jokes and tangents. Context is scattered; conclusions are implicit.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border">
              <Clock className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Information Decays Invisibly</h3>
              <p className="text-sm text-muted-foreground">
                That answer from three months ago? It might still be right. It might not. 
                Slack doesn't tell you—and neither does anyone else.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border">
              <FileQuestion className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Docs Fall Behind Immediately</h3>
              <p className="text-sm text-muted-foreground">
                Someone announces a change in Slack. No one updates the docs. Now you 
                have two sources of truth—and they contradict each other.
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
            <em>Current</em> watches Slack so you don't have to. When knowledge changes, your docs change too.
          </p>
          
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">AI That Monitors Your Channels</h3>
                <p className="text-muted-foreground">
                  <em>Current</em> reads your Slack conversations and identifies when something 
                  important happens—a decision, a process change, a new answer to a common 
                  question. It catches what humans would miss.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Automatic Update Proposals</h3>
                <p className="text-muted-foreground">
                  When <em>Current</em> detects that your docs need updating, it drafts the change 
                  for you. You see exactly what changed in Slack and exactly how it should 
                  be reflected in your docs.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">One Source of Truth—Maintained</h3>
                <p className="text-muted-foreground">
                  With one click, the update syncs to your documentation. Now when someone 
                  searches, they find the answer in the docs—not in a Slack thread from 
                  eight months ago.
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
            Bridge the Gap Between Slack and Your Docs
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your 14-day free trial and let <em>Current</em> keep your knowledge base 
            in sync with reality.
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
