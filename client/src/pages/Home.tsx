import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { 
  ArrowRight, 
  Clock, 
  DollarSign, 
  Heart, 
  TrendingUp, 
  Users, 
  Zap,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Search,
  FileWarning,
  UserMinus,
  Brain
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-16 pb-20 lg:pt-24 lg:pb-28 px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-amber-100 text-amber-800 border-amber-200">
              <Clock className="w-4 h-4 mr-2" />
              Employees spend 20-30% of their week searching for info
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-red-100 text-red-800 border-red-200">
              <DollarSign className="w-4 h-4 mr-2" />
              Mid-market teams lose $3M-$7M/year to stale docs
            </Badge>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            Your knowledge base is bleeding you millions.{" "}
            <span className="text-primary"><em>Current</em> stops the leak.</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            <em>Current</em> automatically updates your SOPs, playbooks, and onboarding docs from Slack, meetings, and scattered files — so your team stops searching, stops guessing, and starts executing.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/book-demo">
              <Button size="lg" className="text-base px-8 gap-2" data-testid="button-hero-demo">
                Book a Demo <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="#roi-calculator">
              <Button size="lg" variant="outline" className="text-base px-8 gap-2" data-testid="button-hero-roi">
                <Calculator className="w-4 h-4" />
                See Your ROI in 60 Seconds
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 1: The Problem */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-red-600 border-red-200 bg-red-50">
              <AlertTriangle className="w-4 h-4 mr-2" />
              The Problem
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Your "source of truth" is out of date by the end of the quarter.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Most companies treat documentation as a one-time project. Docs are written once, then forgotten. 
              The result: stale SOPs, tribal knowledge in Slack, and teams who can't trust what they read.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white border-red-100 hover:border-red-200 transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mb-4">
                  <FileWarning className="w-6 h-6" />
                </div>
                <div className="text-4xl font-bold text-foreground mb-2">80%</div>
                <div className="text-sm font-medium text-muted-foreground mb-2">of knowledge is stale</div>
                <p className="text-sm text-muted-foreground/80">
                  Company knowledge becomes outdated within just 90 days of being created.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-amber-100 hover:border-amber-200 transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                  <Search className="w-6 h-6" />
                </div>
                <div className="text-4xl font-bold text-foreground mb-2">20-30%</div>
                <div className="text-sm font-medium text-muted-foreground mb-2">of the week wasted</div>
                <p className="text-sm text-muted-foreground/80">
                  Employees spend nearly a third of their time just searching for information.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-purple-100 hover:border-purple-200 transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                  <UserMinus className="w-6 h-6" />
                </div>
                <div className="text-4xl font-bold text-foreground mb-2">40%</div>
                <div className="text-sm font-medium text-muted-foreground mb-2">of knowledge lost</div>
                <p className="text-sm text-muted-foreground/80">
                  Critical knowledge walks out the door every time someone leaves the company.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-orange-100 hover:border-orange-200 transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="text-4xl font-bold text-foreground mb-2">67%</div>
                <div className="text-sm font-medium text-muted-foreground mb-2">report mistakes</div>
                <p className="text-sm text-muted-foreground/80">
                  Employees say outdated documentation directly causes errors in their work.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 2: The Cost */}
      <section className="py-20 lg:py-28 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-amber-600 border-amber-200 bg-amber-50">
              <DollarSign className="w-4 h-4 mr-2" />
              The Cost
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              The status quo is costing you millions every year.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Even conservative assumptions show that out-of-date, hard-to-update knowledge bases quietly drain 
              millions of dollars in productivity, rework, and morale every single year.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Time */}
            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-blue-500 text-white flex items-center justify-center mb-6">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Time & Productivity</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Employees waste <strong className="text-foreground">8-12 hours/week</strong> searching for info and asking questions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>For a 250-person team: <strong className="text-foreground">~2,500 hours/week</strong> lost</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>At $40/hr fully loaded: <strong className="text-foreground">$100K/week</strong></span>
                  </li>
                </ul>
                <div className="mt-6 pt-6 border-t border-blue-100">
                  <div className="text-3xl font-bold text-blue-600">$5.2M/year</div>
                  <div className="text-sm text-muted-foreground">in lost productivity</div>
                </div>
              </CardContent>
            </Card>

            {/* Money */}
            <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-green-500 text-white flex items-center justify-center mb-6">
                  <DollarSign className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Money & Rework</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Mistakes from outdated info cost <strong className="text-foreground">$4,500/incident</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>25-40 incidents/month = <strong className="text-foreground">$112K-$180K/month</strong> in rework</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Slow onboarding: <strong className="text-foreground">$15K-$25K lost per hire</strong></span>
                  </li>
                </ul>
                <div className="mt-6 pt-6 border-t border-green-100">
                  <div className="text-3xl font-bold text-green-600">$1M-$1.5M/year</div>
                  <div className="text-sm text-muted-foreground">in rework & slow onboarding</div>
                </div>
              </CardContent>
            </Card>

            {/* Morale */}
            <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-100">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-rose-500 text-white flex items-center justify-center mb-6">
                  <Heart className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Morale & Retention</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 mt-1">•</span>
                    <span><strong className="text-foreground">34%</strong> say poor docs "severely impacts morale"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 mt-1">•</span>
                    <span><strong className="text-foreground">22%</strong> cite it as a reason for burnout</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 mt-1">•</span>
                    <span>Replacing one employee costs <strong className="text-foreground">$50K-$150K</strong></span>
                  </li>
                </ul>
                <div className="mt-6 pt-6 border-t border-rose-100">
                  <div className="text-3xl font-bold text-rose-600">Silent Tax</div>
                  <div className="text-sm text-muted-foreground">on every project & hire</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cost Snapshot Table */}
          <Card className="bg-slate-900 text-white border-0">
            <CardContent className="p-8">
              <h3 className="text-lg font-semibold mb-6 text-slate-300">Cost Snapshot: 250-Person Company</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center md:text-left">
                  <div className="text-3xl font-bold text-white mb-1">250</div>
                  <div className="text-sm text-slate-400">employees</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-3xl font-bold text-red-400 mb-1">$5.2M/yr</div>
                  <div className="text-sm text-slate-400">lost productivity</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-3xl font-bold text-amber-400 mb-1">$1M-$1.5M/yr</div>
                  <div className="text-sm text-slate-400">rework & slow ramp</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-3xl font-bold text-rose-400 mb-1">Hidden</div>
                  <div className="text-sm text-slate-400">morale & attrition cost</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 3: The ROI of Current */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-green-600 border-green-200 bg-green-50">
              <TrendingUp className="w-4 h-4 mr-2" />
              The ROI
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              <em>Current</em> pays for itself in days, not months.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              <em>Current</em> turns your chaotic, stale documentation into a living system that updates itself 
              from the tools your team already uses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Search className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">40-75%</div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Cuts Search Time</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Gives back 5-9 hours/week per employee. For a 250-person team, that's 
                  <strong className="text-foreground"> $2M-$4M/year</strong> in reclaimed productivity.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">60-90%</div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Eliminates Rework</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Keeps SOPs and playbooks current automatically. Saves 
                  <strong className="text-foreground"> $75K-$160K/month</strong> in error costs.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600">30-50%</div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Faster Onboarding</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  New hires get a trustworthy source of truth. At 20 hires/year, saves 
                  <strong className="text-foreground"> $250K-$400K</strong> annually.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-amber-600">100%</div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Retains Knowledge</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Instead of losing 40% when someone leaves, <em>Current</em> keeps it. Protects 
                  <strong className="text-foreground"> $300K-$800K/year</strong>.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-rose-600">2-4 FTEs</div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Replaces Manual Work</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  PMs, Ops, CSMs spend 5-10 hrs/week on docs. Automates 
                  <strong className="text-foreground"> $180K-$350K/year</strong> of low-leverage work.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-cyan-600">4-8%</div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Productivity Boost</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  20-36 hours/month per employee reclaimed. Compound gains across every team.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ROI Summary */}
          <Card className="bg-gradient-to-r from-primary to-primary/90 text-white border-0 overflow-hidden">
            <CardContent className="p-8 lg:p-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
                <div className="text-center md:text-left">
                  <div className="text-sm font-medium text-primary-foreground/70 mb-1">Current License</div>
                  <div className="text-2xl lg:text-3xl font-bold">$10K-$50K/yr</div>
                  <div className="text-sm text-primary-foreground/70">mid-market pricing</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-sm font-medium text-primary-foreground/70 mb-1">Value Delivered</div>
                  <div className="text-2xl lg:text-3xl font-bold">$3M-$7M+/yr</div>
                  <div className="text-sm text-primary-foreground/70">estimated savings</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-sm font-medium text-primary-foreground/70 mb-1">Return on Investment</div>
                  <div className="text-2xl lg:text-3xl font-bold text-green-300">15×-60×</div>
                  <div className="text-sm text-primary-foreground/70">ROI range</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-sm font-medium text-primary-foreground/70 mb-1">Payback Period</div>
                  <div className="text-2xl lg:text-3xl font-bold text-amber-300">&lt; 7 days</div>
                  <div className="text-sm text-primary-foreground/70">to break even</div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-white/20 text-center">
                <p className="text-lg font-medium text-primary-foreground/90">
                  "Most customers recoup a full year of <em>Current</em> in the first week."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 4: Mini ROI Calculator CTA */}
      <section id="roi-calculator" className="py-20 lg:py-28 px-6 lg:px-8 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
            <Calculator className="w-8 h-8" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            See how much <em>Current</em> is worth to your team.
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Enter your headcount and we'll show you how much time and money you're losing to 
            outdated documentation — and how quickly <em>Current</em> pays for itself.
          </p>
          <Link href="/book-demo">
            <Button size="lg" className="text-base px-8 gap-2" data-testid="button-roi-calculator">
              See Your ROI in 60 Seconds <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Section 5: Trust / Social Proof */}
      <section className="py-20 lg:py-28 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
            Built for teams who can't afford stale knowledge.
          </h2>
          <p className="text-muted-foreground mb-12">
            Trusted by operations, enablement, and CS leaders at fast-moving companies.
          </p>
          
          {/* Placeholder for logos */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-40">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-24 h-12 bg-slate-200 rounded flex items-center justify-center">
                <span className="text-xs text-slate-400 font-medium">Logo {i}</span>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-muted-foreground mt-8 italic">
            Customer logos and testimonials coming soon.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Stop the knowledge leak. Start with <em>Current</em>.
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join teams saving millions in lost productivity, rework, and institutional knowledge loss.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/book-demo">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-base px-8 gap-2"
                data-testid="button-final-cta-demo"
              >
                Book a Demo <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white/10 text-base px-8"
                data-testid="button-final-cta-pricing"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-bold text-foreground mb-4"><em>Current</em></h4>
              <p className="text-sm text-muted-foreground">
                Self-updating knowledge for fast-moving teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/product" className="hover:text-primary">Product</Link></li>
                <li><Link href="/how-it-works" className="hover:text-primary">How It Works</Link></li>
                <li><Link href="/use-cases" className="hover:text-primary">Use Cases</Link></li>
                <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Compare</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/compare/notion" className="hover:text-primary">vs Notion</Link></li>
                <li><Link href="/compare/confluence" className="hover:text-primary">vs Confluence</Link></li>
                <li><Link href="/compare/guru" className="hover:text-primary">vs Guru</Link></li>
                <li><Link href="/compare/slab" className="hover:text-primary">vs Slab</Link></li>
                <li><Link href="/compare/google-docs" className="hover:text-primary">vs Google Docs</Link></li>
                <li><Link href="/compare/tool-stack" className="hover:text-primary">vs Tool Stack</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Problems</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/compare/hiring-doc-manager" className="hover:text-primary">vs Hiring a Doc Manager</Link></li>
                <li><Link href="/compare/searching-slack" className="hover:text-primary">vs Searching Slack</Link></li>
                <li><Link href="/compare/tribal-knowledge" className="hover:text-primary">vs Tribal Knowledge</Link></li>
                <li><Link href="/compare/manual-documentation" className="hover:text-primary">vs Manual Updates</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                <li><Link href="/book-demo" className="hover:text-primary">Book a Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary" data-testid="link-privacy">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary" data-testid="link-terms">Terms of Service</Link></li>
                <li><Link href="/security" className="hover:text-primary" data-testid="link-security">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 <em>Current</em>. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground/60">
              Made with clarity and care.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
