import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { notificationService } from '@/services/notificationService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Bell, Mail, MessageCircle, Smartphone, TestTube } from 'lucide-react';

interface NotificationSettings {
  signal_alerts: boolean;
  news_alerts: boolean;
  price_alerts: boolean;
  trade_confirmations: boolean;
  delivery_methods: string[];
  email_address: string;
  telegram_chat_id: string;
}

export const NotificationPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>({
    signal_alerts: true,
    news_alerts: false,
    price_alerts: true,
    trade_confirmations: true,
    delivery_methods: ['system'],
    email_address: '',
    telegram_chat_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);

  useEffect(() => {
    checkPushSupport();
    loadPreferences();
    notificationService.initialize();
  }, [user]);

  const checkPushSupport = () => {
    setPushSupported('serviceWorker' in navigator && 'PushManager' in window);
  };

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (data && data.length > 0) {
        const prefs = data.reduce((acc, pref) => {
          acc[pref.notification_type] = pref.enabled;
          if (pref.delivery_methods) {
            acc.delivery_methods = [...new Set([...acc.delivery_methods, ...pref.delivery_methods])];
          }
          return acc;
        }, { ...settings });

        setSettings(prefs);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const preferences = [
        { notification_type: 'signal_alerts', enabled: settings.signal_alerts },
        { notification_type: 'news_alerts', enabled: settings.news_alerts },
        { notification_type: 'price_alerts', enabled: settings.price_alerts },
        { notification_type: 'trade_confirmations', enabled: settings.trade_confirmations }
      ];

      for (const pref of preferences) {
        await supabase
          .from('notification_preferences')
          .upsert({
            user_id: user.id,
            notification_type: pref.notification_type,
            enabled: pref.enabled,
            delivery_methods: settings.delivery_methods
          });
      }

      toast({
        title: "Success",
        description: "Notification preferences saved"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePushPermission = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      await notificationService.subscribeToPush();
      setSettings(prev => ({
        ...prev,
        delivery_methods: [...new Set([...prev.delivery_methods, 'push'])]
      }));
      toast({
        title: "Success",
        description: "Push notifications enabled"
      });
    } else {
      toast({
        title: "Permission Denied",
        description: "Push notifications require permission",
        variant: "destructive"
      });
    }
  };

  const testNotification = () => {
    notificationService.sendTestNotification();
    toast({
      title: "Test Sent",
      description: "Check your notifications"
    });
  };

  const updateDeliveryMethod = (method: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      delivery_methods: enabled
        ? [...new Set([...prev.delivery_methods, method])]
        : prev.delivery_methods.filter(m => m !== method)
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Types */}
        <div className="space-y-4">
          <h4 className="font-medium">Alert Types</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Signal Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when signals match your profile</p>
              </div>
              <Switch
                checked={settings.signal_alerts}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, signal_alerts: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Breaking News</Label>
                <p className="text-sm text-muted-foreground">Important market news and events</p>
              </div>
              <Switch
                checked={settings.news_alerts}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, news_alerts: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Price Alerts</Label>
                <p className="text-sm text-muted-foreground">Custom price threshold notifications</p>
              </div>
              <Switch
                checked={settings.price_alerts}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, price_alerts: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Trade Confirmations</Label>
                <p className="text-sm text-muted-foreground">Order execution and status updates</p>
              </div>
              <Switch
                checked={settings.trade_confirmations}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, trade_confirmations: checked }))
                }
              />
            </div>
          </div>
        </div>

        {/* Delivery Methods */}
        <div className="space-y-4">
          <h4 className="font-medium">Delivery Methods</h4>
          
          <div className="space-y-3">
            {pushSupported && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Browser notifications</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={settings.delivery_methods.includes('push')}
                    onCheckedChange={(checked) => updateDeliveryMethod('push', !!checked)}
                  />
                  {!settings.delivery_methods.includes('push') && (
                    <Button size="sm" variant="outline" onClick={handlePushPermission}>
                      Enable
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send alerts to your email</p>
                </div>
              </div>
              <Checkbox
                checked={settings.delivery_methods.includes('email')}
                onCheckedChange={(checked) => updateDeliveryMethod('email', !!checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <div>
                  <Label>Telegram Alerts</Label>
                  <p className="text-sm text-muted-foreground">Connect your Telegram account</p>
                </div>
              </div>
              <Checkbox
                checked={settings.delivery_methods.includes('telegram')}
                onCheckedChange={(checked) => updateDeliveryMethod('telegram', !!checked)}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        {(settings.delivery_methods.includes('email') || settings.delivery_methods.includes('telegram')) && (
          <div className="space-y-4">
            <h4 className="font-medium">Contact Information</h4>
            
            {settings.delivery_methods.includes('email') && (
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={settings.email_address}
                  onChange={(e) => setSettings(prev => ({ ...prev, email_address: e.target.value }))}
                  placeholder="your@email.com"
                />
              </div>
            )}

            {settings.delivery_methods.includes('telegram') && (
              <div className="space-y-2">
                <Label>Telegram Chat ID</Label>
                <Input
                  value={settings.telegram_chat_id}
                  onChange={(e) => setSettings(prev => ({ ...prev, telegram_chat_id: e.target.value }))}
                  placeholder="@username or chat ID"
                />
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button onClick={savePreferences} disabled={loading}>
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
          <Button variant="outline" onClick={testNotification}>
            <TestTube className="h-4 w-4 mr-2" />
            Test Notification
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};