import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FileText, ArrowRight, Eye, GitCompare } from "lucide-react";

interface DiffViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  currentContent: string;
  proposedContent: string;
  notionPageUrl?: string;
  knowledgeType?: string;
}

export function DiffViewer({
  open,
  onOpenChange,
  title,
  currentContent,
  proposedContent,
  notionPageUrl,
  knowledgeType,
}: DiffViewerProps) {
  const formatNotionPreview = (content: string) => {
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    return paragraphs.map((paragraph, idx) => {
      const trimmed = paragraph.trim();
      if (trimmed.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-2xl font-bold mb-4 mt-6 first:mt-0">
            {trimmed.replace('# ', '')}
          </h1>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl font-semibold mb-3 mt-5 first:mt-0">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-lg font-medium mb-2 mt-4 first:mt-0">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n').filter(l => l.trim());
        return (
          <ul key={idx} className="list-disc list-inside mb-3 space-y-1">
            {items.map((item, i) => (
              <li key={i} className="text-foreground">
                {item.replace(/^[-*]\s*/, '')}
              </li>
            ))}
          </ul>
        );
      }
      if (trimmed.match(/^\d+\.\s/)) {
        const items = trimmed.split('\n').filter(l => l.trim());
        return (
          <ol key={idx} className="list-decimal list-inside mb-3 space-y-1">
            {items.map((item, i) => (
              <li key={i} className="text-foreground">
                {item.replace(/^\d+\.\s*/, '')}
              </li>
            ))}
          </ol>
        );
      }
      return (
        <p key={idx} className="text-foreground mb-3 leading-relaxed">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]" data-testid="dialog-diff-viewer">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Compare current version with proposed changes
            {knowledgeType && (
              <Badge variant="outline" className="ml-2">
                {knowledgeType}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview" className="gap-2" data-testid="tab-preview">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="sidebyside" className="gap-2" data-testid="tab-side-by-side">
              <GitCompare className="h-4 w-4" />
              Compare
            </TabsTrigger>
            <TabsTrigger value="unified" data-testid="tab-unified">
              Unified View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="mt-4">
            <Card className="overflow-hidden">
              <div className="bg-accent/30 p-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    How this will appear in Notion
                  </span>
                </div>
                {notionPageUrl && (
                  <a
                    href={notionPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                    data-testid="link-notion-preview"
                  >
                    Open in Notion
                  </a>
                )}
              </div>
              <ScrollArea className="h-[450px]">
                <div className="p-6">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <h1 className="text-2xl font-bold mb-4 pb-2 border-b">
                      {title}
                    </h1>
                    {formatNotionPreview(proposedContent)}
                  </div>
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>
          
          <TabsContent value="sidebyside" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Current Version
                  </h4>
                </div>
                <ScrollArea className="h-[400px] rounded-md border bg-muted/30 p-4">
                  <pre className="text-sm font-mono whitespace-pre-wrap text-muted-foreground">
                    {currentContent || "No existing content - this is a new page"}
                  </pre>
                </ScrollArea>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-status-online" />
                  <h4 className="text-sm font-medium text-status-online">
                    Proposed Changes
                  </h4>
                </div>
                <ScrollArea className="h-[400px] rounded-md border bg-status-online/5 p-4 border-status-online/20">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {proposedContent}
                  </pre>
                </ScrollArea>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <span>Current</span>
              <ArrowRight className="h-4 w-4" />
              <span className="text-status-online font-medium">Proposed</span>
            </div>
          </TabsContent>
          
          <TabsContent value="unified" className="mt-4">
            <ScrollArea className="h-[450px] rounded-md border p-4">
              <div className="space-y-1 font-mono text-sm">
                {currentContent && currentContent !== "No existing content" && (
                  <>
                    <div className="text-xs text-muted-foreground mb-2 pb-2 border-b">
                      Removed from current version:
                    </div>
                    {currentContent.split('\n').map((line, idx) => (
                      <div
                        key={`old-${idx}`}
                        className="bg-status-busy/10 text-status-busy px-2 py-0.5 rounded"
                      >
                        <span className="text-muted-foreground mr-4 select-none">{idx + 1}</span>
                        - {line}
                      </div>
                    ))}
                    <div className="h-4" />
                  </>
                )}
                <div className="text-xs text-muted-foreground mb-2 pb-2 border-b">
                  New content:
                </div>
                {proposedContent.split('\n').map((line, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="bg-status-online/10 text-status-online px-2 py-0.5 rounded"
                  >
                    <span className="text-muted-foreground mr-4 select-none">
                      {idx + 1}
                    </span>
                    + {line}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
