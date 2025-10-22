'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Server, Settings, CheckCircle, XCircle } from 'lucide-react';

interface PterodactylConfig {
  panelUrl: string;
  apiKey: string;
}

interface PterodactylConfigProps {
  onConfigChange: (config: PterodactylConfig) => void;
  isConnected: boolean;
  onConnectionTest: () => void;
}

export function PterodactylConfig({ 
  onConfigChange, 
  isConnected, 
  onConnectionTest 
}: PterodactylConfigProps) {
  const [config, setConfig] = useState<PterodactylConfig>({
    panelUrl: 'https://panel.androwproject.cloud',
    apiKey: 'ptla_UrCtJ7YFHtcuLkm6RSXTyYRFfjRwCdoCtoU4bFimzDL'
  });
  const [isTesting, setIsTesting] = useState(false);

  const handleConfigUpdate = (field: keyof PterodactylConfig, value: string) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleTestConnection = async () => {
    if (!config.panelUrl || !config.apiKey) {
      toast({
        title: "Configuration Required",
        description: "Please enter both Panel URL and API Key",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch(`/api/pterodactyl/nodes?panelUrl=${encodeURIComponent(config.panelUrl)}&apiKey=${encodeURIComponent(config.apiKey)}`);
      
      if (response.ok) {
        toast({
          title: "Connection Successful",
          description: "Successfully connected to Pterodactyl panel",
        });
        onConnectionTest();
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Pterodactyl panel. Please check your credentials.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Pterodactyl Panel Configuration
        </CardTitle>
        <CardDescription>
          Configure your Pterodactyl panel connection to manage game servers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="panelUrl">Panel URL</Label>
            <Input
              id="panelUrl"
              type="url"
              placeholder="https://panel.example.com"
              value={config.panelUrl}
              onChange={(e) => handleConfigUpdate('panelUrl', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="ptla_..."
              value={config.apiKey}
              onChange={(e) => handleConfigUpdate('apiKey', e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Not Connected
                </>
              )}
            </Badge>
          </div>
          
          <Button 
            onClick={handleTestConnection}
            disabled={isTesting || !config.panelUrl || !config.apiKey}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {isTesting ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}