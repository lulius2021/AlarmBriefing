import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, '..', 'assets');

// App Icon: dark blue bg with bell emoji-style icon
const iconSvg = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#1a2744"/>
      <stop offset="100%" stop-color="#0a0e1a"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="20" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="1024" height="1024" rx="224" fill="url(#bg)"/>
  <!-- Bell body -->
  <g transform="translate(512,480)" filter="url(#glow)">
    <path d="M0-220c-100,0-180,80-180,180v100c0,30-20,50-50,60h460c-30-10-50-30-50-60v-100c0-100-80-180-180-180z" fill="#3b82f6"/>
    <!-- Bell top -->
    <circle cx="0" cy="-220" r="30" fill="#60a5fa"/>
    <!-- Clapper -->
    <ellipse cx="0" cy="140" rx="50" ry="30" fill="#60a5fa"/>
  </g>
  <!-- Glow ring -->
  <circle cx="512" cy="480" r="260" fill="none" stroke="rgba(59,130,246,0.15)" stroke-width="40"/>
  <!-- Text -->
  <text x="512" y="860" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="100" fill="#e2e8f0">Alarm<tspan fill="#3b82f6">Briefing</tspan></text>
</svg>`;

// Splash: same style, centered
const splashSvg = `
<svg width="1284" height="2778" xmlns="http://www.w3.org/2000/svg">
  <rect width="1284" height="2778" fill="#0a0e1a"/>
  <g transform="translate(642,1200)">
    <defs>
      <filter id="g2">
        <feGaussianBlur stdDeviation="15" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <g filter="url(#g2)">
      <path d="M0-180c-80,0-150,65-150,150v80c0,25-15,40-40,50h380c-25-10-40-25-40-50v-80c0-85-70-150-150-150z" fill="#3b82f6"/>
      <circle cx="0" cy="-180" r="24" fill="#60a5fa"/>
      <ellipse cx="0" cy="115" rx="40" ry="24" fill="#60a5fa"/>
    </g>
    <circle cx="0" cy="0" r="220" fill="none" stroke="rgba(59,130,246,0.1)" stroke-width="30"/>
  </g>
  <text x="642" y="1520" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="80" fill="#e2e8f0">Alarm<tspan fill="#3b82f6">Briefing</tspan></text>
  <text x="642" y="1580" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="32" fill="#64748b">Wake up like Tony Stark</text>
</svg>`;

// Adaptive icon foreground (Android)
const adaptiveSvg = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(512,460)">
    <path d="M0-180c-80,0-150,65-150,150v80c0,25-15,40-40,50h380c-25-10-40-25-40-50v-80c0-85-70-150-150-150z" fill="#3b82f6"/>
    <circle cx="0" cy="-180" r="24" fill="#60a5fa"/>
    <ellipse cx="0" cy="115" rx="40" ry="24" fill="#60a5fa"/>
  </g>
</svg>`;

async function generate() {
  // Icon 1024x1024
  await sharp(Buffer.from(iconSvg)).resize(1024, 1024).png().toFile(path.join(out, 'icon.png'));
  console.log('✓ icon.png');

  // Splash 1284x2778
  await sharp(Buffer.from(splashSvg)).resize(1284, 2778).png().toFile(path.join(out, 'splash.png'));
  console.log('✓ splash.png');

  // Adaptive icon
  await sharp(Buffer.from(adaptiveSvg)).resize(1024, 1024).png().toFile(path.join(out, 'adaptive-icon.png'));
  console.log('✓ adaptive-icon.png');

  // Favicon
  await sharp(Buffer.from(iconSvg)).resize(48, 48).png().toFile(path.join(out, 'favicon.png'));
  console.log('✓ favicon.png');
}

generate().catch(console.error);
