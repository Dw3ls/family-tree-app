import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Silsilah Keluarga Besar | Visualisasi Pohon Keluarga & Kalkulator Kekerabatan',
  description:
    'Aplikasi web interaktif untuk memvisualisasikan silsilah garis keturunan keluarga besar lintas generasi dengan kalkulasi hubungan kekerabatan otomatis.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`h-full ${jakartaSans.variable}`}>
      <body className="h-full flex flex-col font-sans antialiased text-zinc-900 bg-zinc-50">
        {children}
      </body>
    </html>
  );
}
