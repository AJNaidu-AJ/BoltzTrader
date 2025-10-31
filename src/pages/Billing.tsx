import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Billing() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your plan and payment methods</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Current Plan
            <Badge>Free Trial</Badge>
          </CardTitle>
          <CardDescription>7 days remaining in trial period</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Signals viewed today</span>
              <span className="font-medium">15 / 50</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '30%' }} />
            </div>
          </div>
          <Button className="w-full">Upgrade to Pro</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Retail Trader</CardTitle>
            <div className="text-3xl font-bold">$29<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ 100 signals/day</li>
              <li>✓ Basic analysis</li>
              <li>✓ Email alerts</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Power User</CardTitle>
            <div className="text-3xl font-bold">$99<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ Unlimited signals</li>
              <li>✓ Advanced analysis</li>
              <li>✓ Multi-channel alerts</li>
              <li>✓ API access</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin</CardTitle>
            <div className="text-3xl font-bold">Custom</div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ Everything in Pro</li>
              <li>✓ Team management</li>
              <li>✓ Admin console</li>
              <li>✓ Priority support</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
