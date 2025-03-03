import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { UsuarioProvider } from '@/contexts/UsuarioContext';
import { TemaProvider } from '@/contexts/TemaContext';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Deputada Mara Caseiro',
  description: 'Plataforma completa para gestão de campanhas políticas, apoiadores, demandas e eventos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <UsuarioProvider>
            <TemaProvider>
              {children}
            </TemaProvider>
          </UsuarioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
