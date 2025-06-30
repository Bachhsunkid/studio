import RoomClient from '@/components/room/room-client';
import type { Metadata } from 'next';

type RoomPageProps = {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: RoomPageProps): Promise<Metadata> {
  const { roomId } = await params;
  return {
    title: `Room: ${roomId} | CursorSync`,
  };
}

export default async function RoomPage({ params, searchParams }: RoomPageProps) {
  const { roomId } = await params;
  const resolvedSearchParams = await searchParams;
  const isHost = resolvedSearchParams.host === 'true';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 md:p-8">
      <RoomClient roomId={roomId} isHost={isHost} />
    </main>
  );
}
