import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Zap, BookOpen, RefreshCw, AlertTriangle, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function InternalWikiVsCurrent() {
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
            Internal Wiki vs <em>Current</em>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Wikis store knowledge. <em>Current</em> keeps it accurate. One is a container, the other is an active update system.
          </p>
        </div>
      </section>

      {/* Quick Answer */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl p-8 border border-card-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">The Quick Answer</h2>
            <p className="text-muted-foreground text-lg">
              <strong className="text-foreground">Internal wikis</strong> are passive containers—they hold whatever you put in them and stay exactly as you left them. 
              <strong className="text-foreground"> <em>Current</em></strong> is an active system that monitors your team's conversations and automatically suggests updates when information changes. 
              Your wiki stores knowledge; <em>Current</em> keeps that knowledge from going stale.
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
                <BookOpen className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Internal Wikis</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Passive by design</strong> — content sits unchanged until someone manually updates it</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">No awareness</strong> — wiki doesn't know when information becomes outdated</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Manual maintenance</strong> — requires someone to remember to update docs</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Information silos</strong> — decisions in Slack never reach the wiki</span>
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
                  <span><strong className="text-foreground">Active monitoring</strong> — watches Slack for knowledge-worthy updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">AI-powered detection</strong> — identifies when docs need updating</span>
                </li>
                <li className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Automatic suggestions</strong> — proposes updates for human approval</span>
                </li>
                <li className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Bridges the gap</strong> — turns conversations into documentation</span>
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
            <em>Current</em> doesn't replace your wiki—it makes it trustworthy by preventing knowledge decay.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <Clock className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Always Current</h3>
              <p className="text-sm text-muted-foreground">
                Docs stay up-to-date without manual effort. Changes flow from conversations to documentation automatically.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <Users className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Human-in-the-Loop</h3>
              <p className="text-sm text-muted-foreground">
                AI suggests, humans approve. You maintain control while eliminating the busywork.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-card-border text-center">
              <RefreshCw className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Prevents Decay</h3>
              <p className="text-sm text-muted-foreground">
                Knowledge bases decay without maintenance. <em>Current</em> provides that maintenance automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">The Wiki Problem</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Every team has experienced this: you search the wiki, find an answer, follow the process... and it's wrong.
          </p>
          
          <div className="bg-card rounded-xl p-8 border border-card-border">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Someone writes a wiki page</h4>
                  <p className="text-muted-foreground text-sm">It's accurate on day one.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-yellow-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Reality changes</h4>
                  <p className="text-muted-foreground text-sm">A decision is made in Slack, a process evolves, a policy updates.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">The wiki stays the same</h4>
                  <p className="text-muted-foreground text-sm">Nobody remembers to update it. The gap between wiki and reality grows.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-semibold text-sm">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Trust erodes</h4>
                  <p className="text-muted-foreground text-sm">Team members learn not to trust the wiki. They start asking in Slack instead.</p>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-card-border">
              <p className="text-foreground font-medium">
                <em>Current</em> breaks this cycle by catching changes as they happen and suggesting updates before trust erodes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Keep Your Wiki <em>Current</em>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your 14-day free trial and see how <em>Current</em> transforms your internal wiki from a static archive into a living, accurate knowledge base.
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
              <Link href="/compare/knowledge-base" className="hover:text-foreground transition-colors">Knowledge Base vs Current</Link>
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
