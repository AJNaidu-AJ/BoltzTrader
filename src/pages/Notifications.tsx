import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

export default function Notifications() {
  const messages = [
    { id: "1", type: "system", title: "New Top Signal: AAPL", content: "High confidence signal detected", timestamp: "2 min ago", read: false },
    { id: "2", type: "telegram", title: "Alert: TSLA reached target", content: "Price alert triggered", timestamp: "15 min ago", read: false }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">2 unread messages</p>
      </div>

      <div className="space-y-3">
        {messages.map((msg) => (
          <Card key={msg.id} className={!msg.read ? "bg-accent/5 border-accent" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Bell className="h-5 w-5 text-accent mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold">{msg.title}</h3>
                    <Badge variant="secondary">{msg.type}</Badge>
                    <span className="text-xs text-muted-foreground ml-auto">{msg.timestamp}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{msg.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
