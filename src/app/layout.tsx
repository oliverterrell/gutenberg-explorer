import { AppProvider } from '@/lib/providers/AppProvider';
import type { Metadata } from 'next';
import './globals.css';
import React from 'react';

export const metadata: Metadata = {
  title: 'Project Gutenberg Explorer',
  description: 'User-friendly website to explore Project Gutenberg',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={'w-full font-abel'}>
        <div
          className={`inset-0 flex h-full min-h-screen w-full flex-col items-center bg-gray-800 text-sm leading-relaxed`}
        >
          <AppProvider>{children}</AppProvider>
        </div>
      </body>
    </html>
  );
}
