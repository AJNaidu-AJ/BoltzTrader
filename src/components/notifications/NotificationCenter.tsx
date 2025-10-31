import { Bell, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, useMarkNotificationRead } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

export const NotificationCenter = ({ userId }: { userId: string }) => {
  const { data: notifications, isLoading } = useNotifications(userId);
  const markAsRead = useMarkNotificationRead();

  if (isLoading) return <div>Loading notifications...</div>;

  const unreadCount = notifications?.data?.filter(n => !n.read_at).length || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {notifications?.data?.length === 0 ? (
            <p className="text-center text-muted-foreground p-4">
              No notifications yet
            </p>
          ) : (
            notifications?.data?.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b flex items-start justify-between ${
                  !notification.read_at ? 'bg-muted/50' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{notification.title}</h4>
                    {!notification.read_at && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.content}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!notification.read_at && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markAsRead.mutate(notification.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};