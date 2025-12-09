import { Home, Clock, Settings, FileText, Slack, HardDrive, Activity, Shield } from "lucide-react";
import { SiNotion, SiGoogledrive, SiZoom, SiGooglemeet } from "react-icons/si";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Approval Queue", url: "/queue", icon: FileText, badge: 8 },
  { title: "Activity Log", url: "/activity", icon: Clock },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Health", url: "/health", icon: Activity },
  { title: "Admin", url: "/admin", icon: Shield },
];

const sourceItems = [
  { title: "Slack", icon: Slack, active: true },
  { title: "Google Drive", icon: SiGoogledrive, active: true },
  { title: "Zoom", icon: SiZoom, active: true },
  { title: "Google Meet", icon: SiGooglemeet, active: true },
  { title: "Notion", icon: SiNotion, active: true },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold"><span className="italic">Current</span></h2>
            <p className="text-xs text-muted-foreground">AI-Powered Knowledge Base</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild data-active={isActive}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Connected Sources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sourceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.active && (
                      <div className="ml-auto h-2 w-2 rounded-full bg-status-online" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
