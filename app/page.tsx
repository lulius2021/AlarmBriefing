import { redirect } from 'next/navigation';

// Landing page is at /index.html (static)
// This catches the Next.js route and redirects
export default function Home() {
  redirect('/index.html');
}
