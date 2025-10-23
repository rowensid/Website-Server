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
  Cloud, 
  Shield, 
  Lock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Settings, 
  RefreshCw,
  Globe,
  Zap,
  Wifi,
  Eye,
  EyeOff
} from 'lucide-react';

interface CloudflareConfig {
  apiToken: string;
  zoneId: string;
  useDirectIP: boolean;
  directIP: string;
  useProxy: boolean;
  proxyUrl: string;
}

export default function CloudflareIntegration() {
  const [config, setConfig] = useState<CloudflareConfig>({
    apiToken: '',
    zoneId: '',
    useDirectIP: false,
    directIP: '',
    useProxy: false,
    proxyUrl: ''
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const handleConfigChange = (field: keyof CloudflareConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/pterodactyl/bypass?action=test', {
        method: 'GET',
      });
      
      const data = await response.json();
      setTestResults(data);
      setIsConnected(data.success);
    } catch (error) {
      console.error('Test connection failed:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/pterodactyl/bypass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      });
      
      const data = await response.json();
      if (data.success) {
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Save config failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Cloudflare Integration</h2>
            <p className="text-gray-400">Bypass protection and optimize connectivity</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={`${isConnected ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
            {isConnected ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Connected
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Disconnected
              </>
            )}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={testConnection}
            disabled={isLoading}
            className="border-gray-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Test
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      <Alert className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-blue-500/30">
        <Cloud className="w-4 h-4" />
        <AlertDescription className="text-blue-200">
          <strong>Cloudflare Bypass Active:</strong> Using advanced bypass techniques to connect through Cloudflare protection • 
          Status: <span className={isConnected ? 'text-green-400' : 'text-yellow-400'}>
            {isConnected ? 'Operational' : 'Configuration Required'}
          </span>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="bg-gray-900/50 border-gray-800">
          <TabsTrigger value="basic" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400">
            <Settings className="w-4 h-4 mr-2" />
            Basic Config
          </TabsTrigger>
          <TabsTrigger value="advanced" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400">
            <Shield className="w-4 h-4 mr-2" />
            Advanced
          </TabsTrigger>
          <TabsTrigger value="status" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400">
            <Globe className="w-4 h-4 mr-2" />
            Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cloudflare API Configuration */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-400" />
                  Cloudflare API
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure your Cloudflare API credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="apiToken" className="text-gray-300">API Token</Label>
                  <div className="relative">
                    <Input
                      id="apiToken"
                      type={showSecrets ? 'text' : 'password'}
                      placeholder="CF_API_TOKEN..."
                      value={config.apiToken}
                      onChange={(e) => handleConfigChange('apiToken', e.target.value)}
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

                <div>
                  <Label htmlFor="zoneId" className="text-gray-300">Zone ID</Label>
                  <Input
                    id="zoneId"
                    type={showSecrets ? 'text' : 'password'}
                    placeholder="your-zone-id..."
                    value={config.zoneId}
                    onChange={(e) => handleConfigChange('zoneId', e.target.value)}
                    className="bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>

                <Button 
                  onClick={saveConfig}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
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
              </CardContent>
            </Card>

            {/* Connection Methods */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-blue-400" />
                  Connection Methods
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Choose how to bypass Cloudflare protection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Direct API Access</p>
                        <p className="text-xs text-gray-400">Use API token for direct access</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Recommended
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Direct IP Bypass</p>
                        <p className="text-xs text-gray-400">Connect directly to server IP</p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      Advanced
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center space-x-3">
                      <Cloud className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Proxy Tunnel</p>
                        <p className="text-xs text-gray-400">Route through proxy server</p>
                      </div>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      Experimental
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Direct IP Configuration */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  Direct IP Configuration
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure direct IP bypass settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="useDirectIP" className="text-gray-300">Enable Direct IP</Label>
                  <input
                    id="useDirectIP"
                    type="checkbox"
                    checked={config.useDirectIP}
                    onChange={(e) => handleConfigChange('useDirectIP', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded"
                  />
                </div>

                {config.useDirectIP && (
                  <div>
                    <Label htmlFor="directIP" className="text-gray-300">Direct IP Address</Label>
                    <Input
                      id="directIP"
                      type="text"
                      placeholder="192.168.1.100"
                      value={config.directIP}
                      onChange={(e) => handleConfigChange('directIP', e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Proxy Configuration */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-blue-400" />
                  Proxy Configuration
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure proxy tunnel settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="useProxy" className="text-gray-300">Enable Proxy</Label>
                  <input
                    id="useProxy"
                    type="checkbox"
                    checked={config.useProxy}
                    onChange={(e) => handleConfigChange('useProxy', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded"
                  />
                </div>

                {config.useProxy && (
                  <div>
                    <Label htmlFor="proxyUrl" className="text-gray-300">Proxy URL</Label>
                    <Input
                      id="proxyUrl"
                      type="text"
                      placeholder="http://proxy.example.com:8080"
                      value={config.proxyUrl}
                      onChange={(e) => handleConfigChange('proxyUrl', e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          {/* Connection Status */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResults ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">API Connection</p>
                      <p className={`text-lg font-semibold ${testResults.success ? 'text-green-400' : 'text-red-400'}`}>
                        {testResults.success ? 'Connected' : 'Failed'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">Bypass Method</p>
                      <p className="text-lg font-semibold text-blue-400">
                        {testResults.method || 'Not Tested'}
                      </p>
                    </div>
                  </div>

                  {testResults.results && (
                    <div className="mt-4 p-4 bg-gray-800/30 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Test Results:</h4>
                      <pre className="text-xs text-gray-400 overflow-x-auto">
                        {JSON.stringify(testResults.results, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <p className="text-gray-400">No test results available</p>
                  <Button 
                    onClick={testConnection}
                    disabled={isLoading}
                    className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-600"
                  >
                    Run Connection Test
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}