import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { strategyService, Strategy } from '@/services/strategyService';
import { useToast } from '@/components/ui/use-toast';
import { Copy, Eye, TrendingUp } from 'lucide-react';

interface StrategyTemplatesProps {
  onSelectTemplate: (strategy: Strategy) => void;
}

export const StrategyTemplates = ({ onSelectTemplate }: StrategyTemplatesProps) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await strategyService.getStrategyTemplates();
      setTemplates(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load templates", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = (template: Strategy) => {
    onSelectTemplate({
      ...template,
      id: undefined, // Remove ID to create new strategy
      name: `${template.name} (Copy)`,
      created_at: undefined,
      updated_at: undefined
    });
    toast({ title: "Template Loaded", description: "You can now customize the strategy" });
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Strategy Templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.id} className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Template
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Conditions:</p>
                    <div className="space-y-1">
                      {template.conditions.map((condition, index) => (
                        <div key={index} className="text-xs bg-muted p-2 rounded">
                          {condition.indicator.toUpperCase()} {condition.operator} {condition.value}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Use Template
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectTemplate(template)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {templates.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No templates available
          </div>
        )}
      </CardContent>
    </Card>
  );
};