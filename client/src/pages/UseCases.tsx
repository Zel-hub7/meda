import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { 
  ArrowRight, 
  Users, 
  HeartHandshake, 
  TrendingUp,
  Building2,
  Briefcase,
  CheckCircle2,
  Sparkles,
  History,
  Puzzle,
  MessageSquare,
  FileText,
  AlertTriangle,
  Target,
  Zap,
  Quote
} from "lucide-react";
import { SiSlack, SiNotion } from "react-icons/si";

const solutions = [
  {
    id: "ops",
    icon: Users,
    title: "Ops Teams",
    color: "bg-blue-500",
    shortDescription: "Keep SOPs and process documentation aligned with fast-changing reality. When your team adapts how they work, your docs should too.",
    shortBenefits: [
      "Prevent process drift before it causes errors",
      "SOPs that reflect how work actually gets done",
      "Reduce onboarding time for new team members",
    ],
    description: "Operations teams are the backbone of company efficiency. Your SOPs, runbooks, and process docs need to reflect reality—not how things worked six months ago.",
    challenge: "Processes evolve constantly as your team finds better ways to work. Changes get discussed in Slack, implemented immediately, but the documentation lags behind for weeks or months. New hires follow outdated procedures. Errors happen because people reference the wrong version.",
    solution: "Current monitors your #operations, #process-changes, and team channels. When someone announces a workflow update or discusses a better approach, it automatically detects the change and suggests updates to your SOPs and process documentation in Notion.",
    benefits: [
      "Prevent process drift before it causes errors",
      "SOPs that reflect how work actually gets done",
      "Reduce onboarding time for new ops team members",
      "Roll out changes across teams without rewriting docs"
    ],
    scenario: {
      title: "Real-world scenario",
      content: "Your team rolls out a new approval workflow across 4 regions. The change is announced in #operations and discussed across regional channels. Current captures the new process, identifies affected SOPs, and suggests unified updates—ensuring all regions see the same accurate documentation the same day."
    },
    metrics: [
      { value: "Same day", label: "Doc updates" },
      { value: "70%", label: "Fewer errors" },
      { value: "4x", label: "Faster rollouts" }
    ]
  },
  {
    id: "customer-success",
    icon: HeartHandshake,
    title: "Customer Success",
    color: "bg-emerald-500",
    shortDescription: "Keep onboarding playbooks and support docs in sync with what your top reps actually do. Stop giving customers outdated information.",
    shortBenefits: [
      "Playbooks updated as best practices evolve",
      "Reduce customer confusion by 90%",
      "Faster ramp time for new CS hires",
    ],
    description: "Customer Success teams live and die by the accuracy of their knowledge. When product changes happen, support docs need to update immediately—or customers get confused and frustrated.",
    challenge: "Your team spends hours each week hunting through Slack for product updates, then manually updating support articles. Despite best efforts, outdated information still reaches customers. New hires can't ramp quickly because the playbooks don't reflect what top performers actually do.",
    solution: "Current monitors your #product-updates, #cs-best-practices, and #releases channels. When someone shares a feature change, bug fix, or successful customer strategy, it automatically suggests updates to your customer-facing documentation and internal playbooks.",
    benefits: [
      "Reduce customer confusion from outdated docs by 90%",
      "Save 5+ hours per week on manual doc updates",
      "Faster onboarding for new CS team members",
      "Consistent information across all support channels"
    ],
    scenario: {
      title: "Real-world scenario",
      content: "Your engineering team ships a new dashboard feature and announces it in #releases. Within hours, Current detects the announcement, extracts the key details, and suggests updates to your 'Getting Started' guide and 'Dashboard Overview' help articles. Your CS team reviews and approves with one click—customers see accurate docs the same day."
    },
    metrics: [
      { value: "90%", label: "Fewer outdated docs" },
      { value: "5hrs", label: "Saved per week" },
      { value: "Same day", label: "Doc updates" }
    ]
  },
  {
    id: "revops",
    icon: TrendingUp,
    title: "RevOps",
    color: "bg-purple-500",
    shortDescription: "Ensure GTM teams always have the latest processes and rules of engagement. Keep sales plays and competitive intel current.",
    shortBenefits: [
      "Battle cards that reflect current capabilities",
      "Fresh competitive intelligence always",
      "Consistent messaging across the team",
    ],
    description: "RevOps keeps the entire GTM machine running. When pricing changes, processes shift, or competitive intel surfaces, your sales team needs to know immediately—with documentation to back it up.",
    challenge: "Reps share outdated feature lists in demos. Competitive intel goes stale within days. New hires take months to learn the product. Deals are lost because the wrong information was in the battle card or the pricing doc hadn't been updated.",
    solution: "Current monitors #product-launches, #competitive-intel, #sales, and #deal-room channels. It captures pricing changes, competitive updates, and product announcements, then suggests updates to your sales enablement docs—keeping your GTM team armed with the truth.",
    benefits: [
      "Battle cards that reflect current capabilities",
      "Fresh competitive intelligence always",
      "Faster ramp time for new reps",
      "Consistent messaging across the entire sales team"
    ],
    scenario: {
      title: "Real-world scenario",
      content: "A competitor launches a new feature and someone shares the news in #competitive-intel with analysis. Current captures this and suggests updating your 'Competitor X Battle Card' with the new information, talking points, and differentiation strategies—all before your next prospect call."
    },
    metrics: [
      { value: "Real-time", label: "Intel updates" },
      { value: "50%", label: "Faster ramp" },
      { value: "Consistent", label: "Messaging" }
    ]
  },
  {
    id: "agencies",
    icon: Briefcase,
    title: "Agencies & Services",
    color: "bg-orange-500",
    shortDescription: "Keep client playbooks and internal how-tos updated without manual cleanup. Scale your operations without documentation chaos.",
    shortBenefits: [
      "Client processes documented correctly",
      "Internal knowledge accessible to all",
      "Reduce repetitive questions by 70%",
    ],
    description: "Agencies juggle multiple clients, each with their own processes and quirks. When things change—and they always do—keeping every playbook and how-to current is nearly impossible.",
    challenge: "Each account manager has their own 'system.' Client handoffs are chaotic. New hires take months to ramp because the real processes live in people's heads, not documentation. You're constantly reinventing the wheel.",
    solution: "Current monitors your client channels, internal best-practices discussions, and team knowledge-sharing. It captures tribal knowledge as it happens and suggests updates to client playbooks and internal documentation—building a living knowledge base that evolves with your agency.",
    benefits: [
      "Client processes documented correctly, always",
      "Internal knowledge accessible to the whole team",
      "Reduce repetitive questions by 70%",
      "Smooth client handoffs with complete context"
    ],
    scenario: {
      title: "Real-world scenario",
      content: "A senior account manager shares a breakthrough client strategy in #agency-wins. Current captures the approach, identifies related playbooks, and suggests updates to your 'Client Onboarding' and 'Retention Strategies' docs—so the whole agency benefits from one person's insight."
    },
    metrics: [
      { value: "70%", label: "Fewer repeat questions" },
      { value: "2x", label: "Faster handoffs" },
      { value: "Zero", label: "Knowledge silos" }
    ]
  },
  {
    id: "hr",
    icon: Building2,
    title: "HR & Onboarding",
    color: "bg-pink-500",
    shortDescription: "Ensure new hires always see the real, current way things are done. Keep employee handbooks and policies accurate.",
    shortBenefits: [
      "Handbook reflects current policies",
      "Reduce HR tickets about policy questions",
      "Audit-ready documentation always",
    ],
    description: "HR teams manage policies, benefits, and processes that affect everyone. When things change, employees need to find accurate information—not last year's version. New hires deserve to learn the real way things work.",
    challenge: "Policy updates announced in Slack never make it to the handbook. Employees find conflicting information between what they're told and what they read. New hires receive outdated onboarding materials that confuse rather than clarify.",
    solution: "Current monitors #hr-updates, #benefits, #company-news, and #new-hires channels. It identifies policy changes, benefit updates, and process shifts, then suggests updates to your employee handbook and HR documentation—ensuring everyone sees accurate information.",
    benefits: [
      "Employee handbook always reflects current policies",
      "Reduced HR tickets about policy questions",
      "Compliant, auditable documentation",
      "Consistent, accurate onboarding experience"
    ],
    scenario: {
      title: "Real-world scenario",
      content: "Your company updates its remote work policy and the HR lead announces it in #company-news. Current detects this and suggests updating three handbook sections: 'Remote Work Guidelines,' 'Equipment Reimbursement,' and 'Time Zone Expectations'—ensuring employees always find accurate information."
    },
    metrics: [
      { value: "100%", label: "Policy accuracy" },
      { value: "60%", label: "Fewer HR tickets" },
      { value: "Audit-ready", label: "Documentation" }
    ]
  },
];

const solutionStories = [
  {
    headline: "Ops team rolls out a new process across 4 regions without rewriting docs.",
    before: "Every regional team had their own version of the SOP. Updates took weeks to propagate, and teams constantly referenced outdated procedures.",
    after: "Current detects process changes discussed in Slack, suggests unified doc updates, and ensures all regions see the same accurate information—same day.",
  },
  {
    headline: "CS team updates onboarding journeys after product changes—without hunting through Notion.",
    before: "Product shipped a new dashboard feature. CS spent 3 days hunting through 47 Notion pages to find everything that needed updating.",
    after: "Current identified 12 affected pages within hours, drafted specific updates for each, and the team approved them with a few clicks.",
  },
  {
    headline: "Agency standardizes client playbooks while processes change weekly.",
    before: "Each account manager had their own \"system.\" New hires took months to ramp. Client handoffs were chaotic.",
    after: "Current captures tribal knowledge from team channels and builds a living playbook that evolves with the agency's best practices.",
  },
];

const crossCuttingBenefits = [
  { icon: Sparkles, label: "AI-powered drift detection" },
  { icon: CheckCircle2, label: "Human-in-the-loop approvals" },
  { icon: History, label: "Version history and diffs" },
  { icon: Puzzle, label: "Works with your existing tools" },
];

export default function UseCases() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 pb-16 lg:pt-28 lg:pb-24 px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight" data-testid="text-hero-headline">
            Solutions for teams who can't afford stale documentation.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            <em>Current</em> helps different teams keep their knowledge accurate and in sync with how they actually work—automatically, continuously, and without the busywork.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8 gap-2" data-testid="button-hero-signup">
                Get started free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/book-demo">
              <Button size="lg" variant="outline" className="text-base px-8" data-testid="button-hero-demo">
                Talk to us
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Built for ops, CS, RevOps, agencies, and HR.
          </p>
        </div>
      </section>

      {/* Solutions Overview Grid */}
      <section className="py-20 lg:py-28 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Solutions</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              One platform, many solutions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how <em>Current</em> solves documentation challenges for teams like yours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((solution) => (
              <Card key={solution.id} className="hover:shadow-lg transition-shadow" data-testid={`card-solution-${solution.id}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg ${solution.color} flex items-center justify-center`}>
                      <solution.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{solution.title}</h3>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {solution.shortDescription}
                  </p>
                  
                  <ul className="space-y-2 mb-4">
                    {solution.shortBenefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <a 
                    href={`#${solution.id}`} 
                    className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline"
                    data-testid={`link-learn-more-${solution.id}`}
                  >
                    Learn more <ArrowRight className="w-3 h-3" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Solution Sections */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto space-y-24">
          {solutions.map((solution, index) => (
            <div 
              key={solution.id} 
              id={solution.id}
              className="scroll-mt-24"
              data-testid={`section-${solution.id}`}
            >
              <div className={`grid lg:grid-cols-2 gap-12 items-start ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg ${solution.color} flex items-center justify-center`}>
                      <solution.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold">{solution.title}</h3>
                  </div>

                  <p className="text-muted-foreground mb-6">
                    {solution.description}
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-red-600 flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4" />
                        The Challenge
                      </h4>
                      <p className="text-sm text-muted-foreground pl-6">
                        {solution.challenge}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-primary flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4" />
                        How <em>Current</em> Helps
                      </h4>
                      <p className="text-sm text-muted-foreground pl-6">
                        {solution.solution}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Key Benefits
                      </h4>
                      <ul className="space-y-2 pl-6">
                        {solution.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Visual Card */}
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <Card className="overflow-hidden bg-white">
                    <CardHeader className={`${solution.color} text-white`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Quote className="w-5 h-5" />
                        <span className="text-sm font-medium">{solution.scenario.title}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {solution.scenario.content}
                      </p>
                      
                      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                        {solution.metrics.map((metric, idx) => (
                          <div key={idx} className="text-center">
                            <div className="text-2xl font-bold text-primary">{metric.value}</div>
                            <div className="text-xs text-muted-foreground">{metric.label}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deep-Dive Band: Why Teams Choose Current */}
      <section className="py-20 lg:py-28 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Column: Shared Pains */}
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                Why teams choose <em>Current</em>
              </h2>
              
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg">
                  Knowledge is scattered across Slack, Zoom, and random docs. What you documented three months ago probably doesn't match reality anymore.
                </p>
                <p>
                  Docs go stale within weeks. Updates announced in Slack never make it to your knowledge base. Tribal knowledge stays trapped in threads and DMs. New hires can't trust what they read.
                </p>
                <p>
                  The operational risk is real: people make decisions based on outdated SOPs. Customers get confused by old information. Teams waste hours searching for answers that should be documented.
                </p>
              </div>

              <div className="pt-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span>80% of company knowledge becomes outdated within 90 days.</span>
                </div>
              </div>
            </div>

            {/* Right Column: Cross-Cutting Benefits */}
            <div className="space-y-6">
              <Card className="bg-slate-50">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-6">
                    <em>Current</em> changes everything
                  </h3>
                  
                  <div className="space-y-4">
                    {crossCuttingBenefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <benefit.icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{benefit.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-[#4A154B] flex items-center justify-center ring-2 ring-white">
                          <SiSlack className="w-4 h-4 text-white" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center ring-2 ring-white">
                          <SiNotion className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Connects to tools you already use
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Mini Solution Stories Row */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Real scenarios, real results
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how teams like yours use <em>Current</em> to solve documentation challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {solutionStories.map((story, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow bg-white" data-testid={`card-story-${idx}`}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-4 leading-snug">
                    {story.headline}
                  </h3>
                  
                  <div className="space-y-4 text-sm">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-red-600 uppercase tracking-wide">Before</span>
                      </div>
                      <p className="text-muted-foreground">{story.before}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">After</span>
                      </div>
                      <p className="text-muted-foreground">{story.after}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Callout for Mid-Market */}
      <section className="py-12 px-6 lg:px-8 bg-primary/5 border-y border-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-6">
            Designed for teams of 20–500 people who are growing fast and tired of stale documentation.
          </h2>
          
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Users className="w-4 h-4 mr-2" />
              Ops & CS led rollouts
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Puzzle className="w-4 h-4 mr-2" />
              Works alongside Notion/Confluence
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <ArrowRight className="w-4 h-4 mr-2" />
              Fast to pilot, easy to expand
            </Badge>
          </div>
        </div>
      </section>

      {/* Integration Status */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Works with your tools</h2>
          <p className="text-muted-foreground mb-8">
            <em>Current</em> integrates with the tools your team already uses.
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-primary">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <SiSlack className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Slack</h3>
                <Badge variant="default" className="bg-emerald-500">Production Ready</Badge>
              </CardContent>
            </Card>
            
            <Card className="border-primary">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <SiNotion className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="font-semibold mb-1">Notion</h3>
                <Badge variant="default" className="bg-emerald-500">Production Ready</Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-1">Google Drive</h3>
                <Badge variant="secondary">Coming Soon</Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-1">Zoom & Meet</h3>
                <Badge variant="secondary">Coming Soon</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            See how <em>Current</em> fits your team.
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            In under 30 minutes, you can see your own processes and docs start to sync. Start your free trial or book a demo with our team.
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
                <li><Link href="/" className="hover:text-primary">Home</Link></li>
                <li><Link href="/product" className="hover:text-primary">Product</Link></li>
                <li><Link href="/how-it-works" className="hover:text-primary">How It Works</Link></li>
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
                <li><Link href="/compare/hiring-doc-manager" className="hover:text-primary">vs Hiring Doc Manager</Link></li>
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
                <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
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
