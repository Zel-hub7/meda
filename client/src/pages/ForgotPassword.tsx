import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, ArrowLeft, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotMutation = useMutation({
    mutationFn: async (data: ForgotPasswordForm) => {
      return apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    forgotMutation.mutate(data);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <section className="py-20 lg:py-32 px-6 lg:px-8">
          <div className="max-w-lg mx-auto text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Check your email</h1>
            <p className="text-lg text-slate-600">
              If an account exists with that email, we've sent you a password reset link.
            </p>
            <p className="text-slate-500">
              The link expires in 1 hour. Check your spam folder if you don't see it.
            </p>
            <Link href="/login">
              <Button variant="outline" className="mt-4" data-testid="button-back-to-login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to sign in
              </Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="py-20 lg:py-32 px-6 lg:px-8">
        <div className="max-w-lg mx-auto">
          <Link href="/login" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to sign in
          </Link>

          <div className="text-center space-y-4 mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
              Reset your password
            </h1>
            <p className="text-lg text-slate-600">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
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

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6"
                  disabled={forgotMutation.isPending}
                  data-testid="button-send-reset-link"
                >
                  {forgotMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Send reset link
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </section>
    </div>
  );
}
