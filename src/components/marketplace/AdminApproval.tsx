import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

interface PendingStrategy {
  id: string;
  name: string;
  description: string;
  price: number;
  creator_name: string;
  created_at: string;
  strategy_data: any;
}

export const AdminApproval = () => {
  const { toast } = useToast();
  const [pendingStrategies, setPendingStrategies] = useState<PendingStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadPendingStrategies();
  }, []);

  const loadPendingStrategies = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_strategies')
        .select(`
          *,
          creator:profiles(full_name),
          strategy:strategies(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setPendingStrategies((data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        creator_name: item.creator?.full_name || 'Unknown',
        created_at: item.created_at,
        strategy_data: item.strategy
      })));
    } catch (error) {
      toast({ title: "Error", description: "Failed to load pending strategies", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (strategyId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('marketplace_strategies')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', strategyId);

      if (error) throw error;

      toast({ title: "Success", description: "Strategy approved successfully" });
      loadPendingStrategies();
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve strategy", variant: "destructive" });
    }
  };

  const handleReject = async (strategyId: string) => {
    if (!rejectionReason.trim()) {
      toast({ title: "Error", description: "Please provide a rejection reason", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('marketplace_strategies')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason
        })
        .eq('id', strategyId);

      if (error) throw error;

      toast({ title: "Success", description: "Strategy rejected" });
      setSelectedStrategy(null);
      setRejectionReason('');
      loadPendingStrategies();
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject strategy", variant: "destructive" });
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
            <Clock className="h-5 w-5" />
            Pending Strategy Approvals
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Review and approve strategies before they go live in the marketplace
          </p>
        </CardHeader>
      </Card>

      {pendingStrategies.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">No pending strategies to review</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingStrategies.map((strategy) => (
            <Card key={strategy.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{strategy.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      by {strategy.creator_name} • {new Date(strategy.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {strategy.price === 0 ? 'Free' : `$${strategy.price}`}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {strategy.description}
                  </p>
                </div>

                {strategy.strategy_data && (
                  <div>
                    <Label className="text-sm font-medium">Strategy Details</Label>
                    <div className="mt-2 p-3 bg-muted rounded text-xs">
                      <p><strong>Conditions:</strong> {strategy.strategy_data.conditions?.length || 0}</p>
                      <p><strong>Logic Groups:</strong> {strategy.strategy_data.logic?.groups?.length || 0}</p>
                    </div>
                  </div>
                )}

                {selectedStrategy === strategy.id && (
                  <div className="space-y-3 p-4 border rounded">
                    <Label>Rejection Reason</Label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain why this strategy is being rejected..."
                      rows={3}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(strategy.id)}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  
                  {selectedStrategy === strategy.id ? (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(strategy.id)}
                        disabled={!rejectionReason.trim()}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Confirm Reject
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedStrategy(null);
                          setRejectionReason('');
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedStrategy(strategy.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};