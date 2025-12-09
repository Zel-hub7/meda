import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, FileText, Loader2, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NotionPage {
  id: string;
  url: string;
  title: string;
  content: string;
}

interface NotionPagePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestionId: string | null;
  currentPageUrl?: string;
}

export function NotionPagePicker({
  open,
  onOpenChange,
  suggestionId,
  currentPageUrl,
}: NotionPagePickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setDebouncedQuery("");
    }
  }, [open]);

  const { data: pages = [], isLoading } = useQuery<NotionPage[]>({
    queryKey: ["/api/integrations/notion/pages", { query: debouncedQuery }],
    enabled: open,
  });

  const updateMutation = useMutation({
    mutationFn: async (notionPageId: string) => {
      if (!suggestionId) throw new Error("No suggestion selected");
      return await apiRequest(`/api/suggestions/${suggestionId}/notion-page`, {
        method: "PATCH",
        body: JSON.stringify({ notionPageId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      onOpenChange(false);
      toast({
        title: "Page Updated",
        description: "The linked Notion page has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update the Notion page",
        variant: "destructive",
      });
    },
  });

  const handleSelectPage = (page: NotionPage) => {
    updateMutation.mutate(page.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="dialog-notion-picker">
        <DialogHeader>
          <DialogTitle>Choose Notion Page</DialogTitle>
          <DialogDescription>
            Search for and select the correct Notion page for this knowledge update
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Notion pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-notion-search"
            />
          </div>

          <ScrollArea className="h-[300px] rounded-md border">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : pages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {debouncedQuery
                    ? "No pages found matching your search"
                    : "Enter a search term to find pages"}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {pages.map((page) => {
                  const isCurrentPage = currentPageUrl === page.url;
                  return (
                    <button
                      key={page.id}
                      onClick={() => handleSelectPage(page)}
                      disabled={updateMutation.isPending || isCurrentPage}
                      className={`w-full text-left p-3 rounded-md transition-colors ${
                        isCurrentPage
                          ? "bg-primary/10 border border-primary/30"
                          : "hover-elevate"
                      }`}
                      data-testid={`button-select-page-${page.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{page.title}</span>
                            {isCurrentPage && (
                              <span className="shrink-0 flex items-center gap-1 text-xs text-primary">
                                <Check className="h-3 w-3" />
                                Current
                              </span>
                            )}
                          </div>
                          {page.content && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {page.content.slice(0, 150)}
                              {page.content.length > 150 ? "..." : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {updateMutation.isPending && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating linked page...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
