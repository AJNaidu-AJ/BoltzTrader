import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  PieChart,
  History,
  Star,
  Bell,
  CreditCard,
  Settings,
  Shield,
  TrendingUp,
  Workflow,
  Store,
  Globe,
  Bot,
  Building,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Analysis", url: "/analysis", icon: Search },
  { title: "Sectors", url: "/sectors", icon: PieChart },
  { title: "History", url: "/history", icon: History },
  { title: "Trading", url: "/trading", icon: TrendingUp },
  { title: "Strategy Builder", url: "/strategy-builder", icon: Workflow },
  { title: "Marketplace", url: "/marketplace", icon: Store },
  { title: "Global Markets", url: "/global-markets", icon: Globe },
  { title: "AI Agent", url: "/ai-agent", icon: Bot },
  { title: "Enterprise", url: "/enterprise", icon: Building },
  { title: "Watchlist", url: "/watchlist", icon: Star },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Billing", url: "/billing", icon: CreditCard },
  { title: "Settings", url: "/settings", icon: Settings },
];

const adminItems = [
  { title: "Admin Console", url: "/admin", icon: Shield },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        {/* Logo Section */}
        <div className="flex items-center justify-center h-16 border-b border-sidebar-border">
          {open ? (
            <h1 className="text-lg font-bold text-sidebar-foreground">BoltzTrader</h1>
          ) : (
            <span className="text-lg font-bold text-sidebar-foreground">BT</span>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
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
