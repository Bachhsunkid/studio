'use client';

import { MousePointer2 } from 'lucide-react';

type CursorPosition = {
  x: number;
  y: number;
} | null;

type CursorCanvasProps = {
  isHost: boolean;
  onMouseMove: (event: React.MouseEvent<HTMLDivElement>) => void;
  hostCursorPosition: CursorPosition;
};

export default function CursorCanvas({
  isHost,
  onMouseMove,
  hostCursorPosition,
}: CursorCanvasProps) {
  return (
    <div
      onMouseMove={onMouseMove}
      className="relative h-96 w-full rounded-lg border-2 border-dashed bg-card overflow-hidden"
      style={{ cursor: isHost ? 'none' : 'default' }}
    >
      {hostCursorPosition && (
        <div
          className="absolute transition-all duration-75 ease-out"
          style={{
            left: `${hostCursorPosition.x}px`,
            top: `${hostCursorPosition.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <MousePointer2
            className="h-8 w-8 text-accent"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
          />
        </div>
      )}
      {!hostCursorPosition && (
        <div className="flex items-center justify-center h-full text-muted-foreground">
            {isHost ? "Move your cursor here" : "Waiting for host's cursor..."}
        </div>
      )}
    </div>
  );
}
