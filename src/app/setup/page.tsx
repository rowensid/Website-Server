'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Server, 
  Cloud, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Settings, 
  RefreshCw,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Key,
  Zap,
  Wifi
} from 'lucide-react';

interface PterodactylConfig {
  panelUrl: string;
  apiKey: string;
  bypassToken: string;
}

interface CloudflareConfig {
  apiToken: string;
  zoneId: string;
  email: string;
  globalApiKey: string;
}

export default function PterodactylSetupPage() {
  const [pterodactylConfig, setPterodactylConfig] = useState<PterodactylConfig>({
    panelUrl: 'https://panel.androwproject.cloud',
    apiKey: 'ptla_oaieo4yp4BQP3VXosTCjRkE8QaX1zGvLevxca1ncDx5',
    bypassToken: '3oNEVm8MxY1U0A_8Czb0eJ-9eceEEPJ9bCj3bGTg'
  });
  
  const [cloudflareConfig, setCloudflareConfig] = useState<CloudflareConfig>({
    apiToken: '',
    zoneId: '',
    email: '',
    globalApiKey: ''
  });

  const [isPterodactylConnected, setIsPterodactylConnected] = useState(false);
  const [isCloudflareConnected, setIsCloudflareConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    testPterodactylConnection();
  }, []);

  const testPterodactylConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/pterodactyl/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          panelUrl: pterodactylConfig.panelUrl,
          apiKey: pterodactylConfig.apiKey,
          bypassToken: pterodactylConfig.bypassToken
        }),
      });
      
      const data = await response.json();
      setTestResults(data);
      setIsPterodactylConnected(data.success);
    } catch (error) {
      console.error('Pterodactyl connection test failed:', error);
      setIsPterodactylConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const testCloudflareConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cloudflare/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cloudflareConfig),
      });
      
      const data = await response.json();
      setIsCloudflareConnected(data.success);
    } catch (error) {
      console.error('Cloudflare connection test failed:', error);
      setIsCloudflareConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const savePterodactylConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/pterodactyl/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          panelUrl: pterodactylConfig.panelUrl,
          apiKey: pterodactylConfig.apiKey,
          bypassToken: pterodactylConfig.bypassToken
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setIsPterodactylConnected(true);
      }
    } catch (error) {
      console.error('Save Pterodactyl config failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCloudflareConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cloudflare/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cloudflareConfig),
      });
      
      const data = await response.json();
      if (data.success) {
        setIsCloudflareConnected(true);
      }
    } catch (error) {
      console.error('Save Cloudflare config failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              API Configuration Setup
            </h1>
            <p className="text-gray-400">Configure Pterodactyl and Cloudflare API credentials</p>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Pterodactyl Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Server className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {isPterodactylConnected ? 'Connected' : 'Disconnected'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {pterodactylConfig.panelUrl}
                    </p>
                  </div>
                </div>
                <Badge className={`${isPterodactylConnected ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                  {isPterodactylConnected ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Online
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Offline
                    </>
                  )}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Cloudflare Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cloud className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {isCloudflareConnected ? 'Connected' : 'Not Configured'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {cloudflareConfig.apiToken ? 'Token Set' : 'No Token'}
                    </p>
                  </div>
                </div>
                <Badge className={`${isCloudflareConnected ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                  {isCloudflareConnected ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Active
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Setup Needed
                    </>
                  )}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Configuration Tabs */}
      <Tabs defaultValue="pterodactyl" className="space-y-6">
        <TabsList className="bg-gray-900/50 border-gray-800">
          <TabsTrigger value="pterodactyl" className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400">
            <Server className="w-4 h-4 mr-2" />
            Pterodactyl API
          </TabsTrigger>
          <TabsTrigger value="cloudflare" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400">
            <Cloud className="w-4 h-4 mr-2" />
            Cloudflare API
          </TabsTrigger>
          <TabsTrigger value="status" className="data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400">
            <Globe className="w-4 h-4 mr-2" />
            Connection Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pterodactyl" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-purple-400" />
                Pterodactyl API Configuration
              </CardTitle>
              <CardDescription className="text-gray-400">
                Configure your Pterodactyl panel API credentials for server management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="panelUrl" className="text-gray-300">Panel URL</Label>
                  <Input
                    id="panelUrl"
                    type="url"
                    placeholder="https://panel.example.com"
                    value={pterodactylConfig.panelUrl}
                    onChange={(e) => setPterodactylConfig(prev => ({ ...prev, panelUrl: e.target.value }))}
                    className="bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="apiKey" className="text-gray-300">API Key</Label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type={showSecrets ? 'text' : 'password'}
                      placeholder="ptla_..."
                      value={pterodactylConfig.apiKey}
                      onChange={(e) => setPterodactylConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      className="bg-gray-800/50 border-gray-700 text-white pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSecrets(!showSecrets)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <Label htmlFor="bypassToken" className="text-gray-300">Bypass Token (Advanced)</Label>
                  <div className="relative">
                    <Input
                      id="bypassToken"
                      type={showSecrets ? 'text' : 'password'}
                      placeholder="Bypass token for Cloudflare protection..."
                      value={pterodactylConfig.bypassToken}
                      onChange={(e) => setPterodactylConfig(prev => ({ ...prev, bypassToken: e.target.value }))}
                      className="bg-gray-800/50 border-gray-700 text-white pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSecrets(!showSecrets)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  onClick={savePterodactylConfig}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Save Configuration
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={testPterodactylConnection}
                  disabled={isLoading}
                  className="border-gray-700"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Test Connection
                </Button>
              </div>

              {/* Test Results */}
              {testResults && (
                <Alert className={`${testResults.success ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                  {testResults.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <AlertDescription className={testResults.success ? 'text-green-200' : 'text-red-200'}>
                    <strong>Connection Test:</strong> {testResults.success ? 'Success' : 'Failed'}
                    {testResults.message && <p className="mt-1">{testResults.message}</p>}
                    {testResults.servers && (
                      <p className="mt-1">Found {testResults.servers.count} servers</p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cloudflare" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-400" />
                Cloudflare API Configuration
              </CardTitle>
              <CardDescription className="text-gray-400">
                Configure Cloudflare API for advanced bypass and protection features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="cfApiToken" className="text-gray-300">API Token</Label>
                  <Input
                    id="cfApiToken"
                    type={showSecrets ? 'text' : 'password'}
                    placeholder="CF_API_TOKEN..."
                    value={cloudflareConfig.apiToken}
                    onChange={(e) => setCloudflareConfig(prev => ({ ...prev, apiToken: e.target.value }))}
                    className="bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="cfZoneId" className="text-gray-300">Zone ID</Label>
                  <Input
                    id="cfZoneId"
                    type={showSecrets ? 'text' : 'password'}
                    placeholder="your-zone-id..."
                    value={cloudflareConfig.zoneId}
                    onChange={(e) => setCloudflareConfig(prev => ({ ...prev, zoneId: e.target.value }))}
                    className="bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="cfEmail" className="text-gray-300">Email (Global API)</Label>
                  <Input
                    id="cfEmail"
                    type="email"
                    placeholder="your-email@example.com"
                    value={cloudflareConfig.email}
                    onChange={(e) => setCloudflareConfig(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="cfGlobalKey" className="text-gray-300">Global API Key</Label>
                  <Input
                    id="cfGlobalKey"
                    type={showSecrets ? 'text' : 'password'}
                    placeholder="Global API Key..."
                    value={cloudflareConfig.globalApiKey}
                    onChange={(e) => setCloudflareConfig(prev => ({ ...prev, globalApiKey: e.target.value }))}
                    className="bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  onClick={saveCloudflareConfig}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Cloud className="w-4 h-4 mr-2" />
                      Save Configuration
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={testCloudflareConnection}
                  disabled={isLoading}
                  className="border-gray-700"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Test Connection
                </Button>
              </div>

              <Alert className="bg-blue-900/20 border-blue-500/30">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription className="text-blue-200">
                  <strong>Note:</strong> Cloudflare API is optional but recommended for advanced bypass features. 
                  You can use either API Token or Global API Key authentication.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-purple-400" />
                  Pterodactyl Connection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Status</span>
                    <Badge className={isPterodactylConnected ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                      {isPterodactylConnected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Panel URL</span>
                    <span className="text-sm text-white">{pterodactylConfig.panelUrl}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">API Key</span>
                    <span className="text-sm text-white">{pterodactylConfig.apiKey ? 'Set' : 'Not Set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Bypass Token</span>
                    <span className="text-sm text-white">{pterodactylConfig.bypassToken ? 'Set' : 'Not Set'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-blue-400" />
                  Cloudflare Connection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Status</span>
                    <Badge className={isCloudflareConnected ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}>
                      {isCloudflareConnected ? 'Connected' : 'Not Configured'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">API Token</span>
                    <span className="text-sm text-white">{cloudflareConfig.apiToken ? 'Set' : 'Not Set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Zone ID</span>
                    <span className="text-sm text-white">{cloudflareConfig.zoneId || 'Not Set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Email</span>
                    <span className="text-sm text-white">{cloudflareConfig.email || 'Not Set'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {testResults && (
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-400" />
                  Latest Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <pre className="text-xs text-gray-300 overflow-x-auto">
                    {JSON.stringify(testResults, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}