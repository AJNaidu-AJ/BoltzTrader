import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Smartphone, Key } from 'lucide-react';

export const TwoFactorSetup = () => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      });
      
      if (error) throw error;
      
      setQrCode(data.totp.qr_code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll 2FA');
    }
  };

  const handleVerify = async () => {
    if (!verificationCode) return;
    
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: qrCode,
        code: verificationCode
      });
      
      if (error) throw error;
      
      setSuccess(true);
      
      await supabase
        .from('profiles')
        .update({ mfa_enabled_at: new Date().toISOString() })
        .eq('id', data.user?.id);
        
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Shield className="h-12 w-12 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold">2FA Enabled Successfully!</h3>
            <p className="text-muted-foreground">
              Your account is now protected with two-factor authentication.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!qrCode ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Smartphone className="h-8 w-8 text-blue-500" />
              <div>
                <h4 className="font-medium">Authenticator App Required</h4>
                <p className="text-sm text-muted-foreground">
                  Install Google Authenticator or similar app on your phone
                </p>
              </div>
            </div>
            
            <Button onClick={handleEnroll} disabled={isEnrolling} className="w-full">
              {isEnrolling ? 'Setting up...' : 'Enable 2FA'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg inline-block">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Scan this QR code with your authenticator app
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Verification Code</label>
              <Input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>
            
            <Button 
              onClick={handleVerify} 
              disabled={verificationCode.length !== 6}
              className="w-full"
            >
              <Key className="h-4 w-4 mr-2" />
              Verify & Enable
            </Button>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};