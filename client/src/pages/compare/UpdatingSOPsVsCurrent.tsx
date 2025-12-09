import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Zap, AlertTriangle, Clock, Users, RefreshCw, CheckCircle, XCircle, MessageSquare, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function UpdatingSOPsVsCurrent() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="mb-4">
            The SOP Update Problem
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
            Stop Scrambling After Every Product Change
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Product ships a feature. Support scrambles to update SOPs. RevOps rewrites playbooks. CS updates their scripts. Sound familiar? <em>Current</em> ends the chaos.
          </p>
        </div>
      </section>

      {/* The Real Problem */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">The Real Problem</h2>
            <p className="text-muted-foreground text-lg mb-6">
              Every time your product team ships an update, a chain reaction begins. Someone in Slack announces the change. 
              Then nothing happens—until a customer calls confused, or a new hire follows outdated instructions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Product announces in Slack</p>
                  <p className="text-sm text-muted-foreground">The update exists somewhere in a thread</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">SOPs stay frozen in time</p>
                  <p className="text-sm text-muted-foreground">Nobody has time to hunt down what changed</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Teams give wrong answers</p>
                  <p className="text-sm text-muted-foreground">Support reads outdated docs, customers suffer</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Fire drill every release</p>
                  <p className="text-sm text-muted-foreground">RevOps and CS scramble to catch up</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Why This Happens */}
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">Why This Happens</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            It's not that your team doesn't care. It's that the system is broken by design.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <MessageSquare className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Knowledge Lives in Slack</h3>
              <p className="text-sm text-muted-foreground">
                Product updates, pricing changes, new features—all announced in channels that scroll away
              </p>
            </Card>
            <Card className="p-6 text-center">
              <Clock className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Nobody Owns the Sync</h3>
              <p className="text-sm text-muted-foreground">
                RevOps thinks CS will update it. CS thinks RevOps will. Product thinks it's not their job.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <AlertTriangle className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Manual Process = Failure</h3>
              <p className="text-sm text-muted-foreground">
                Any process that relies on humans remembering to update docs will eventually break
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How Current Solves This */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">How <em>Current</em> Solves This</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            <em>Current</em> bridges the gap between Slack announcements and your documentation—automatically.
          </p>
          
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">AI Monitors Your Channels</h3>
                <p className="text-muted-foreground">
                  <em>Current</em> watches #product-updates, #releases, and any channel you specify. When something changes, it catches it.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Matches Changes to SOPs</h3>
                <p className="text-muted-foreground">
                  The AI identifies which SOPs, playbooks, and scripts are affected by the change and drafts the update.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Human Approves, Doc Updates</h3>
                <p className="text-muted-foreground">
                  Your team reviews the suggested change in a diff view, approves with one click, and the SOP syncs automatically.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Everyone Stays Current</h3>
                <p className="text-muted-foreground">
                  Support, CS, and RevOps always have accurate information. No more fire drills after every release.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Love Letters Section */}
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">RevOps and CS Will Send You Love Letters</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            When your SOPs update themselves, the teams who rely on them notice. No more "wait, did that change?" No more customers getting wrong information. Just accurate, up-to-date processes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-semibold text-foreground">Support handles tickets faster</p>
              <p className="text-sm text-muted-foreground mt-2">With accurate SOPs at their fingertips</p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-semibold text-foreground">CS onboards with confidence</p>
              <p className="text-sm text-muted-foreground mt-2">Playbooks reflect reality, not last quarter</p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-semibold text-foreground">RevOps stops firefighting</p>
              <p className="text-sm text-muted-foreground mt-2">Process documentation stays current automatically</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            End the SOP Scramble
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your 14-day free trial and see how <em>Current</em> keeps your SOPs in sync with every product change.
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
              <Link href="/compare/not-updating-docs" className="hover:text-foreground transition-colors">Not Updating Docs</Link>
              <Link href="/compare/hiring-doc-manager" className="hover:text-foreground transition-colors">Hiring a Doc Manager</Link>
              <Link href="/compare/notion" className="hover:text-foreground transition-colors">Notion vs Current</Link>
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
