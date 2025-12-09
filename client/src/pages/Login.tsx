import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, ArrowRight, Shield, Zap, Users, Eye, EyeOff } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  
  const urlParams = new URLSearchParams(window.location.search);
  const redirect = urlParams.get("redirect") || "/dashboard";

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setLocation(redirect);
    }
  }, [isAuthenticated, isLoading, redirect, setLocation]);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      return apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation(redirect);
    },
    onError: (error: any) => {
      if (error.needsVerification) {
        toast({
          title: "Email Not Verified",
          description: "Please check your inbox and verify your email before logging in.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid email or password.",
          variant: "destructive",
        });
      }
    },
  });

  const handleReplitLogin = () => {
    const currentUrl = `${window.location.origin}${redirect}`;
    window.location.href = `/api/login?return_to=${encodeURIComponent(currentUrl)}`;
  };

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="py-20 lg:py-32 px-6 lg:px-8">
        <div className="max-w-lg mx-auto">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
              Sign in to <em>Current</em>
            </h1>
            <p className="text-lg text-slate-600">
              Access your team's AI-powered knowledge base
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-8 space-y-6">
            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6"
              onClick={handleReplitLogin}
              data-testid="button-login-replit"
            >
              Continue with Replit <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-50 px-2 text-slate-500">Or sign in with email</span>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@company.com"
                          {...field}
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link
                          href="/forgot-password"
                          className="text-xs text-primary hover:underline"
                          data-testid="link-forgot-password"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            {...field}
                            data-testid="input-password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            onClick={() => setShowPassword(!showPassword)}
                            data-testid="button-toggle-password"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  variant="outline"
                  className="w-full py-6 font-semibold"
                  disabled={loginMutation.isPending}
                  data-testid="button-login-email"
                >
                  {loginMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Sign in with email
                </Button>
              </form>
            </Form>

            <p className="text-sm text-slate-500 text-center">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </div>

          <div className="pt-8 space-y-4 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Why teams love <em>Current</em>
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-10 h-10 mx-auto rounded-lg bg-blue-50 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs text-slate-600">AI-Powered Updates</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 mx-auto rounded-lg bg-green-50 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-xs text-slate-600">Human Approval</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 mx-auto rounded-lg bg-purple-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xs text-slate-600">Team Collaboration</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500 text-center mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Start your 14-day free trial
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
