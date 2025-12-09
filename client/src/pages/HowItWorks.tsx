import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { 
  ArrowRight, 
  Link2, 
  Ear, 
  GitCompare, 
  CheckCircle2,
  MessageSquare,
  Video,
  FileText,
  Sparkles,
  Database,
  Users,
  Headphones,
  TrendingUp,
  Building2
} from "lucide-react";
import { SiSlack, SiNotion, SiGoogledocs, SiZoom } from "react-icons/si";

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Connect your tools",
      description: "Link your Slack workspace, Google Docs, Notion, and Zoom. Current integrates in minutes with no engineering required.",
      icon: <Link2 className="w-8 h-8" />,
      iconBg: "bg-blue-100 text-blue-600",
      tools: [
        { icon: <SiSlack className="w-5 h-5" />, label: "Slack" },
        { icon: <SiGoogledocs className="w-5 h-5" />, label: "Docs" },
        { icon: <SiNotion className="w-5 h-5" />, label: "Notion" },
        { icon: <SiZoom className="w-5 h-5" />, label: "Zoom" },
      ]
    },
    {
      number: 2,
      title: "Current listens for changes",
      description: "Our AI continuously monitors your connected sources—messages, meeting transcripts, document edits—for anything that might affect your knowledge base.",
      icon: <Ear className="w-8 h-8" />,
      iconBg: "bg-purple-100 text-purple-600",
    },
    {
      number: 3,
      title: "AI detects drift and generates suggestions",
      description: "Current compares new information against your existing SOPs and documentation. When something's out of date, it drafts precise, diff-style updates.",
      icon: <GitCompare className="w-8 h-8" />,
      iconBg: "bg-amber-100 text-amber-600",
    },
    {
      number: 4,
      title: "You approve with one click",
      description: "Review AI-generated suggestions, see exactly what's changing, and approve updates instantly. Your source of truth stays perfectly in sync.",
      icon: <CheckCircle2 className="w-8 h-8" />,
      iconBg: "bg-green-100 text-green-600",
    },
  ];

  const audiences = [
    {
      title: "Ops Teams",
      icon: <Users className="w-6 h-6" />,
      description: "Keep SOPs and runbooks current as processes evolve. Never chase down outdated documentation again."
    },
    {
      title: "Customer Success",
      icon: <Headphones className="w-6 h-6" />,
      description: "Ensure your help docs and playbooks reflect the latest product updates and best practices."
    },
    {
      title: "RevOps",
      icon: <TrendingUp className="w-6 h-6" />,
      description: "Maintain accurate sales playbooks and pricing docs as your GTM strategy evolves."
    },
    {
      title: "Agencies",
      icon: <Building2 className="w-6 h-6" />,
      description: "Keep client processes documented correctly across multiple accounts and teams."
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 pb-16 lg:pt-28 lg:pb-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            How <em>Current</em> keeps your knowledge always up to date.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Connect your tools, let AI detect what's changed, approve updates with one click. Your documentation stays accurate without the manual work.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-base font-medium underline underline-offset-4 transition-colors" data-testid="link-hero-get-started">
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4-Step Visual Flow */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">How it works</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Four steps to self-updating documentation
            </h2>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={step.number} className="relative">
                {/* Connector line (hidden on mobile, last item) */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" style={{ width: 'calc(100% - 2rem)' }} />
                )}
                
                <Card className="bg-white border-slate-200 h-full relative z-10">
                  <CardContent className="pt-6">
                    {/* Step Number */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                        {step.number}
                      </div>
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                    </div>

                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl ${step.iconBg} flex items-center justify-center mb-4`}>
                      {step.icon}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>

                    {/* Tool icons for step 1 */}
                    {step.tools && (
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                        {step.tools.map((tool) => (
                          <div 
                            key={tool.label} 
                            className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600"
                            title={tool.label}
                          >
                            {tool.icon}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Under-the-Hood Section */}
      <section className="py-20 lg:py-28 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Explanation */}
            <div className="space-y-6">
              <Badge variant="outline">Under the hood</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                What's happening behind the scenes
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg">
                  <em>Current</em> uses advanced AI to understand your content deeply—not just surface-level keyword matching.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold">1</span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Ingestion</span>
                      <p className="text-sm">Your messages, docs, and transcripts flow into Current in real-time.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold">2</span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Understanding</span>
                      <p className="text-sm">AI converts content into semantic representations to understand meaning, not just words.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold">3</span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Comparison</span>
                      <p className="text-sm">New information is compared against your existing knowledge base to detect drift.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold">4</span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Approval</span>
                      <p className="text-sm">Suggested updates go to your queue where you have full control to approve or reject.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Pseudo-diagram */}
            <div className="relative">
              <div className="space-y-3">
                {/* Source tools */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#4A154B] flex items-center justify-center">
                        <SiSlack className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">Slack</div>
                        <div className="text-xs text-muted-foreground">Messages & threads</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#2D8CFF] flex items-center justify-center">
                        <SiZoom className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">Zoom</div>
                        <div className="text-xs text-muted-foreground">Meeting transcripts</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#4285F4] flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">Docs</div>
                        <div className="text-xs text-muted-foreground">Google & more</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                        <SiNotion className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">Notion</div>
                        <div className="text-xs text-muted-foreground">Your knowledge base</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Arrow down */}
                <div className="flex justify-center py-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-slate-500 rotate-90" />
                  </div>
                </div>

                {/* AI Engine */}
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <div className="font-semibold text-foreground"><em>Current</em> AI Engine</div>
                    <div className="text-sm text-muted-foreground">Powered by Claude</div>
                  </CardContent>
                </Card>

                {/* Arrow down */}
                <div className="flex justify-center py-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-slate-500 rotate-90" />
                  </div>
                </div>

                {/* Knowledge Base */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-green-600 text-white flex items-center justify-center mx-auto mb-3">
                      <Database className="w-7 h-7" />
                    </div>
                    <div className="font-semibold text-foreground">Your Knowledge Base</div>
                    <div className="text-sm text-muted-foreground">Always accurate, always current</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Who it's for
            </h2>
            <p className="text-lg text-muted-foreground">
              Teams that can't afford outdated documentation
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {audiences.map((audience) => (
              <Card key={audience.title} className="bg-white border-slate-200 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    {audience.icon}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{audience.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {audience.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            See <em>Current</em> keep your docs in sync in under 30 minutes.
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Start your free trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-base px-8 gap-2"
                data-testid="button-final-cta-signup"
              >
                Get started free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/book-demo">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white/10 text-base px-8"
                data-testid="button-final-cta-demo"
              >
                Book a Demo
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
                <li><Link href="/product" className="hover:text-primary" data-testid="link-footer-product">Product</Link></li>
                <li><Link href="/how-it-works" className="hover:text-primary" data-testid="link-footer-how-it-works">How It Works</Link></li>
                <li><Link href="/use-cases" className="hover:text-primary" data-testid="link-footer-use-cases">Use Cases</Link></li>
                <li><Link href="/pricing" className="hover:text-primary" data-testid="link-footer-pricing">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Compare</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/compare/notion" className="hover:text-primary" data-testid="link-footer-compare-notion">vs Notion</Link></li>
                <li><Link href="/compare/confluence" className="hover:text-primary" data-testid="link-footer-compare-confluence">vs Confluence</Link></li>
                <li><Link href="/compare/guru" className="hover:text-primary" data-testid="link-footer-compare-guru">vs Guru</Link></li>
                <li><Link href="/compare/slab" className="hover:text-primary">vs Slab</Link></li>
                <li><Link href="/compare/google-docs" className="hover:text-primary">vs Google Docs</Link></li>
                <li><Link href="/compare/tool-stack" className="hover:text-primary">vs Tool Stack</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Problems</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/compare/hiring-doc-manager" className="hover:text-primary">vs Hiring Doc Manager</Link></li>
                <li><Link href="/compare/searching-slack" className="hover:text-primary">vs Searching Slack</Link></li>
                <li><Link href="/compare/tribal-knowledge" className="hover:text-primary">vs Tribal Knowledge</Link></li>
                <li><Link href="/compare/manual-documentation" className="hover:text-primary">vs Manual Updates</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/blog" className="hover:text-primary" data-testid="link-footer-blog">Blog</Link></li>
                <li><Link href="/book-demo" className="hover:text-primary" data-testid="link-footer-demo">Book a Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary" data-testid="link-footer-privacy">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary" data-testid="link-footer-terms">Terms of Service</Link></li>
                <li><Link href="/security" className="hover:text-primary">Security</Link></li>
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
