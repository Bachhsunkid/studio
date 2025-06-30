'use client';

import { Textarea } from '@/components/ui/textarea';

type CoordinateLogProps = {
  logs: string[];
};

export default function CoordinateLog({ logs }: CoordinateLogProps) {
  return (
    <Textarea
      readOnly
      value={logs.join('\n')}
      className="h-96 w-full font-mono text-xs resize-none"
      placeholder="Cursor coordinate events will appear here..."
    />
  );
}
