import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Coins, Building2 } from 'lucide-react';

interface AssetTypeFilterProps {
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
}

export const AssetTypeFilter = ({ selectedType, onTypeChange }: AssetTypeFilterProps) => {
  const assetTypes = [
    { value: 'equity', label: 'Stocks', icon: TrendingUp, color: 'bg-blue-500' },
    { value: 'crypto', label: 'Crypto', icon: Coins, color: 'bg-orange-500' },
    { value: 'etf', label: 'ETFs', icon: Building2, color: 'bg-green-500' }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Asset Types</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant={selectedType === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTypeChange(null)}
          className="w-full justify-start"
        >
          All Assets
        </Button>
        
        {assetTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.value;
          
          return (
            <Button
              key={type.value}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTypeChange(type.value)}
              className="w-full justify-start"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${type.color}`} />
                <Icon className="h-4 w-4" />
                {type.label}
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};