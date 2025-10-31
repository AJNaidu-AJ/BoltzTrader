import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RiskProfileQuiz } from "@/components/onboarding/RiskProfileQuiz";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedMarket, setSelectedMarket] = useState('');

  const handleMarketSelect = (market: string) => {
    setSelectedMarket(market);
    setStep(2);
  };

  const handleRiskProfileComplete = () => {
    navigate('/dashboard');
  };

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <RiskProfileQuiz onComplete={handleRiskProfileComplete} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome to BoltzTrader</CardTitle>
          <CardDescription>Let's personalize your experience</CardDescription>
          <Progress value={50} className="mt-4" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Your Market</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20"
                onClick={() => handleMarketSelect('NSE')}
              >
                NSE (India)
              </Button>
              <Button 
                variant="outline" 
                className="h-20"
                onClick={() => handleMarketSelect('NYSE')}
              >
                NYSE (USA)
              </Button>
              <Button 
                variant="outline" 
                className="h-20"
                onClick={() => handleMarketSelect('LSE')}
              >
                LSE (UK)
              </Button>
              <Button 
                variant="outline" 
                className="h-20"
                onClick={() => handleMarketSelect('Other')}
              >
                Other
              </Button>
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>Skip</Button>
            <Button disabled={!selectedMarket} onClick={() => setStep(2)}>Continue</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
