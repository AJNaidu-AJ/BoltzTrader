import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const [name, setName] = useState("John Doe");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Display Name"
          />
          <Button>Save</Button>
        </CardContent>
      </Card>
    </div>
  );
}