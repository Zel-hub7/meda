import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Loader2, Check, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  const verifyMutation = useMutation({
    mutationFn: async (verifyToken: string) => {
      return apiRequest(`/api/auth/verify-email?token=${verifyToken}`, {
        method: "GET",
      });
    },
    onSuccess: () => {
      setStatus("success");
    },
    onError: (error: any) => {
      setStatus("error");
      setErrorMessage(error.message || "Invalid or expired verification link");
    },
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    } else {
      setStatus("error");
      setErrorMessage("No verification token provided");
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="py-20 lg:py-32 px-6 lg:px-8">
        <div className="max-w-lg mx-auto text-center space-y-6">
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
              <h1 className="text-3xl font-bold text-slate-900">Verifying your email...</h1>
              <p className="text-lg text-slate-600">Please wait while we verify your email address.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Email verified!</h1>
              <p className="text-lg text-slate-600">
                Your email has been verified. You can now sign in to your account.
              </p>
              <Link href="/login">
                <Button size="lg" className="mt-4" data-testid="button-go-to-login">
                  Sign in to <em>Current</em>
                </Button>
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Verification failed</h1>
              <p className="text-lg text-slate-600">{errorMessage}</p>
              <div className="pt-4 space-y-4">
                <Link href="/login">
                  <Button variant="outline" data-testid="button-back-to-login">
                    Back to sign in
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
