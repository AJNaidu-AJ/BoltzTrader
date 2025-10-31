import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { kycService, KYCProfile } from '@/services/kycService';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

export const KYCForm = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Partial<KYCProfile>>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    nationality: '',
    address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: ''
    },
    phone: '',
    occupation: '',
    source_of_funds: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await kycService.submitKYCProfile(profile);
      toast({ title: "Success", description: "KYC profile submitted for review" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit KYC profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: any) => {
    try {
      const path = await kycService.uploadDocument(file, type);
      setUploadedDocs(prev => [...prev, `${type}: ${file.name}`]);
      toast({ title: "Success", description: "Document uploaded successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload document", variant: "destructive" });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            KYC Verification
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete your identity verification to access live trading features
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input
                value={profile.first_name}
                onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="John"
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={profile.last_name}
                onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={profile.date_of_birth}
                onChange={(e) => setProfile(prev => ({ ...prev, date_of_birth: e.target.value }))}
              />
            </div>
            <div>
              <Label>Nationality</Label>
              <Select
                value={profile.nationality}
                onValueChange={(value) => setProfile(prev => ({ ...prev, nationality: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Phone Number</Label>
            <Input
              value={profile.phone}
              onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-4">
            <Label>Address</Label>
            <div className="grid gap-4">
              <Input
                value={profile.address?.street}
                onChange={(e) => setProfile(prev => ({ 
                  ...prev, 
                  address: { ...prev.address!, street: e.target.value }
                }))}
                placeholder="Street Address"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  value={profile.address?.city}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    address: { ...prev.address!, city: e.target.value }
                  }))}
                  placeholder="City"
                />
                <Input
                  value={profile.address?.state}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    address: { ...prev.address!, state: e.target.value }
                  }))}
                  placeholder="State/Province"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  value={profile.address?.postal_code}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    address: { ...prev.address!, postal_code: e.target.value }
                  }))}
                  placeholder="Postal Code"
                />
                <Input
                  value={profile.address?.country}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    address: { ...prev.address!, country: e.target.value }
                  }))}
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Occupation</Label>
            <Input
              value={profile.occupation}
              onChange={(e) => setProfile(prev => ({ ...prev, occupation: e.target.value }))}
              placeholder="Software Engineer"
            />
          </div>

          <div>
            <Label>Source of Funds</Label>
            <Textarea
              value={profile.source_of_funds}
              onChange={(e) => setProfile(prev => ({ ...prev, source_of_funds: e.target.value }))}
              placeholder="Describe the source of your trading funds..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Document Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { type: 'passport', label: 'Passport or ID' },
              { type: 'utility_bill', label: 'Proof of Address' }
            ].map(({ type, label }) => (
              <div key={type} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium mb-2">{label}</p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, type);
                  }}
                  className="hidden"
                  id={`upload-${type}`}
                />
                <label
                  htmlFor={`upload-${type}`}
                  className="cursor-pointer text-primary hover:underline text-sm"
                >
                  Choose file
                </label>
              </div>
            ))}
          </div>

          {uploadedDocs.length > 0 && (
            <div>
              <Label>Uploaded Documents</Label>
              <div className="space-y-2 mt-2">
                {uploadedDocs.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? 'Submitting...' : 'Submit KYC Application'}
      </Button>
    </div>
  );
};