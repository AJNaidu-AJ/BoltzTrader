import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Settings, AlertTriangle, CheckCircle } from 'lucide-react';

interface BrokerConfig {
  broker_id: string;
  name: string;
  is_sandbox: boolean;
  is_active: boolean;
  api_endpoint: string;
  last_updated: string;
}

export const BrokerToggle = () => {
  const { toast } = useToast();
  const [brokers, setBrokers] = useState<BrokerConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrokerConfigs();
  }, []);

  const loadBrokerConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('broker_configs')
        .select('*')
        .order('name');

      if (error) throw error;

      setBrokers(data || [
        {
          broker_id: 'zerodha',
          name: 'Zerodha',
          is_sandbox: true,
          is_active: true,
          api_endpoint: 'https://api.kite.trade',
          last_updated: new Date().toISOString()
        },
        {
          broker_id: 'alpaca',
          name: 'Alpaca',
          is_sandbox: true,
          is_active: true,
          api_endpoint: 'https://paper-api.alpaca.markets',
          last_updated: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Error loading broker configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSandboxMode = async (brokerId: string, isSandbox: boolean) => {
    try {
      const { error } = await supabase
        .from('broker_configs')
        .upsert({
          broker_id: brokerId,
          is_sandbox: isSandbox,
          last_updated: new Date().toISOString()
        });

      if (error) throw error;

      setBrokers(prev => prev.map(broker => 
        broker.broker_id === brokerId 
          ? { ...broker, is_sandbox: isSandbox }
          : broker
      ));

      toast({
        title: "Success",
        description: `${brokerId} switched to ${isSandbox ? 'sandbox' : 'live'} mode`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update broker configuration",
        variant: "destructive"
      });
    }
  };

  const toggleBrokerStatus = async (brokerId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('broker_configs')
        .upsert({
          broker_id: brokerId,
          is_active: isActive,
          last_updated: new Date().toISOString()
        });

      if (error) throw error;

      setBrokers(prev => prev.map(broker => 
        broker.broker_id === brokerId 
          ? { ...broker, is_active: isActive }
          : broker
      ));

      toast({
        title: "Success",
        description: `${brokerId} ${isActive ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update broker status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Broker Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Switching to live mode will execute real trades with real money. 
              Ensure all systems are properly tested in sandbox mode first.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {brokers.map((broker) => (
              <div key={broker.broker_id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{broker.name}</h3>
                    <Badge variant={broker.is_active ? 'default' : 'secondary'}>
                      {broker.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant={broker.is_sandbox ? 'outline' : 'destructive'}>
                      {broker.is_sandbox ? 'Sandbox' : 'Live'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {!broker.is_sandbox && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Broker Status</span>
                    <Switch
                      checked={broker.is_active}
                      onCheckedChange={(checked) => 
                        toggleBrokerStatus(broker.broker_id, checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Mode: {broker.is_sandbox ? 'Sandbox' : 'Live Trading'}
                    </span>
                    <Switch
                      checked={!broker.is_sandbox}
                      onCheckedChange={(checked) => 
                        toggleSandboxMode(broker.broker_id, !checked)
                      }
                      disabled={!broker.is_active}
                    />
                  </div>
                </div>

                <div className="mt-4 text-xs text-muted-foreground">
                  <p>API Endpoint: {broker.api_endpoint}</p>
                  <p>Last Updated: {new Date(broker.last_updated).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-medium text-red-800 mb-1">Live Trading Checklist</h4>
              <ul className="text-red-700 space-y-1">
                <li>• All strategies tested thoroughly in sandbox mode</li>
                <li>• Risk management parameters configured</li>
                <li>• Account funding and broker API keys verified</li>
                <li>• Monitoring and alerting systems active</li>
                <li>• Emergency stop procedures documented</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};