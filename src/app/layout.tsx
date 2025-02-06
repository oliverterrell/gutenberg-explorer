import { AppProvider } from '@/lib/providers/AppProvider';
import type { Metadata } from 'next';
import './globals.css';
import React from 'react';

export const metadata: Metadata = {
  title: 'Next.js Template',
  description: 'Next.js Template by Oliver Terrell',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={'font-abel'}>
        <div className={`inset-0 flex h-full min-h-screen flex-col items-center text-sm leading-relaxed`}>
          <AppProvider>{children}</AppProvider>
        </div>
      </body>
    </html>
  );
}
