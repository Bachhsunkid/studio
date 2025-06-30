'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Server, RefreshCw, X, Info } from "lucide-react";
import { signalRConfig } from '@/lib/signalr-config';
import { useServerInfo } from '@/hooks/use-server-info';

interface ServerInfoResponse {
  instance: string;
  time: string;
}

interface ServerInfoProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const ServerInfo: React.FC<ServerInfoProps> = ({
  position = 'top-right',
  autoRefresh = false,
  refreshInterval = 30000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { serverInfo, isLoading, error, fetchServerInfo } = useServerInfo({
    autoRefresh: autoRefresh && isVisible,
    refreshInterval,
    enabled: isVisible,
  });

  const handleToggle = () => {
    if (!isVisible && !serverInfo) {
      fetchServerInfo();
    }
    setIsVisible(!isVisible);
  };

  const getPositionStyles = () => {
    const baseStyles = "fixed z-50";
    switch (position) {
      case 'top-left':
        return `${baseStyles} top-4 left-4`;
      case 'bottom-left':
        return `${baseStyles} bottom-4 left-4`;
      case 'bottom-right':
        return `${baseStyles} bottom-4 right-4`;
      default: // top-right
        return `${baseStyles} top-4 right-4`;
    }
  };

  const getPanelPosition = () => {
    switch (position) {
      case 'top-left':
        return 'top-12 left-0';
      case 'bottom-left':
        return 'bottom-12 left-0';
      case 'bottom-right':
        return 'bottom-12 right-0';
      default: // top-right
        return 'top-12 right-0';
    }
  };

  return (
    <div className={getPositionStyles()}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggle}
              className="h-10 w-10 rounded-full shadow-lg bg-background/80 backdrop-blur-sm border-border/50 hover:bg-accent/50"
            >
              <Server className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Server Port: </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {isVisible && (
        <Card className={`absolute ${getPanelPosition()} w-80 shadow-xl bg-background/95 backdrop-blur-sm border-border/50`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Info className="h-4 w-4" />
                Server Information
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            )}
            
            {error && (
              <div className="space-y-3">
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  <strong>Error:</strong> {error}
                </div>
                <Button 
                  onClick={fetchServerInfo}
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  Retry
                </Button>
              </div>
            )}
            
            {serverInfo && !isLoading && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Port:</span>
                    <Badge variant="secondary" className="font-mono">
                      {serverInfo.instance}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Server Time:</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {new Date(serverInfo.time).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Endpoint:</span>
                    <span className="text-xs text-muted-foreground font-mono truncate max-w-32" title={signalRConfig.baseUrl}>
                      {signalRConfig.baseUrl}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={fetchServerInfo}
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  
                  {autoRefresh && (
                    <Badge variant="outline" className="px-2 py-1 text-xs">
                      Auto: {Math.floor(refreshInterval / 1000)}s
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServerInfo;
