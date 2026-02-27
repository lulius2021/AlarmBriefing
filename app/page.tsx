'use client';

// AlarmBriefing — Single Page App
// Serves the complete UI as a single client component to keep it simple and fast.
// All API calls go to /api/* routes on the same domain.

export default function Home() {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <script>window.location.href = '/app.html';</script>
    `}} />
  );
}
