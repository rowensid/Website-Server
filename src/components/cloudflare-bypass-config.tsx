'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Cloud, 
  Server, 
  Shield, 
  Settings, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Globe,
  Lock,
  Zap
} from 'lucide-react';

interface BypassConfig {
  cloudflareApiToken: string;
  cloudflareZoneId: string;
  useDirectIP: boolean;
  directIP: string;
  directPort: number;
  useProxy: boolean;
  proxyUrl: string;
  proxyAuth: string;
  timeout: number;
  retryAttempts: number;
  allowSelfSigned: boolean;
}

interface TestResult {
  method: string;
  success: boolean;
  error?: string;
  latency?: number;
}

export function CloudflareBypassConfig() {
  const [config, setConfig] = useState<BypassConfig>({
    cloudflareApiToken: '',
    cloudflareZoneId: '',
    useDirectIP: false,
    directIP: '',
    directPort: 443,
    useProxy: false,
    proxyUrl: '',
    proxyAuth: '',
    timeout: 15000,
    retryAttempts: 3,
    allowSelfSigned: true
  });

  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState('cloudflare');

  const handleConfigChange = (field: keyof BypassConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testConnection = async () => {
    setIsTesting(true);
    try {
      const response = await fetch('/api/pterodactyl/bypass?action=test');
      const data = await response.json();
      
      if (data.success) {
        setTestResults(data.results);
      } else {
        console.error('Test failed:', data.error);
      }
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const saveConfig = async () => {
    try {
      const response = await fetch('/api/pterodactyl/bypass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ config })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Configuration saved successfully!');
      } else {
        alert('Failed to save configuration: ' + data.error);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save configuration');
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'Standard': return <Globe className="w-4 h-4" />;
      case 'Cloudflare Token': return <Cloud className="w-4 h-4" />;
      case 'Direct IP': return <Server className="w-4 h-4" />;
      case 'Proxy': return <Shield className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getMethodColor = (success: boolean) => {
    return success ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Cloudflare Bypass Configuration
          </CardTitle>
          <CardDescription>
            Configure multiple connection methods to bypass Cloudflare protection and connect to your Pterodactyl panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="cloudflare">Cloudflare</TabsTrigger>
              <TabsTrigger value="direct">Direct IP</TabsTrigger>
              <TabsTrigger value="proxy">Proxy</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="cloudflare" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cf-token">Cloudflare API Token</Label>
                  <Input
                    id="cf-token"
                    type="password"
                    placeholder="CF_API_TOKEN"
                    value={config.cloudflareApiToken}
                    onChange={(e) => handleConfigChange('cloudflareApiToken', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Get this from Cloudflare dashboard → My Profile → API Tokens
                  </p>
                </div>

                <div>
                  <Label htmlFor="cf-zone">Zone ID</Label>
                  <Input
                    id="cf-zone"
                    placeholder="your-zone-id"
                    value={config.cloudflareZoneId}
                    onChange={(e) => handleConfigChange('cloudflareZoneId', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Optional: Zone ID for your domain (auto-detected if not provided)
                  </p>
                </div>

                <Alert>
                  <Cloud className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Cloudflare Token Method:</strong> Uses Cloudflare API tokens to bypass protection. 
                    Requires API token with Zone:Zone:Read and Zone:Page Rules:Edit permissions.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="direct" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="use-direct-ip"
                    checked={config.useDirectIP}
                    onCheckedChange={(checked) => handleConfigChange('useDirectIP', checked)}
                  />
                  <Label htmlFor="use-direct-ip">Enable Direct IP Connection</Label>
                </div>

                {config.useDirectIP && (
                  <>
                    <div>
                      <Label htmlFor="direct-ip">Direct IP Address</Label>
                      <Input
                        id="direct-ip"
                        placeholder="192.168.1.100"
                        value={config.directIP}
                        onChange={(e) => handleConfigChange('directIP', e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        The actual IP address of your Pterodactyl panel server
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="direct-port">Port</Label>
                      <Input
                        id="direct-port"
                        type="number"
                        placeholder="443"
                        value={config.directPort}
                        onChange={(e) => handleConfigChange('directPort', parseInt(e.target.value))}
                      />
                    </div>
                  </>
                )}

                <Alert>
                  <Server className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Direct IP Method:</strong> Connects directly to your server's IP address, 
                    bypassing Cloudflare entirely. Use if you have server access.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="proxy" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="use-proxy"
                    checked={config.useProxy}
                    onCheckedChange={(checked) => handleConfigChange('useProxy', checked)}
                  />
                  <Label htmlFor="use-proxy">Enable Proxy Connection</Label>
                </div>

                {config.useProxy && (
                  <>
                    <div>
                      <Label htmlFor="proxy-url">Proxy URL</Label>
                      <Input
                        id="proxy-url"
                        placeholder="https://cors-anywhere.herokuapp.com"
                        value={config.proxyUrl}
                        onChange={(e) => handleConfigChange('proxyUrl', e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        CORS proxy or other proxy service URL
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="proxy-auth">Proxy Authentication (Optional)</Label>
                      <Input
                        id="proxy-auth"
                        type="password"
                        placeholder="username:password"
                        value={config.proxyAuth}
                        onChange={(e) => handleConfigChange('proxyAuth', e.target.value)}
                      />
                    </div>
                  </>
                )}

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Proxy Method:</strong> Routes requests through a proxy service that can 
                    bypass Cloudflare protection. Useful for testing and development.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="timeout">Connection Timeout (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    placeholder="15000"
                    value={config.timeout}
                    onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="retry-attempts">Retry Attempts</Label>
                  <Input
                    id="retry-attempts"
                    type="number"
                    placeholder="3"
                    value={config.retryAttempts}
                    onChange={(e) => handleConfigChange('retryAttempts', parseInt(e.target.value))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow-self-signed"
                    checked={config.allowSelfSigned}
                    onCheckedChange={(checked) => handleConfigChange('allowSelfSigned', checked)}
                  />
                  <Label htmlFor="allow-self-signed">Allow Self-Signed Certificates</Label>
                </div>

                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Advanced Settings:</strong> Configure connection timeouts, retry logic, 
                    and SSL certificate validation for troubleshooting.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 mt-6">
            <Button onClick={saveConfig} className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Save Configuration
            </Button>
            <Button 
              variant="outline" 
              onClick={testConnection}
              disabled={isTesting}
              className="flex items-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              {isTesting ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Connection Test Results
            </CardTitle>
            <CardDescription>
              Test results for all available connection methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    result.success 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                      : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={getMethodColor(result.success)}>
                      {result.success ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div className="flex items-center gap-2">
                      {getMethodIcon(result.method)}
                      <span className="font-medium">{result.method}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {result.latency && (
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.latency}ms
                      </Badge>
                    )}
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      {result.success ? 'Working' : 'Failed'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {testResults.some(r => r.success) && (
              <Alert className="mt-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Success!</strong> At least one connection method is working. 
                  The system will automatically use the best available method.
                </AlertDescription>
              </Alert>
            )}

            {testResults.every(r => !r.success) && (
              <Alert className="mt-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>All methods failed.</strong> Please check your configuration and network connectivity. 
                  Common issues: incorrect API tokens, firewall rules, or server downtime.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}