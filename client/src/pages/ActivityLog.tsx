import { ActivityItem } from "@/components/ActivityItem";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Loader2, FileText } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ActivityLog as ActivityLogType } from "@shared/schema";
import { formatDistanceToNow, startOfToday, startOfYesterday, subDays } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function ActivityLog() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: activity = [], isLoading } = useQuery<ActivityLogType[]>({
    queryKey: ["/api/activity", { status: statusFilter !== "all" ? statusFilter : undefined }],
  });

  const filteredActivity = activity.filter((item) =>
    searchQuery ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const today = startOfToday();
  const yesterday = startOfYesterday();
  const lastWeek = subDays(today, 7);

  const todayActivity = filteredActivity.filter(
    (item) => new Date(item.createdAt) >= today
  );
  const yesterdayActivity = filteredActivity.filter(
    (item) => new Date(item.createdAt) >= yesterday && new Date(item.createdAt) < today
  );
  const lastWeekActivity = filteredActivity.filter(
    (item) => new Date(item.createdAt) >= lastWeek && new Date(item.createdAt) < yesterday
  );
  const olderActivity = filteredActivity.filter(
    (item) => new Date(item.createdAt) < lastWeek
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Activity Log</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View all knowledge base update activity
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-activity"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="detected">Detected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredActivity.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No activity found</h3>
            <p className="text-muted-foreground mb-4">
              {activity.length === 0 
                ? "Activity will appear here as you approve or reject suggestions."
                : "Try adjusting your filters or search query."}
            </p>
            {activity.length === 0 && (
              <Link href="/queue">
                <Button variant="outline" size="sm">
                  View Pending Suggestions
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {todayActivity.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Today</h3>
              <div className="space-y-2">
                {todayActivity.map((item) => (
                  <ActivityItem
                    key={item.id}
                    id={item.id}
                    status={item.status as any}
                    title={item.title}
                    source={item.sourceType as any}
                    timestamp={formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    user={item.userName || undefined}
                  />
                ))}
              </div>
            </div>
          )}

          {yesterdayActivity.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Yesterday</h3>
              <div className="space-y-2">
                {yesterdayActivity.map((item) => (
                  <ActivityItem
                    key={item.id}
                    id={item.id}
                    status={item.status as any}
                    title={item.title}
                    source={item.sourceType as any}
                    timestamp={formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    user={item.userName || undefined}
                  />
                ))}
              </div>
            </div>
          )}

          {lastWeekActivity.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Last 7 Days</h3>
              <div className="space-y-2">
                {lastWeekActivity.map((item) => (
                  <ActivityItem
                    key={item.id}
                    id={item.id}
                    status={item.status as any}
                    title={item.title}
                    source={item.sourceType as any}
                    timestamp={formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    user={item.userName || undefined}
                  />
                ))}
              </div>
            </div>
          )}

          {olderActivity.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Older</h3>
              <div className="space-y-2">
                {olderActivity.map((item) => (
                  <ActivityItem
                    key={item.id}
                    id={item.id}
                    status={item.status as any}
                    title={item.title}
                    source={item.sourceType as any}
                    timestamp={formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    user={item.userName || undefined}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
