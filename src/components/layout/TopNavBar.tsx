import { Search, Circle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function TopNavBar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const handleLogout = async () => {
    await signOut();
  };

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="flex h-16 items-center gap-4 px-6">
        <SidebarTrigger />
        
        {/* Global Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search symbols, sectors, or ask a question..."
              className="w-full pl-10"
            />
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-4">
          {/* Live Status */}
          <div className="flex items-center gap-2">
            <Circle className="h-2 w-2 fill-success text-success animate-pulse" />
            <span className="text-sm font-medium text-foreground">Live</span>
          </div>

          {/* Market Time */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{currentTime}</span>
          </div>

          {/* Plan Badge */}
          <Badge variant="outline" className="hidden md:inline-flex">
            Free Trial
          </Badge>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
