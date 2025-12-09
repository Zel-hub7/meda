import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/Dashboard";
import ApprovalQueue from "@/pages/ApprovalQueue";
import ActivityLog from "@/pages/ActivityLog";
import Settings from "@/pages/Settings";
import Health from "@/pages/Health";
import Admin from "@/pages/Admin";
import Home from "@/pages/Home";
import Pricing from "@/pages/Pricing";
import Blog from "@/pages/Blog";
import BookDemo from "@/pages/BookDemo";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import VerifyEmail from "@/pages/VerifyEmail";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Security from "@/pages/Security";
import Product from "@/pages/Product";
import HowItWorks from "@/pages/HowItWorks";
import UseCases from "@/pages/UseCases";
import AcceptInvitation from "@/pages/AcceptInvitation";
import NotionVsCurrent from "@/pages/compare/NotionVsCurrent";
import ConfluenceVsCurrent from "@/pages/compare/ConfluenceVsCurrent";
import GuruVsCurrent from "@/pages/compare/GuruVsCurrent";
import SlabVsCurrent from "@/pages/compare/SlabVsCurrent";
import LoomVsCurrent from "@/pages/compare/LoomVsCurrent";
import GoogleDocsVsCurrent from "@/pages/compare/GoogleDocsVsCurrent";
import DropboxPaperVsCurrent from "@/pages/compare/DropboxPaperVsCurrent";
import HelpjuiceVsCurrent from "@/pages/compare/HelpjuiceVsCurrent";
import ToolStackVsCurrent from "@/pages/compare/ToolStackVsCurrent";
import InternalWikiVsCurrent from "@/pages/compare/InternalWikiVsCurrent";
import KnowledgeBaseVsCurrent from "@/pages/compare/KnowledgeBaseVsCurrent";
import SOPToolsVsCurrent from "@/pages/compare/SOPToolsVsCurrent";
import AIKnowledgeToolsVsCurrent from "@/pages/compare/AIKnowledgeToolsVsCurrent";
import ManualDocumentationVsCurrent from "@/pages/compare/ManualDocumentationVsCurrent";
import TribalKnowledgeVsCurrent from "@/pages/compare/TribalKnowledgeVsCurrent";
import SearchingSlackVsCurrent from "@/pages/compare/SearchingSlackVsCurrent";
import KeepingDocsUpdatedVsCurrent from "@/pages/compare/KeepingDocsUpdatedVsCurrent";
import UpdatingSOPsVsCurrent from "@/pages/compare/UpdatingSOPsVsCurrent";
import NotUpdatingDocsVsCurrent from "@/pages/compare/NotUpdatingDocsVsCurrent";
import HiringDocManagerVsCurrent from "@/pages/compare/HiringDocManagerVsCurrent";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

function AppRouter() {
  return (
    <Switch>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/queue" component={ApprovalQueue} />
      <Route path="/activity" component={ActivityLog} />
      <Route path="/settings" component={Settings} />
      <Route path="/health" component={Health} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function MarketingRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product" component={Product} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/use-cases" component={UseCases} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/blog" component={Blog} />
      <Route path="/book-demo" component={BookDemo} />
      <Route path="/compare/notion" component={NotionVsCurrent} />
      <Route path="/compare/confluence" component={ConfluenceVsCurrent} />
      <Route path="/compare/guru" component={GuruVsCurrent} />
      <Route path="/compare/slab" component={SlabVsCurrent} />
      <Route path="/compare/loom" component={LoomVsCurrent} />
      <Route path="/compare/google-docs" component={GoogleDocsVsCurrent} />
      <Route path="/compare/dropbox-paper" component={DropboxPaperVsCurrent} />
      <Route path="/compare/helpjuice" component={HelpjuiceVsCurrent} />
      <Route path="/compare/tool-stack" component={ToolStackVsCurrent} />
      <Route path="/compare/internal-wiki" component={InternalWikiVsCurrent} />
      <Route path="/compare/knowledge-base" component={KnowledgeBaseVsCurrent} />
      <Route path="/compare/sop-tools" component={SOPToolsVsCurrent} />
      <Route path="/compare/ai-knowledge-tools" component={AIKnowledgeToolsVsCurrent} />
      <Route path="/compare/manual-documentation" component={ManualDocumentationVsCurrent} />
      <Route path="/compare/tribal-knowledge" component={TribalKnowledgeVsCurrent} />
      <Route path="/compare/searching-slack" component={SearchingSlackVsCurrent} />
      <Route path="/compare/keeping-docs-updated" component={KeepingDocsUpdatedVsCurrent} />
      <Route path="/compare/updating-sops" component={UpdatingSOPsVsCurrent} />
      <Route path="/compare/not-updating-docs" component={NotUpdatingDocsVsCurrent} />
      <Route path="/compare/hiring-doc-manager" component={HiringDocManagerVsCurrent} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/security" component={Security} />
      <Route path="/invite/:token" component={AcceptInvitation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ProtectedAppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to={`/login?redirect=${encodeURIComponent(location)}`} />;
  }

  return (
    <>
      <AppSidebar />
      <div className="flex flex-col flex-1">
        <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-50">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto p-6">
          <AppRouter />
        </main>
      </div>
    </>
  );
}

export default function App() {
  const [location] = useLocation();
  
  const isAppRoute = location.startsWith("/dashboard") || 
                     location.startsWith("/queue") || 
                     location.startsWith("/activity") || 
                     location.startsWith("/settings") ||
                     location.startsWith("/health") ||
                     location.startsWith("/admin");
  
  const isMarketingRoute = location === "/" || 
                           location.startsWith("/product") ||
                           location.startsWith("/how-it-works") ||
                           location.startsWith("/use-cases") ||
                           location.startsWith("/pricing") || 
                           location.startsWith("/blog") || 
                           location.startsWith("/book-demo") ||
                           location.startsWith("/compare") ||
                           location.startsWith("/login") ||
                           location.startsWith("/signup") ||
                           location.startsWith("/verify-email") ||
                           location.startsWith("/forgot-password") ||
                           location.startsWith("/reset-password") ||
                           location.startsWith("/privacy") ||
                           location.startsWith("/terms") ||
                           location.startsWith("/security") ||
                           location.startsWith("/invite");
  
  // Marketing routes (no auth needed) and unknown routes (show 404)
  if (isMarketingRoute || !isAppRoute) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <MarketingRouter />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  // Protected app routes (requires auth)
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <ProtectedAppContent />
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
