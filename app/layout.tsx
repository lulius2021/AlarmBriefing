import type { Metadata } from 'next';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'AlarmBriefing',
  description: 'Your smart alarm clock with audio briefings',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();
  const acceptLang = hdrs.get('accept-language') || '';
  const lang = acceptLang.startsWith('de') ? 'de' : 'en';

  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
