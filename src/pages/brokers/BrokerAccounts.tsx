import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Shield, Users } from 'lucide-react';
import { BrokerCard } from './BrokerCard';
import { BrokerConnectModal } from './BrokerConnectModal';
import { getBrokerAccounts, unlinkBrokerAccount } from '@/services/brokers/brokerAPI';

export default function BrokerAccounts() {
  const [brokers, setBrokers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrokers();
  }, []);

  const loadBrokers = async () => {
    try {
      setLoading(true);
      const data = await getBrokerAccounts('user_123');
      setBrokers(data || []);
    } catch (error) {
      console.error('Failed to load broker accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect this broker account?')) {
      return;
    }

    try {
      await unlinkBrokerAccount('user_123', id);
      setBrokers(brokers.filter(b => b.id !== id));
      console.log(`✅ Broker account ${id} disconnected`);
    } catch (error) {
      console.error('Failed to disconnect broker account:', error);
    }
  };

  const handleModalSuccess = () => {
    loadBrokers(); // Reload brokers after successful connection
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Broker Accounts</h1>
          <p className="text-muted-foreground mt-2">
            Manage your connected broker accounts securely
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Link New Broker
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Connected Brokers</p>
                <p className="text-2xl font-bold">{brokers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Security Status</p>
                <p className="text-2xl font-bold text-green-600">Encrypted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Audit Logging</p>
                <p className="text-2xl font-bold text-purple-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Broker Accounts Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Your Broker Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading broker accounts...</p>
            </div>
          ) : brokers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No broker accounts connected yet</p>
              <Button onClick={() => setShowModal(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Connect Your First Broker
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {brokers.map((broker) => (
                <BrokerCard 
                  key={broker.id} 
                  broker={broker} 
                  onDisconnect={() => handleDisconnect(broker.id)} 
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Modal */}
      {showModal && (
        <BrokerConnectModal 
          onClose={() => setShowModal(false)} 
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}