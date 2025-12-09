import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { 
  ArrowRight, 
  RefreshCw, 
  MessageSquare, 
  Video,
  GitCompare,
  Sparkles,
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { SiSlack } from "react-icons/si";

export default function Product() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 pb-24 lg:pt-28 lg:pb-32 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            Your knowledge base that updates itself.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            <em>Current</em> ingests Slack, Zoom, and docs, detects knowledge drift, and suggests AI-powered updates—so your SOPs and internal docs stay in sync without the busywork.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8 gap-2" data-testid="button-hero-signup">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/book-demo">
              <Button size="lg" variant="outline" className="text-base px-8" data-testid="button-hero-demo">
                Book a Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Problem → Solution Section */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Problem Column */}
            <div className="space-y-6">
              <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                <AlertTriangle className="w-4 h-4 mr-2" />
                The Problem
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                Knowledge rot is killing your team's productivity.
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg">
                  Your Notion pages were accurate—six months ago. Your Confluence wiki has "updated 2022" in the footer. The real answers? Buried in Slack threads and meeting recordings.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    <span>SOPs that don't reflect how work actually gets done</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    <span>Tribal knowledge trapped in Slack channels and DMs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    <span>Meeting decisions that never make it to documentation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    <span>New hires asking the same questions over and over</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Solution Column */}
            <div className="space-y-6">
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                The Solution
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                A single source of truth that stays current.
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg">
                  <em>Current</em> continuously watches your Slack channels, Zoom recordings, and shared docs. When something changes, it detects the drift and suggests precise updates.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    <span>AI monitors Slack for decisions, announcements, and process changes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    <span>Meeting transcripts automatically surface action items and updates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    <span>Side-by-side diffs show exactly what's changing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    <span>One-click approval keeps humans in the loop</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-20 lg:py-28 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything you need to keep docs in sync
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features that work together to eliminate knowledge rot once and for all.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white hover:shadow-lg transition-shadow border-slate-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Auto-Updating Docs</h3>
                <p className="text-muted-foreground text-sm">
                  Documents that update themselves based on real conversations and decisions happening across your tools.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow border-slate-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                  <SiSlack className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Slack Ingestion</h3>
                <p className="text-muted-foreground text-sm">
                  Monitor any channel for important updates. AI extracts decisions, announcements, and process changes in real-time.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow border-slate-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-4">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Meeting Transcription</h3>
                <p className="text-muted-foreground text-sm">
                  Zoom and Google Meet recordings are transcribed and analyzed for action items and documentation updates.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow border-slate-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
                  <GitCompare className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Doc Diffing & History</h3>
                <p className="text-muted-foreground text-sm">
                  See exactly what's changing with side-by-side diffs. Full version history for every document update.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow border-slate-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">AI Suggestions & Approvals</h3>
                <p className="text-muted-foreground text-sm">
                  Claude AI drafts precise updates with confidence scores. Review and approve with a single click.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow border-slate-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Knowledge Drift Detection</h3>
                <p className="text-muted-foreground text-sm">
                  Proactively identifies when documentation has fallen out of sync with reality. No more stale SOPs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* UI Preview Section */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              See it in action
            </h2>
            <p className="text-lg text-muted-foreground">
              A clean, intuitive interface for managing your knowledge updates.
            </p>
          </div>

          <Card className="bg-white border-slate-200 shadow-xl overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* Document List Panel */}
              <div className="lg:w-1/2 border-b lg:border-b-0 lg:border-r border-slate-200">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-semibold text-foreground text-sm">Knowledge Base</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { name: "Customer Onboarding SOP", status: "up-to-date", updated: "2 hours ago" },
                    { name: "Engineering Runbook", status: "needs-review", updated: "Just now" },
                    { name: "Sales Playbook Q4", status: "up-to-date", updated: "1 day ago" },
                    { name: "Security Policies", status: "needs-review", updated: "5 min ago" },
                    { name: "Product Release Process", status: "up-to-date", updated: "3 hours ago" },
                  ].map((doc, i) => (
                    <div key={i} className={`p-4 flex items-center justify-between ${i === 1 ? 'bg-amber-50' : ''}`}>
                      <div className="flex items-center gap-3">
                        <FileText className={`w-5 h-5 ${i === 1 || i === 3 ? 'text-amber-500' : 'text-slate-400'}`} />
                        <div>
                          <div className="font-medium text-foreground text-sm">{doc.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {doc.updated}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={doc.status === "up-to-date" ? "secondary" : "outline"}
                        className={doc.status === "needs-review" ? "text-amber-600 border-amber-300 bg-amber-100" : ""}
                      >
                        {doc.status === "up-to-date" ? "Up to date" : "Needs review"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diff Panel */}
              <div className="lg:w-1/2">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <h3 className="font-semibold text-foreground text-sm">Suggested Changes</h3>
                  <Badge className="bg-amber-500">1 pending</Badge>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <div className="text-sm font-medium text-foreground mb-2">Engineering Runbook</div>
                    <div className="text-xs text-muted-foreground mb-3">Detected from #engineering channel</div>
                  </div>
                  
                  <div className="rounded-lg border border-slate-200 overflow-hidden font-mono text-xs">
                    <div className="bg-red-50 p-3 border-b border-slate-200">
                      <div className="flex items-center gap-2 text-red-600">
                        <span className="font-bold">-</span>
                        <span>Deploy using `./deploy.sh production`</span>
                      </div>
                    </div>
                    <div className="bg-green-50 p-3">
                      <div className="flex items-center gap-2 text-green-600">
                        <span className="font-bold">+</span>
                        <span>Deploy using `make deploy ENV=production`</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-2">AI Reasoning</div>
                    <p className="text-sm text-foreground">
                      "Detected deployment command change announced by @sarah in #engineering. The team has migrated to Makefile-based deployments."
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" className="flex-1" data-testid="button-preview-approve">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" data-testid="button-preview-reject">
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 lg:py-28 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Trusted by operations teams
            </h2>
          </div>

          {/* Placeholder Logos */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center mb-12 opacity-40">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-24 h-12 bg-slate-200 rounded flex items-center justify-center">
                <span className="text-xs text-slate-400 font-medium">Logo {i}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <Card className="bg-slate-50 border-slate-200 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-lg text-foreground mb-4 italic">
                "<em>Current</em> saves our team 5+ hours per week on doc maintenance. We used to have three people manually updating our knowledge base after every product release. Now it just happens."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  JM
                </div>
                <div>
                  <div className="font-medium text-foreground">Jamie Martinez</div>
                  <div className="text-sm text-muted-foreground">Ops Lead, Series B SaaS</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Stop fighting knowledge rot. Start with <em>Current</em>.
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join teams who've reclaimed hours every week and finally have a knowledge base they can trust.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-base px-8 gap-2"
                data-testid="button-final-cta-signup"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/book-demo">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white/10 text-base px-8"
                data-testid="button-final-cta-demo"
              >
                Talk to Us
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
                <li><Link href="/privacy" className="hover:text-primary" data-testid="link-privacy">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary" data-testid="link-terms">Terms of Service</Link></li>
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
