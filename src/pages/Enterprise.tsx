import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KYCForm } from '@/components/enterprise/KYCForm';
import { APIManagement } from '@/components/enterprise/APIManagement';

export const Enterprise = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Enterprise & Compliance</h1>
        <p className="text-muted-foreground">
          Enterprise-grade features for institutional users and compliance requirements
        </p>
      </div>

      <Tabs defaultValue="kyc" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="kyc">KYC Verification</TabsTrigger>
          <TabsTrigger value="api">API Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="kyc">
          <KYCForm />
        </TabsContent>
        
        <TabsContent value="api">
          <APIManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};