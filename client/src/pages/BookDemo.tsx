import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const demoFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(1, "Company name is required"),
  teamSize: z.string().min(1, "Please select team size"),
  mainUseCase: z.string().min(10, "Please describe your use case"),
});

type DemoFormValues = z.infer<typeof demoFormSchema>;

export default function BookDemo() {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<DemoFormValues>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      company: "",
      teamSize: "",
      mainUseCase: "",
    },
  });

  const demoMutation = useMutation({
    mutationFn: async (data: DemoFormValues) => {
      return apiRequest("/api/demo-request", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit demo request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: DemoFormValues) => {
    demoMutation.mutate(data);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="py-20 lg:py-32 px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-8 bg-gradient-to-br from-green-50 to-cyan-50 rounded-2xl p-12 lg:p-16 border-2 border-green-200">
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">
                Demo Booked Successfully!
              </h2>
              <p className="text-lg text-slate-600">
                Thank you for your interest in <em>Current</em>. We've sent a confirmation email to <span className="font-semibold">{form.getValues("email")}</span>.
              </p>
              <p className="text-slate-600">
                Our team will be in touch within 24 hours to schedule your personalized demo.
              </p>
            </div>

            <div className="space-y-3 pt-8 border-t">
              <p className="text-sm text-slate-600">In the meantime, check out our resources:</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/blog" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  Read our blog →
                </a>
                <a href="/pricing" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  Explore pricing →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="py-20 lg:py-32 px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900">
              Book Your Demo
            </h1>
            <p className="text-xl text-slate-600">
              See Current in action. Our team will walk you through exactly how we can help your organization.
            </p>
          </div>

          {/* Form */}
          <div className="bg-slate-50 rounded-2xl p-8 lg:p-12 border border-slate-200">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} data-testid="input-fullname" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@company.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Inc." {...field} data-testid="input-company" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="teamSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-teamsize">
                              <SelectValue placeholder="Select team size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1-10">1-10 people</SelectItem>
                            <SelectItem value="11-50">11-50 people</SelectItem>
                            <SelectItem value="51-100">51-100 people</SelectItem>
                            <SelectItem value="100+">100+ people</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="mainUseCase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What's your main use case?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your knowledge management challenges and what you're hoping to solve..."
                          className="resize-none"
                          rows={5}
                          {...field}
                          data-testid="textarea-usecase"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                    disabled={demoMutation.isPending}
                    data-testid="button-submit-demo"
                  >
                    {demoMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      "Book Demo"
                    )}
                  </Button>
                </div>

                <p className="text-xs text-slate-500 text-center">
                  We'll typically respond within 24 hours. No spam, no nonsense.
                </p>
              </form>
            </Form>
          </div>

          {/* Benefits */}
          <div className="mt-16 space-y-8">
            <h2 className="text-2xl font-bold text-slate-900 text-center">
              What to Expect
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  title: "15-min intro call",
                  description: "We'll discuss your knowledge management challenges"
                },
                {
                  title: "Live product demo",
                  description: "See how Current works with Slack and Notion"
                },
                {
                  title: "Pricing discussion",
                  description: "Find the right plan for your team's needs"
                }
              ].map((benefit, idx) => (
                <div key={idx} className="text-center space-y-2">
                  <h3 className="font-semibold text-slate-900">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-12 px-6 lg:px-8 mt-20">
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
