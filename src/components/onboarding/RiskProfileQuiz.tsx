import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { TrendingUp, Clock, DollarSign, Target } from 'lucide-react';

interface RiskProfile {
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  holding_time: 'short' | 'medium' | 'long';
  trade_frequency: 'low' | 'medium' | 'high';
  max_position_size: number;
  preferred_sectors: string[];
}

interface RiskProfileQuizProps {
  onComplete: (profile: RiskProfile) => void;
}

export const RiskProfileQuiz = ({ onComplete }: RiskProfileQuizProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [profile, setProfile] = useState<RiskProfile>({
    risk_tolerance: 'moderate',
    holding_time: 'medium',
    trade_frequency: 'medium',
    max_position_size: 1000,
    preferred_sectors: []
  });

  const questions = [
    {
      id: 'risk_tolerance',
      title: 'Risk Tolerance',
      icon: TrendingUp,
      question: 'How comfortable are you with market volatility?',
      options: [
        { value: 'conservative', label: 'Conservative', desc: 'I prefer stable, low-risk investments' },
        { value: 'moderate', label: 'Moderate', desc: 'I can handle some ups and downs for better returns' },
        { value: 'aggressive', label: 'Aggressive', desc: 'I\'m comfortable with high volatility for high returns' }
      ]
    },
    {
      id: 'holding_time',
      title: 'Holding Period',
      icon: Clock,
      question: 'How long do you typically hold positions?',
      options: [
        { value: 'short', label: 'Short-term', desc: 'Minutes to hours (day trading)' },
        { value: 'medium', label: 'Medium-term', desc: 'Days to weeks (swing trading)' },
        { value: 'long', label: 'Long-term', desc: 'Months to years (position trading)' }
      ]
    },
    {
      id: 'trade_frequency',
      title: 'Trading Frequency',
      icon: Target,
      question: 'How often do you want to trade?',
      options: [
        { value: 'low', label: 'Low', desc: '1-5 trades per month' },
        { value: 'medium', label: 'Medium', desc: '5-20 trades per month' },
        { value: 'high', label: 'High', desc: '20+ trades per month' }
      ]
    }
  ];

  const sectors = [
    'Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer', 
    'Industrial', 'Materials', 'Utilities', 'Real Estate', 'Telecommunications'
  ];

  const handleNext = () => {
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...profile,
          risk_profile_completed: true,
          risk_profile_completed_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile Complete",
        description: "Your risk profile has been saved successfully!"
      });

      onComplete(profile);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save risk profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentStep + 1) / (questions.length + 2)) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Risk Profile Assessment</CardTitle>
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {questions.length + 2}
          </div>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {currentStep < questions.length ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                {React.createElement(questions[currentStep].icon, { className: "h-8 w-8 text-primary" })}
              </div>
              <h3 className="text-xl font-semibold">{questions[currentStep].title}</h3>
              <p className="text-muted-foreground mt-2">{questions[currentStep].question}</p>
            </div>

            <RadioGroup
              value={profile[questions[currentStep].id as keyof RiskProfile] as string}
              onValueChange={(value) => 
                setProfile(prev => ({ ...prev, [questions[currentStep].id]: value }))
              }
            >
              {questions[currentStep].options.map((option) => (
                <div key={option.value} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={option.value} className="font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">{option.desc}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
        ) : currentStep === questions.length ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Position Sizing</h3>
              <p className="text-muted-foreground mt-2">What's your maximum position size per trade?</p>
            </div>

            <div className="space-y-4">
              <Label htmlFor="position-size">Maximum Position Size ($)</Label>
              <Input
                id="position-size"
                type="number"
                min="100"
                step="100"
                value={profile.max_position_size}
                onChange={(e) => 
                  setProfile(prev => ({ ...prev, max_position_size: parseInt(e.target.value) || 1000 }))
                }
                placeholder="1000"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold">Sector Preferences</h3>
              <p className="text-muted-foreground mt-2">Select sectors you're interested in (optional)</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {sectors.map((sector) => (
                <div key={sector} className="flex items-center space-x-2">
                  <Checkbox
                    id={sector}
                    checked={profile.preferred_sectors.includes(sector)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setProfile(prev => ({
                          ...prev,
                          preferred_sectors: [...prev.preferred_sectors, sector]
                        }));
                      } else {
                        setProfile(prev => ({
                          ...prev,
                          preferred_sectors: prev.preferred_sectors.filter(s => s !== sector)
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={sector} className="text-sm cursor-pointer">
                    {sector}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <Button onClick={handleNext} disabled={loading}>
            {currentStep === questions.length + 1 ? 'Complete Profile' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};