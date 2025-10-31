import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { marketplaceService } from '@/services/marketplaceService';
import { strategyService } from '@/services/strategyService';
import { useToast } from '@/components/ui/use-toast';
import { Upload, DollarSign, Info } from 'lucide-react';

export const StrategyPublisher = () => {
  const { toast } = useToast();
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userStrategies, setUserStrategies] = useState<any[]>([]);

  const availableTags = [
    'RSI', 'MACD', 'Moving Average', 'Bollinger Bands', 'Volume',
    'Day Trading', 'Swing Trading', 'Scalping', 'Momentum', 'Mean Reversion',
    'Breakout', 'Trend Following', 'Contrarian', 'High Frequency'
  ];

  const handleTagToggle = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handlePublish = async () => {
    if (!selectedStrategy) {
      toast({ title: "Error", description: "Please select a strategy", variant: "destructive" });
      return;
    }

    if (!description.trim()) {
      toast({ title: "Error", description: "Please provide a description", variant: "destructive" });
      return;
    }

    if (!agreedToTerms) {
      toast({ title: "Error", description: "Please agree to the terms", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await marketplaceService.publishStrategy(selectedStrategy, price, description);
      toast({ 
        title: "Success", 
        description: "Strategy submitted for review. You'll be notified once approved." 
      });
      
      // Reset form
      setSelectedStrategy('');
      setPrice(0);
      setDescription('');
      setTags([]);
      setAgreedToTerms(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to publish strategy", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Publish Strategy
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Share your strategy with the community and earn from sales
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Select Strategy</Label>
          <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a strategy to publish" />
            </SelectTrigger>
            <SelectContent>
              {userStrategies.map(strategy => (
                <SelectItem key={strategy.id} value={strategy.id}>
                  {strategy.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Price (USD)</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="pl-10"
              min="0"
              step="0.01"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Set to $0 for free strategies. You'll receive 70% of paid sales.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your strategy, its approach, and key features..."
            rows={4}
          />
        </div>

        <div className="space-y-3">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <div key={tag} className="flex items-center space-x-2">
                <Checkbox
                  id={tag}
                  checked={tags.includes(tag)}
                  onCheckedChange={() => handleTagToggle(tag)}
                />
                <Label htmlFor={tag} className="text-sm">{tag}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-medium text-blue-900 mb-1">Revenue Sharing</h4>
              <p className="text-blue-700">
                • You keep 70% of all sales revenue<br/>
                • BoltzTrader takes 30% platform fee<br/>
                • Payments processed monthly via Stripe<br/>
                • Minimum payout threshold: $50
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={setAgreedToTerms}
          />
          <Label htmlFor="terms" className="text-sm">
            I agree to the{' '}
            <a href="#" className="text-primary hover:underline">
              Marketplace Terms & Conditions
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:underline">
              Revenue Sharing Agreement
            </a>
          </Label>
        </div>

        <Button 
          onClick={handlePublish} 
          disabled={loading || !selectedStrategy || !agreedToTerms}
          className="w-full"
        >
          {loading ? 'Publishing...' : 'Submit for Review'}
        </Button>

        <div className="text-xs text-muted-foreground">
          <p>
            All strategies undergo review before publication. This typically takes 1-3 business days.
            You'll receive an email notification once your strategy is approved or if changes are needed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};