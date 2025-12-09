import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface InvitationDetails {
  id: string;
  email: string;
  role: string;
  teamName: string;
  expiresAt: string;
}

export default function AcceptInvitation() {
  const params = useParams<{ token: string }>();
  const [, navigate] = useLocation();
  const { user, isLoading: authLoading } = useAuth();

  const { data: invitation, isLoading, error } = useQuery<InvitationDetails>({
    queryKey: ["/api/invitations", params.token],
    queryFn: async () => {
      const res = await fetch(`/api/invitations/${params.token}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load invitation");
      }
      return res.json();
    },
    enabled: !!params.token,
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/invitations/${params.token}/accept`, {
        method: "POST",
      });
    },
    onSuccess: (data: { teamId: string; teamName: string }) => {
      setTimeout(() => {
        navigate("/");
      }, 2000);
    },
  });

  const handleAccept = () => {
    acceptMutation.mutate();
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              You need to sign in to accept this invitation
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {invitation && (
              <p className="mb-4 text-sm text-muted-foreground">
                You've been invited to join <strong>{invitation.teamName}</strong>
              </p>
            )}
            <Button asChild className="w-full" data-testid="button-login-to-accept">
              <a href="/api/login">Sign In to Accept Invitation</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              {(error as Error).message || "This invitation is no longer valid"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" onClick={() => navigate("/")} data-testid="button-go-home">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (acceptMutation.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <CardTitle>Welcome to the Team!</CardTitle>
            <CardDescription>
              You've successfully joined {invitation?.teamName}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Redirecting you to the dashboard...
            </p>
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (acceptMutation.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle>Could Not Accept Invitation</CardTitle>
            <CardDescription>
              {(acceptMutation.error as any)?.message || "Something went wrong"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button variant="outline" onClick={() => navigate("/")} data-testid="button-go-home-error">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Team Invitation</CardTitle>
          <CardDescription>
            You've been invited to join a team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg font-medium">{invitation?.teamName}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Role: <span className="capitalize">{invitation?.role}</span>
            </p>
          </div>

          <div className="bg-muted/50 rounded-md p-4 text-sm">
            <p className="text-muted-foreground">
              Invitation sent to: <span className="font-medium text-foreground">{invitation?.email}</span>
            </p>
            <p className="text-muted-foreground mt-1">
              Expires: {invitation?.expiresAt && new Date(invitation.expiresAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate("/")}
              data-testid="button-decline-invitation"
            >
              Decline
            </Button>
            <Button 
              className="flex-1"
              onClick={handleAccept}
              disabled={acceptMutation.isPending}
              data-testid="button-accept-invitation"
            >
              {acceptMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Accept Invitation"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
