import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Zap, AlertTriangle, TrendingDown, Users, HelpCircle, CheckCircle, XCircle, Clock, FileQuestion, ShieldAlert, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function NotUpdatingDocsVsCurrent() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="mb-4">
            The Silent Crisis
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
            What Happens When You Stop Updating Documentation?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Shockingly common. Teams just... stop. The docs exist, but they're from six months ago. Here's what that actually costs you.
          </p>
        </div>
      </section>

      {/* The Real Problem */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">The Real Problem</h2>
            <p className="text-muted-foreground text-lg mb-6">
              Nobody decides to stop updating documentation. It just... happens. One busy quarter turns into two. 
              The wiki becomes a museum. And then one day, a new hire asks "where do I find how to do X?" and 
              everyone points them to docs that are dangerously outdated.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">The uncomfortable truth</p>
                  <p className="text-sm text-muted-foreground">
                    Most internal documentation is already out of date. The question isn't whether this is happening to you—it's how bad the drift has gotten.
                  </p>
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
            Documentation decay isn't a failure of discipline. It's a failure of systems.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <Clock className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Nobody Has Time</h3>
              <p className="text-sm text-muted-foreground">
                Between shipping features and fighting fires, updating docs is always "tomorrow's problem"
              </p>
            </Card>
            <Card className="p-6">
              <Users className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Tribal Knowledge Takes Over</h3>
              <p className="text-sm text-muted-foreground">
                Senior team members just know things. They answer questions faster than docs ever could.
              </p>
            </Card>
            <Card className="p-6">
              <FileQuestion className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No Feedback Loop</h3>
              <p className="text-sm text-muted-foreground">
                Nobody knows which docs are wrong until someone follows them and something breaks
              </p>
            </Card>
            <Card className="p-6">
              <TrendingDown className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Trust Erodes Slowly</h3>
              <p className="text-sm text-muted-foreground">
                People stop checking docs because they've been burned before. The cycle accelerates.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* The Cost of Stale Docs */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">The Real Cost of Stale Documentation</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            When docs decay, everything slows down. Here's what it actually looks like:
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-6 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
              <XCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Onboarding Takes Forever</h3>
                <p className="text-muted-foreground">
                  New hires can't self-serve. They interrupt senior engineers constantly. Time-to-productivity stretches from weeks to months.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-6 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
              <XCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Errors Multiply</h3>
                <p className="text-muted-foreground">
                  People follow outdated procedures. Customers get wrong information. Support tickets spike with preventable issues.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-6 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
              <ShieldAlert className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Compliance Risk Grows</h3>
                <p className="text-muted-foreground">
                  Outdated SOPs mean processes aren't followed correctly. Audits become nightmares. Legal exposure increases.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-6 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
              <UserX className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Key Person Dependency</h3>
                <p className="text-muted-foreground">
                  When the person who "just knows" leaves, critical knowledge walks out the door. Teams scramble to reconstruct what was never written down.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Current Solves This */}
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">How <em>Current</em> Solves This</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            <em>Current</em> removes the burden of remembering to update docs. It happens automatically.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Always Listening</h3>
                  <p className="text-sm text-muted-foreground">
                    AI monitors Slack for knowledge-worthy information—decisions, changes, clarifications—and captures it before it scrolls away.
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Suggests Updates</h3>
                  <p className="text-sm text-muted-foreground">
                    When information changes, <em>Current</em> drafts the update and shows you exactly what will change with a diff view.
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">One-Click Approval</h3>
                  <p className="text-sm text-muted-foreground">
                    Review the suggestion, approve it, and your docs sync automatically. No copy-paste, no context switching.
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Trust Returns</h3>
                  <p className="text-sm text-muted-foreground">
                    When docs are reliably accurate, people actually use them. Self-service works. Onboarding accelerates.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Stop Letting Documentation Decay
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your 14-day free trial and see how <em>Current</em> keeps your knowledge base accurate—without the manual work.
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
              <Link href="/compare/updating-sops" className="hover:text-foreground transition-colors">Updating SOPs</Link>
              <Link href="/compare/hiring-doc-manager" className="hover:text-foreground transition-colors">Hiring a Doc Manager</Link>
              <Link href="/compare/confluence" className="hover:text-foreground transition-colors">Confluence vs Current</Link>
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
