import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { enterpriseApiService, APIKey } from '@/services/enterpriseApiService';
import { useToast } from '@/components/ui/use-toast';
import { Key, Copy, Trash2, Plus, BarChart3, Shield } from 'lucide-react';

export const APIManagement = () => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [rateLimit, setRateLimit] = useState(1000);

  const availablePermissions = [
    { id: 'signals:read', label: 'Read Signals' },
    { id: 'trades:read', label: 'Read Trades' },
    { id: 'trades:write', label: 'Execute Trades' },
    { id: 'portfolio:read', label: 'Read Portfolio' },
    { id: 'strategies:read', label: 'Read Strategies' },
    { id: 'strategies:write', label: 'Manage Strategies' },
    { id: 'market:read', label: 'Market Data Access' }
  ];

  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = async () => {
    try {
      const keys = await enterpriseApiService.getAPIKeys();
      setApiKeys(keys);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load API keys", variant: "destructive" });
    }
  };

  const createAPIKey = async () => {
    if (!newKeyName || selectedPermissions.length === 0) {
      toast({ title: "Error", description: "Name and permissions are required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await enterpriseApiService.generateAPIKey(newKeyName, selectedPermissions, rateLimit);
      toast({ title: "Success", description: "API key created successfully" });
      
      setNewKeyName('');
      setSelectedPermissions([]);
      setRateLimit(1000);
      setShowCreateForm(false);
      loadAPIKeys();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create API key", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const revokeAPIKey = async (keyId: string) => {
    try {
      await enterpriseApiService.revokeAPIKey(keyId);
      toast({ title: "Success", description: "API key revoked" });
      loadAPIKeys();
    } catch (error) {
      toast({ title: "Error", description: "Failed to revoke API key", variant: "destructive" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "API key copied to clipboard" });
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permission]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => p !== permission));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Key Management
            </CardTitle>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No API keys created yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{key.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(key.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={key.is_active ? 'default' : 'secondary'}>
                        {key.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeAPIKey(key.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">API Key:</Label>
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                        {key.key}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(key.key)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Secret:</Label>
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                        {'*'.repeat(32)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(key.secret)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <div className="flex flex-wrap gap-1">
                      {key.permissions.map(perm => (
                        <Badge key={perm} variant="outline" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BarChart3 className="h-3 w-3" />
                      <span>{key.rate_limit}/hour</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Key Name</Label>
              <Input
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="My Trading Bot"
              />
            </div>

            <div>
              <Label>Rate Limit (requests per hour)</Label>
              <Input
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(parseInt(e.target.value) || 1000)}
                min="100"
                max="10000"
              />
            </div>

            <div>
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {availablePermissions.map(perm => (
                  <div key={perm.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={perm.id}
                      checked={selectedPermissions.includes(perm.id)}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(perm.id, !!checked)
                      }
                    />
                    <Label htmlFor={perm.id} className="text-sm">
                      {perm.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={createAPIKey} disabled={loading}>
                {loading ? 'Creating...' : 'Create API Key'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-medium text-blue-800 mb-1">API Security</h4>
              <p className="text-blue-700">
                Keep your API keys secure. Never share them publicly or commit them to version control.
                Use environment variables and rotate keys regularly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};