import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AlarmBriefing',
  description: 'Dein intelligenter Wecker mit Audio-Briefings',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
