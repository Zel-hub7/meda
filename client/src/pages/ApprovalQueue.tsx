import { ApprovalCard } from "@/components/ApprovalCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, CheckCircle, Loader2, X } from "lucide-react";
import { useState } from "react";
import { DiffViewer } from "@/components/DiffViewer";
import { NotionPagePicker } from "@/components/NotionPagePicker";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { Suggestion } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

export default function ApprovalQueue() {
  const [sourceFilter, setSourceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [confidenceThreshold, setConfidenceThreshold] = useState([70]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [diffOpen, setDiffOpen] = useState(false);
  const [selectedDiff, setSelectedDiff] = useState<{
    title: string;
    current: string;
    proposed: string;
    notionPageUrl?: string;
    knowledgeType?: string;
  } | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    suggestionId: string | null;
  }>({ open: false, suggestionId: null });
  const [bulkRejectDialog, setBulkRejectDialog] = useState(false);
  const [notionPicker, setNotionPicker] = useState<{
    open: boolean;
    suggestionId: string | null;
    currentPageUrl?: string;
  }>({ open: false, suggestionId: null });
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: suggestions = [], isLoading } = useQuery<Suggestion[]>({
    queryKey: ["/api/suggestions", { status: "pending" }],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, userName }: { id: string; userName: string }) => {
      return apiRequest(`/api/suggestions/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ userName }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Update Approved",
        description: "The knowledge base has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve suggestion",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, userName }: { id: string; userName: string }) => {
      return apiRequest(`/api/suggestions/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ userName }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setRejectDialog({ open: false, suggestionId: null });
      toast({
        title: "Update Rejected",
        description: "The suggestion has been rejected.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject suggestion",
        variant: "destructive",
      });
    },
  });

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return "Unknown User";
  };

  const bulkApproveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return apiRequest("/api/suggestions/bulk-approve", {
        method: "POST",
        body: JSON.stringify({ ids }),
      });
    },
    onSuccess: (data: { approved: string[]; failed: { id: string; error: string }[] }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setSelectedIds(new Set());
      
      if (data.approved.length > 0) {
        toast({
          title: "Bulk Approval Complete",
          description: `${data.approved.length} suggestion(s) approved successfully.${data.failed.length > 0 ? ` ${data.failed.length} failed.` : ''}`,
        });
      }
      if (data.failed.length > 0 && data.approved.length === 0) {
        toast({
          title: "Bulk Approval Failed",
          description: `All ${data.failed.length} suggestion(s) failed to approve.`,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Bulk Approval Failed",
        description: error.message || "Failed to approve suggestions",
        variant: "destructive",
      });
    },
  });

  const bulkRejectMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return apiRequest("/api/suggestions/bulk-reject", {
        method: "POST",
        body: JSON.stringify({ ids }),
      });
    },
    onSuccess: (data: { rejected: string[]; failed: { id: string; error: string }[] }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setSelectedIds(new Set());
      setBulkRejectDialog(false);
      
      if (data.rejected.length > 0) {
        toast({
          title: "Bulk Rejection Complete",
          description: `${data.rejected.length} suggestion(s) rejected.${data.failed.length > 0 ? ` ${data.failed.length} failed.` : ''}`,
        });
      }
      if (data.failed.length > 0 && data.rejected.length === 0) {
        toast({
          title: "Bulk Rejection Failed",
          description: `All ${data.failed.length} suggestion(s) failed to reject.`,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Bulk Rejection Failed",
        description: error.message || "Failed to reject suggestions",
        variant: "destructive",
      });
    },
  });

  const handleSelectSuggestion = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredSuggestions.map((s) => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBulkApprove = () => {
    const ids = Array.from(selectedIds);
    bulkApproveMutation.mutate(ids);
  };

  const handleBulkReject = () => {
    setBulkRejectDialog(true);
  };

  const handleConfirmBulkReject = () => {
    const ids = Array.from(selectedIds);
    bulkRejectMutation.mutate(ids);
  };

  const handleApproveClick = (id: string) => {
    const displayName = getUserDisplayName();
    approveMutation.mutate({ id, userName: displayName });
  };

  const handleRejectClick = (id: string) => {
    setRejectDialog({ open: true, suggestionId: id });
  };

  const handleChangeNotionPage = (id: string) => {
    const suggestion = suggestions.find(s => s.id === id);
    setNotionPicker({ 
      open: true, 
      suggestionId: id, 
      currentPageUrl: suggestion?.notionPageUrl 
    });
  };

  const handleConfirmReject = () => {
    if (!rejectDialog.suggestionId) return;
    const displayName = getUserDisplayName();
    rejectMutation.mutate({ id: rejectDialog.suggestionId, userName: displayName });
  };

  const handleViewDiff = (suggestion: Suggestion) => {
    setSelectedDiff({
      title: suggestion.title,
      current: suggestion.currentContent || "No existing content",
      proposed: suggestion.proposedContent,
      notionPageUrl: suggestion.notionPageUrl,
      knowledgeType: suggestion.knowledgeType || undefined,
    });
    setDiffOpen(true);
  };

  const filteredSuggestions = suggestions.filter((s) => {
    if (sourceFilter !== "all" && s.sourceType !== sourceFilter) return false;
    if (typeFilter !== "all" && s.knowledgeType !== typeFilter) return false;
    if (s.confidence < confidenceThreshold[0]) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Approval Queue</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and approve pending knowledge base updates
        </p>
      </div>

      <div className="flex flex-col gap-4 p-4 bg-card rounded-md border">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Source</label>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger data-testid="select-source-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="drive">Google Drive</SelectItem>
                <SelectItem value="zoom">Zoom</SelectItem>
                <SelectItem value="meet">Google Meet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Type</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger data-testid="select-type-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="policy">Policy</SelectItem>
                <SelectItem value="sop">SOP</SelectItem>
                <SelectItem value="decision">Decision</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="process">Process</SelectItem>
                <SelectItem value="product">Product</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Min Confidence: {confidenceThreshold[0]}%
            </label>
            <Slider
              value={confidenceThreshold}
              onValueChange={setConfidenceThreshold}
              min={50}
              max={100}
              step={5}
              className="mt-2"
              data-testid="slider-confidence"
            />
          </div>
        </div>
        
        {filteredSuggestions.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Checkbox
              checked={filteredSuggestions.length > 0 && selectedIds.size === filteredSuggestions.length}
              onCheckedChange={handleSelectAll}
              data-testid="checkbox-select-all"
            />
            <label className="text-sm text-muted-foreground">
              Select All ({filteredSuggestions.length})
            </label>
          </div>
        )}
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-4 p-4 bg-primary/10 rounded-md border border-primary/20">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" data-testid="text-selected-count">
              {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSelection}
              data-testid="button-clear-selection"
            >
              Clear Selection
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleBulkReject}
              disabled={bulkRejectMutation.isPending}
              className="gap-1"
              data-testid="button-bulk-reject"
            >
              {bulkRejectMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Reject All
            </Button>
            <Button
              size="sm"
              onClick={handleBulkApprove}
              disabled={bulkApproveMutation.isPending}
              className="gap-1"
              data-testid="button-bulk-approve"
            >
              {bulkApproveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Approve All
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredSuggestions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">All caught up!</h3>
            <p className="text-muted-foreground mb-4">
              {suggestions.length === 0 
                ? "No pending suggestions. Connect your sources to start detecting knowledge updates."
                : "No suggestions match your current filters."}
            </p>
            {suggestions.length === 0 && (
              <Link href="/settings?tab=integrations">
                <Button variant="outline" size="sm">
                  Connect Sources
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSuggestions.map((suggestion) => (
            <ApprovalCard
              key={suggestion.id}
              id={suggestion.id}
              source={suggestion.sourceType as any}
              type={suggestion.knowledgeType as any}
              title={suggestion.title}
              proposedContent={suggestion.proposedContent}
              currentContent={suggestion.currentContent || undefined}
              confidence={suggestion.confidence}
              timestamp={formatDistanceToNow(new Date(suggestion.createdAt), { addSuffix: true })}
              sourceLink={suggestion.sourceLink}
              notionPage={suggestion.notionPageUrl}
              aiReasoning={suggestion.aiReasoning || undefined}
              isSelected={selectedIds.has(suggestion.id)}
              onSelect={handleSelectSuggestion}
              onApprove={handleApproveClick}
              onReject={handleRejectClick}
              onViewDiff={() => handleViewDiff(suggestion)}
              onChangeNotionPage={handleChangeNotionPage}
            />
          ))}
        </div>
      )}

      {selectedDiff && (
        <DiffViewer
          open={diffOpen}
          onOpenChange={setDiffOpen}
          title={selectedDiff.title}
          currentContent={selectedDiff.current}
          proposedContent={selectedDiff.proposed}
          notionPageUrl={selectedDiff.notionPageUrl}
          knowledgeType={selectedDiff.knowledgeType}
        />
      )}

      <Dialog 
        open={rejectDialog.open} 
        onOpenChange={(open) => {
          setRejectDialog({ ...rejectDialog, open });
        }}
      >
        <DialogContent data-testid="dialog-rejection">
          <DialogHeader>
            <DialogTitle>Reject Suggestion</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this suggestion? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setRejectDialog({ open: false, suggestionId: null });
              }}
              data-testid="button-cancel-reject"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReject}
              disabled={rejectMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-reject"
            >
              {rejectMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NotionPagePicker
        open={notionPicker.open}
        onOpenChange={(open) => {
          setNotionPicker({ ...notionPicker, open });
        }}
        suggestionId={notionPicker.suggestionId}
        currentPageUrl={notionPicker.currentPageUrl}
      />

      <Dialog 
        open={bulkRejectDialog} 
        onOpenChange={setBulkRejectDialog}
      >
        <DialogContent data-testid="dialog-bulk-rejection">
          <DialogHeader>
            <DialogTitle>Reject {selectedIds.size} Suggestion{selectedIds.size !== 1 ? 's' : ''}</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject {selectedIds.size} selected suggestion{selectedIds.size !== 1 ? 's' : ''}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setBulkRejectDialog(false)}
              data-testid="button-cancel-bulk-reject"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBulkReject}
              disabled={bulkRejectMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-bulk-reject"
            >
              {bulkRejectMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                `Reject ${selectedIds.size} Suggestion${selectedIds.size !== 1 ? 's' : ''}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
