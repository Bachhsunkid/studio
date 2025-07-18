'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Server } from "lucide-react";
import { useServerInfo } from '@/hooks/use-server-info';

interface InlineServerInfoProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

/**
 * Inline server info component for embedding in pages/components
 * Unlike the floating ServerInfo component, this renders inline within the page content
 */
export const InlineServerInfo: React.FC<InlineServerInfoProps> = ({
  autoRefresh = false,
  refreshInterval = 30000,
  className = "",
}) => {
  const { serverInfo, isLoading, error, fetchServerInfo } = useServerInfo({
    autoRefresh,
    refreshInterval,
    enabled: true, // Always enabled for inline component
  });

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Server className="h-4 w-4" />
          Server Status
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading && !serverInfo && (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">
              Loading server info...
            </span>
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
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-3 w-3 mr-1 ${isLoading ? "animate-spin" : ""}`}
              />
              Retry
            </Button>
          </div>
        )}

        {serverInfo && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">
                  Instance:
                </span>
                <Badge variant="secondary" className="ml-2 font-mono">
                  {serverInfo.instance}
                </Badge>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Status:
                </span>
                <Badge variant="default" className="ml-2">
                  Online
                </Badge>
              </div>
            </div>

            <div className="text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-muted-foreground">
                  Domain:
                </span>
                <Badge variant="outline" className="font-mono">
                  {serverInfo.domain}
                </Badge>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <div>
                Server Time: {new Date(serverInfo.time).toLocaleString()}
              </div>
              <div>Last Updated: {new Date().toLocaleString()}</div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                onClick={fetchServerInfo}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-3 w-3 mr-1 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>

              {autoRefresh && (
                <Badge variant="outline" className="text-xs">
                  Auto-refresh: {Math.floor(refreshInterval / 1000)}s
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InlineServerInfo;
