import type { Metadata } from 'next';
import './globals.css';
import { GameProvider } from '@/lib/useGameState';

export const metadata: Metadata = {
  title: 'Império das Máquinas',
  description: 'Simulador de empresa de máquinas pesadas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-background">
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
