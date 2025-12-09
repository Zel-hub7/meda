import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Zap, DollarSign, Users, Clock, CheckCircle, XCircle, TrendingUp, Calculator, Sparkles, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function HiringDocManagerVsCurrent() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="mb-4">
            The ROI Question
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
            Hiring a Doc Manager vs <em>Current</em>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The docs are a mess. Someone suggests hiring a documentation manager. Before you post that job listing, let's do the math—<em>Current</em> does the work at a fraction of the cost.
          </p>
        </div>
      </section>

      {/* Quick Answer */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">The Quick Answer</h2>
            <p className="text-muted-foreground text-lg">
              A documentation manager costs <strong className="text-foreground">$70,000 - $120,000/year</strong> (plus benefits and overhead). 
              <strong className="text-foreground"> <em>Current</em></strong> costs <strong className="text-foreground">$99/month</strong>—seatless pricing, no per-user fees. 
              That's a potential savings of <strong className="text-foreground">$92,000+ annually</strong> while getting 24/7 coverage instead of 40 hours/week.
            </p>
          </Card>
        </div>
      </section>

      {/* The Real Problem */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">The Real Problem</h2>
            <p className="text-muted-foreground text-lg mb-6">
              Your knowledge base is outdated. Onboarding is slow. Support keeps answering the same questions. 
              The natural instinct? Hire someone to fix it. But here's the uncomfortable truth: a doc manager 
              can only work as fast as information flows to them—and that information lives in Slack, scattered 
              across dozens of channels.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">The hidden cost</p>
                  <p className="text-sm text-muted-foreground">
                    A doc manager isn't just salary. It's benefits, management overhead, vacation coverage, and the reality that one person can only chase so many updates.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ROI Comparison - The Money Section */}
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">The Real Cost Comparison</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Let's be honest about what you're actually paying for.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hiring a Doc Manager */}
            <Card className="p-8 border-2 border-red-200 dark:border-red-900">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Hiring a Doc Manager</h3>
                <Badge variant="outline" className="text-red-600 border-red-300">High Cost</Badge>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-card-border">
                  <span className="text-muted-foreground">Base Salary</span>
                  <span className="font-semibold text-foreground">$70,000 - $120,000/yr</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-card-border">
                  <span className="text-muted-foreground">Benefits (20-30%)</span>
                  <span className="font-semibold text-foreground">$14,000 - $36,000/yr</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-card-border">
                  <span className="text-muted-foreground">Recruiting Costs</span>
                  <span className="font-semibold text-foreground">$10,000 - $25,000</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-card-border">
                  <span className="text-muted-foreground">Management Overhead</span>
                  <span className="font-semibold text-foreground">Time & Resources</span>
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">Total Annual Cost</span>
                  <span className="text-2xl font-bold text-red-600">$94,000 - $181,000</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Works 40 hours/week, needs vacation</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Can only process info shared with them</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Single point of failure if they leave</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Burnout risk chasing updates manually</span>
                </div>
              </div>
            </Card>

            {/* Current */}
            <Card className="p-8 border-2 border-green-200 dark:border-green-900">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground"><em>Current</em></h3>
                <Badge variant="outline" className="text-green-600 border-green-300">Smart Investment</Badge>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-card-border">
                  <span className="text-muted-foreground">Monthly Subscription</span>
                  <span className="font-semibold text-foreground">$99/month</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-card-border">
                  <span className="text-muted-foreground">Per-Seat Costs</span>
                  <span className="font-semibold text-green-600">$0 (seatless pricing)</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-card-border">
                  <span className="text-muted-foreground">Setup & Onboarding</span>
                  <span className="font-semibold text-green-600">Included</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-card-border">
                  <span className="text-muted-foreground">Maintenance</span>
                  <span className="font-semibold text-green-600">Automatic</span>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">Total Annual Cost</span>
                  <span className="text-2xl font-bold text-green-600">$1,188</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Works 24/7, never takes vacation</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Monitors all Slack channels automatically</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Scales with your team instantly</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">No burnout, consistent quality</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Savings Calculator */}
          <Card className="mt-12 p-8 bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                <Calculator className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Annual Savings</h3>
                <p className="text-muted-foreground">What you keep by choosing <em>Current</em></p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Minimum Savings</p>
                <p className="text-3xl font-bold text-green-600">$92,812</p>
                <p className="text-xs text-muted-foreground mt-1">vs. $94k hire</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Average Savings</p>
                <p className="text-3xl font-bold text-green-600">$136,312</p>
                <p className="text-xs text-muted-foreground mt-1">vs. $137.5k hire</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Maximum Savings</p>
                <p className="text-3xl font-bold text-green-600">$179,812</p>
                <p className="text-xs text-muted-foreground mt-1">vs. $181k hire</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Why This Happens */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">Why Hiring Often Fails</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Even great doc managers struggle with the same fundamental problem.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <Clock className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Information Lag</h3>
              <p className="text-sm text-muted-foreground">
                By the time someone tells the doc manager about a change, it's often days or weeks old
              </p>
            </Card>
            <Card className="p-6 text-center">
              <Users className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Bottleneck Creation</h3>
              <p className="text-sm text-muted-foreground">
                One person becomes the gatekeeper. Updates queue up. Documentation falls behind again.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <Scale className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Doesn't Scale</h3>
              <p className="text-sm text-muted-foreground">
                As your team grows, one person can't keep up. You'd need to keep hiring.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How Current Solves This */}
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">How <em>Current</em> Solves This</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            <em>Current</em> gives you the benefits of a doc manager without the limitations.
          </p>
          
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Real-Time Capture</h3>
                <p className="text-muted-foreground">
                  <em>Current</em> monitors Slack 24/7 and catches updates the moment they happen—no waiting for someone to forward an email.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">AI Does the Heavy Lifting</h3>
                <p className="text-muted-foreground">
                  Identifies relevant changes, matches them to existing docs, drafts updates with proper context, and presents them for approval.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Scales Infinitely</h3>
                <p className="text-muted-foreground">
                  Whether you have 10 employees or 10,000, <em>Current</em> handles the same workload. No additional hires needed.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Human Judgment Where It Matters</h3>
                <p className="text-muted-foreground">
                  Your team reviews and approves every change. You keep control while eliminating the busywork.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Save $90,000+ This Year
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your 14-day free trial and see how <em>Current</em> keeps your docs updated—for a fraction of the cost of a hire.
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
              <Link href="/compare/not-updating-docs" className="hover:text-foreground transition-colors">Not Updating Docs</Link>
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
