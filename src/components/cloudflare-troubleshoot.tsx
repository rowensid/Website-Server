'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Settings, 
  Globe, 
  Shield, 
  Server,
  Key,
  Wifi,
  Lock,
  FileText,
  ExternalLink
} from 'lucide-react';

interface TroubleshootingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'success' | 'warning' | 'error' | 'info';
  actions?: string[];
}

interface ErrorSolution {
  error: string;
  solutions: string[];
  code?: string;
}

export function CloudflareTroubleshoot() {
  const commonErrors: ErrorSolution[] = [
    {
      error: "Koneksi Error - UNKNOWN_ERROR",
      solutions: [
        "Periksa koneksi internet dan server Pterodactyl",
        "Verifikasi API Key dan URL di konfigurasi",
        "Nonaktifkan 'I'm Under Attack' mode di Cloudflare",
        "Tambahkan IP server ke whitelist Cloudflare"
      ]
    },
    {
      error: "Connection timeout",
      solutions: [
        "Increase timeout value in configuration",
        "Check network connectivity to Pterodactyl panel",
        "Verify firewall rules allow outbound connections",
        "Try using direct IP connection method"
      ]
    },
    {
      error: "401 Unauthorized",
      solutions: [
        "Verify Pterodactyl API key is correct",
        "Check API key has sufficient permissions",
        "Ensure API key is not expired",
        "Regenerate API key if necessary"
      ]
    },
    {
      error: "ENOTFOUND / DNS resolution failed",
      solutions: [
        "Check Pterodactyl panel URL is correct",
        "Verify DNS resolution for the domain",
        "Try using direct IP address",
        "Check local DNS settings"
      ]
    },
    {
      error: "Cloudflare 403 Forbidden",
      solutions: [
        "Disable 'I'm Under Attack' mode in Cloudflare",
        "Add server IP to Cloudflare whitelist",
        "Use Cloudflare API token bypass method",
        "Configure proper User-Agent headers"
      ]
    }
  ];

  const troubleshootingSteps: TroubleshootingStep[] = [
    {
      title: "Check Pterodactyl Panel Status",
      description: "Verify your Pterodactyl panel is accessible and functioning properly",
      icon: <Server className="w-5 h-5" />,
      status: 'info',
      actions: [
        "Open panel URL in browser",
        "Check if panel loads correctly",
        "Verify admin login works",
        "Test API access manually"
      ]
    },
    {
      title: "Verify API Credentials",
      description: "Ensure your API key is valid and has proper permissions",
      icon: <Key className="w-5 h-5" />,
      status: 'warning',
      actions: [
        "Go to Admin → API Credentials in Pterodactyl",
        "Create new API key with full permissions",
        "Copy API key immediately (shown only once)",
        "Test API key with curl command"
      ]
    },
    {
      title: "Configure Cloudflare Settings",
      description: "Adjust Cloudflare settings to allow API access",
      icon: <Shield className="w-5 h-5" />,
      status: 'error',
      actions: [
        "Disable 'I'm Under Attack' mode",
        "Set SSL/TLS to 'Full' or 'Full (strict)'",
        "Add server IP to Cloudflare whitelist",
        "Create Page Rule to bypass API endpoints"
      ]
    },
    {
      title: "Test Connection Methods",
      description: "Try different connection methods to find working solution",
      icon: <Wifi className="w-5 h-5" />,
      status: 'info',
      actions: [
        "Test standard connection first",
        "Try Cloudflare token bypass",
        "Use direct IP connection",
        "Configure proxy if needed"
      ]
    },
    {
      title: "Network Configuration",
      description: "Check network settings and firewall rules",
      icon: <Globe className="w-5 h-5" />,
      status: 'warning',
      actions: [
        "Verify outbound HTTPS (443) is allowed",
        "Check firewall rules",
        "Test with different network",
        "Verify DNS resolution"
      ]
    }
  ];

  const getStatusColor = (status: TroubleshootingStep['status']) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      case 'info': return 'text-blue-500';
    }
  };

  const getStatusBadge = (status: TroubleshootingStep['status']) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Check Required</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-800">Action Needed</Badge>;
      case 'info': return <Badge className="bg-blue-100 text-blue-800">Information</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Cloudflare Connection Troubleshooting
          </CardTitle>
          <CardDescription>
            Comprehensive guide to resolve Cloudflare connection issues with Pterodactyl panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Quick Fix:</strong> The most common solution is to disable "I'm Under Attack" mode in your Cloudflare dashboard 
              or add your server's IP address to the Cloudflare whitelist.
            </AlertDescription>
          </Alert>

          {/* Common Errors */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Common Error Messages & Solutions
            </h3>
            
            <Accordion type="single" collapsible className="space-y-3">
              {commonErrors.map((error, index) => (
                <AccordionItem key={index} value={`error-${index}`} className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="font-medium">{error.error}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3">
                      <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                        <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Solutions:</h4>
                        <ul className="space-y-1">
                          {error.solutions.map((solution, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
                              <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              {solution}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {error.code && (
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                          <h4 className="font-medium mb-2">Example Code:</h4>
                          <code className="text-sm">{error.code}</code>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Step-by-Step Troubleshooting */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-500" />
              Step-by-Step Troubleshooting
            </h3>
            
            <div className="space-y-4">
              {troubleshootingSteps.map((step, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={getStatusColor(step.status)}>
                          {step.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base">{step.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {step.description}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(step.status)}
                    </div>
                  </CardHeader>
                  
                  {step.actions && (
                    <CardContent className="pt-0">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Actions:</h4>
                        <ol className="space-y-1">
                          {step.actions.map((action, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
                              <span className="font-medium">{idx + 1}.</span>
                              {action}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Additional Resources */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Additional Resources
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Cloudflare Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a href="https://developers.cloudflare.com/fundamentals/get-started/reference/cloudflare-ip-ranges/" 
                         target="_blank" rel="noopener noreferrer"
                         className="text-blue-600 hover:underline flex items-center gap-1">
                        Cloudflare IP Ranges <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                    <li>
                      <a href="https://developers.cloudflare.com/api/tokens/create/" 
                         target="_blank" rel="noopener noreferrer"
                         className="text-blue-600 hover:underline flex items-center gap-1">
                        Create API Tokens <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                    <li>
                      <a href="https://support.cloudflare.com/hc/en-us/articles/200170016-Understanding-the-Cloudflare-I-m-Under-Attack-mode" 
                         target="_blank" rel="noopener noreferrer"
                         className="text-blue-600 hover:underline flex items-center gap-1">
                        Under Attack Mode <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Security Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Use environment variables for API keys</li>
                    <li>• Regularly rotate API credentials</li>
                    <li>• Implement IP whitelisting</li>
                    <li>• Monitor API access logs</li>
                    <li>• Use HTTPS for all connections</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}