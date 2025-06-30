'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioTower, LogIn, PlusCircle, ArrowRight } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [roomName, setRoomName] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleJoin = (isHost: boolean) => {
    if (!roomName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a room name.",
        variant: "destructive",
      })
      return;
    }
    const slug = roomName.trim().toLowerCase().replace(/\s+/g, '-');
    if (isHost) {
      router.push(`/${slug}?host=true`);
    } else {
      router.push(`/${slug}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="flex flex-col items-center text-center mb-12">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <RadioTower className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-5xl font-bold font-headline text-primary">CursorSync</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Real-time cursor collaboration for teams.
        </p>
      </div>

      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Join or Create a Room</CardTitle>
          <CardDescription>Enter a room name to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="e.g. design-review"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin(true)}
              className="h-12 text-lg"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button size="lg" className="w-full" onClick={() => handleJoin(true)}>
                <PlusCircle />
                Create as Host
                <ArrowRight />
              </Button>
              <Button size="lg" variant="secondary" className="w-full" onClick={() => handleJoin(false)}>
                <LogIn />
                Join as Guest
                <ArrowRight />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
