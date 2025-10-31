import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";
import { RiskProfileQuiz } from "@/components/onboarding/RiskProfileQuiz";
import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showRiskQuiz, setShowRiskQuiz] = useState(false);
  const [riskProfileCompleted, setRiskProfileCompleted] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setDisplayName(data.display_name || '');
      }

      // Load risk profile status
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('risk_profile_completed')
        .eq('user_id', user?.id)
        .single();

      setRiskProfileCompleted(preferences?.risk_profile_completed || false);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input 
              id="name" 
              placeholder="John Doe" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={user?.email || ''}
              disabled
            />
            <p className="text-sm text-muted-foreground">Email cannot be changed</p>
          </div>
          <Button onClick={handleSaveProfile} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <TwoFactorSetup />

      {/* Risk Profile Section */}
      {showRiskQuiz ? (
        <RiskProfileQuiz onComplete={() => {
          setShowRiskQuiz(false);
          setRiskProfileCompleted(true);
          toast({
            title: "Success",
            description: "Risk profile updated successfully"
          });
        }} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Risk Profile</CardTitle>
            <CardDescription>Personalize your trading experience</CardDescription>
          </CardHeader>
          <CardContent>
            {riskProfileCompleted ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Risk profile completed</p>
                  <p className="text-sm text-muted-foreground">Your preferences are being used to personalize signals</p>
                </div>
                <Button variant="outline" onClick={() => setShowRiskQuiz(true)}>
                  Update Profile
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Complete your risk assessment to get personalized trading recommendations</p>
                <Button onClick={() => setShowRiskQuiz(true)}>
                  Complete Risk Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <NotificationPreferences />
    </div>
  );
}
