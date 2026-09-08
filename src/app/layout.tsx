import type { Metadata } from 'next';
import './globals.css';
import { GameProvider } from '@/lib/useGameState';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Império das Máquinas',
  description: 'Simulador de empresa de máquinas pesadas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#0F1218] pb-20">
        <GameProvider>
          {children}
          <BottomNav />
        </GameProvider>
      </body>
    </html>
  );
}
