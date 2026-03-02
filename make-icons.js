const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Install sharp locally if not present
try {
    require.resolve('sharp');
} catch (e) {
    console.log("Installing sharp...");
    execSync('npm install --no-save sharp');
}

const sharp = require('sharp');

const svgCode = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 512 512"
  width="1024"
  height="1024"
>
  <defs>
    <radialGradient id="v2-bg" cx="50%" cy="52%" r="68%">
      <stop offset="0%" stop-color="#17122c" />
      <stop offset="58%" stop-color="#0e0b1a" />
      <stop offset="100%" stop-color="#060408" />
    </radialGradient>
    <radialGradient id="v2-warm" cx="50%" cy="55%" r="55%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.14" />
      <stop offset="55%" stop-color="#f59e0b" stop-opacity="0.04" />
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="v2-foundation" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="v2-roof" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#fcd34d" />
      <stop offset="48%" stop-color="#f97316" />
      <stop offset="100%" stop-color="#e11d48" />
    </linearGradient>
    <linearGradient id="v2-teal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6ee7da" />
      <stop offset="100%" stop-color="#0d9488" />
    </linearGradient>
    <linearGradient id="v2-purp" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#c4b5fd" />
      <stop offset="100%" stop-color="#6d28d9" />
    </linearGradient>
    <linearGradient id="v2-pink" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fbcfe8" />
      <stop offset="100%" stop-color="#be185d" />
    </linearGradient>
    <radialGradient id="v2-starglow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="1" />
      <stop offset="55%" stop-color="#fcd34d" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#fbbf24" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="512" height="512" rx="112" ry="112" fill="url(#v2-bg)" />
  <ellipse cx="256" cy="310" rx="220" ry="195" fill="url(#v2-warm)" />
  <ellipse cx="256" cy="464" rx="170" ry="42" fill="url(#v2-foundation)" />

  <rect x="100" y="246" width="312" height="216" rx="24" fill="#f59e0b" fill-opacity="0.04" />
  <rect x="108" y="252" width="296" height="208" rx="22" fill="#0d0e1c" stroke="rgba(255,195,80,0.13)" stroke-width="1.6" />
  <rect x="108" y="252" width="296" height="208" rx="22" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1" />

  <rect x="124" y="270" width="76" height="168" rx="14" fill="#5eead4" fill-opacity="0.055" />
  <circle cx="162" cy="286" r="18" fill="#5eead4" fill-opacity="0.09" />
  <circle cx="162" cy="286" r="12" fill="url(#v2-teal)" />
  <rect x="130" y="308" width="62" height="15" rx="6" fill="#5eead4" fill-opacity="0.23" />
  <rect x="130" y="308" width="22" height="15" rx="6" fill="#5eead4" fill-opacity="0.55" />
  <rect x="130" y="330" width="62" height="15" rx="6" fill="#5eead4" fill-opacity="0.15" />
  <rect x="130" y="330" width="36" height="15" rx="6" fill="#5eead4" fill-opacity="0.38" />
  <rect x="130" y="352" width="46" height="15" rx="6" fill="#5eead4" fill-opacity="0.09" />
  <circle cx="162" cy="410" r="5" fill="#5eead4" fill-opacity="0.38" />

  <rect x="218" y="260" width="76" height="178" rx="14" fill="#a78bfa" fill-opacity="0.07" />
  <rect x="218" y="260" width="76" height="178" rx="14" fill="none" stroke="#a78bfa" stroke-width="1.4" stroke-opacity="0.32" />
  <circle cx="256" cy="276" r="20" fill="#a78bfa" fill-opacity="0.10" />
  <circle cx="256" cy="276" r="13" fill="url(#v2-purp)" />
  <rect x="224" y="298" width="62" height="15" rx="6" fill="#a78bfa" fill-opacity="0.28" />
  <rect x="224" y="298" width="26" height="15" rx="6" fill="#a78bfa" fill-opacity="0.62" />
  <rect x="224" y="320" width="62" height="15" rx="6" fill="#a78bfa" fill-opacity="0.19" />
  <rect x="224" y="320" width="42" height="15" rx="6" fill="#a78bfa" fill-opacity="0.46" />
  <rect x="224" y="342" width="62" height="15" rx="6" fill="#a78bfa" fill-opacity="0.13" />
  <rect x="224" y="364" width="40" height="15" rx="6" fill="#a78bfa" fill-opacity="0.08" />
  <circle cx="247" cy="414" r="4" fill="#a78bfa" fill-opacity="0.48" />
  <circle cx="260" cy="414" r="4" fill="#a78bfa" fill-opacity="0.28" />

  <rect x="312" y="270" width="76" height="168" rx="14" fill="#f472b6" fill-opacity="0.055" />
  <circle cx="350" cy="286" r="18" fill="#f472b6" fill-opacity="0.09" />
  <circle cx="350" cy="286" r="12" fill="url(#v2-pink)" />
  <rect x="318" y="308" width="62" height="15" rx="6" fill="#f472b6" fill-opacity="0.24" />
  <rect x="318" y="308" width="18" height="15" rx="6" fill="#f472b6" fill-opacity="0.58" />
  <rect x="318" y="330" width="50" height="15" rx="6" fill="#f472b6" fill-opacity="0.14" />
  <rect x="318" y="330" width="30" height="15" rx="6" fill="#f472b6" fill-opacity="0.35" />
  <circle cx="350" cy="410" r="5" fill="#f472b6" fill-opacity="0.38" />

  <rect x="300" y="104" width="34" height="60" rx="6" fill="#0d0e1c" stroke="rgba(255,195,80,0.22)" stroke-width="1.5" />
  <circle cx="312" cy="93" r="9" fill="#f59e0b" fill-opacity="0.08" />
  <circle cx="323" cy="80" r="6.5" fill="#f59e0b" fill-opacity="0.055" />
  <circle cx="332" cy="70" r="4.5" fill="#f59e0b" fill-opacity="0.035" />

  <polygon points="256,112 78,268 434,268" fill="rgba(0,0,0,0.45)" transform="translate(0,4)" />
  <polygon points="256,112 82,264 430,264" fill="url(#v2-roof)" />
  <polygon points="256,112 82,264 256,264" fill="rgba(255,255,255,0.052)" />
  <polyline points="82,264 256,112 430,264" stroke="rgba(255,235,150,0.5)" stroke-width="2.8" fill="none" stroke-linejoin="round" stroke-linecap="round" />

  <circle cx="256" cy="140" r="26" fill="url(#v2-starglow)" fill-opacity="0.6" />
  <path d="M256,125 L259,136 L270,139.5 L259,143 L256,154 L253,143 L242,139.5 L253,136 Z" fill="#fef08a" />
  <circle cx="256" cy="139.5" r="3.5" fill="#fff" fill-opacity="0.9" />

  <path d="M 70,192 Q 150,148 256, 60" stroke="#c4b5fd" stroke-width="1" stroke-opacity="0.18" fill="none" stroke-dasharray="5 5" />
  <path d="M 442,192 Q 362,148 256, 60" stroke="#f9a8d4" stroke-width="1" stroke-opacity="0.18" fill="none" stroke-dasharray="5 5" />

  <circle cx="70" cy="192" r="16" fill="#5eead4" fill-opacity="0.07" />
  <circle cx="70" cy="192" r="8" fill="#1a2428" stroke="#5eead4" stroke-width="2.2" stroke-opacity="0.8" />
  <circle cx="70" cy="192" r="3.5" fill="#5eead4" fill-opacity="0.9" />

  <circle cx="256" cy="52" r="16" fill="#c4b5fd" fill-opacity="0.07" />
  <circle cx="256" cy="52" r="8" fill="#161228" stroke="#c4b5fd" stroke-width="2.2" stroke-opacity="0.8" />
  <circle cx="256" cy="52" r="3.5" fill="#c4b5fd" fill-opacity="0.9" />

  <circle cx="442" cy="192" r="16" fill="#f9a8d4" fill-opacity="0.07" />
  <circle cx="442" cy="192" r="8" fill="#1f1224" stroke="#f9a8d4" stroke-width="2.2" stroke-opacity="0.8" />
  <circle cx="442" cy="192" r="3.5" fill="#f9a8d4" fill-opacity="0.9" />

  <g transform="translate(98,86)" opacity="0.52">
    <line x1="-7" y1="0" x2="7" y2="0" stroke="#fbbf24" stroke-width="1.6" stroke-linecap="round" />
    <line x1="0" y1="-7" x2="0" y2="7" stroke="#fbbf24" stroke-width="1.6" stroke-linecap="round" />
    <line x1="-5" y1="-5" x2="5" y2="5" stroke="#fbbf24" stroke-width="0.8" stroke-linecap="round" stroke-opacity="0.5" />
    <line x1="5" y1="-5" x2="-5" y2="5" stroke="#fbbf24" stroke-width="0.8" stroke-linecap="round" stroke-opacity="0.5" />
  </g>
  <g transform="translate(448,298)" opacity="0.4">
    <line x1="-5.5" y1="0" x2="5.5" y2="0" stroke="#5eead4" stroke-width="1.5" stroke-linecap="round" />
    <line x1="0" y1="-5.5" x2="0" y2="5.5" stroke="#5eead4" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g transform="translate(72,382)" opacity="0.38">
    <line x1="-4.5" y1="0" x2="4.5" y2="0" stroke="#a78bfa" stroke-width="1.4" stroke-linecap="round" />
    <line x1="0" y1="-4.5" x2="0" y2="4.5" stroke="#a78bfa" stroke-width="1.4" stroke-linecap="round" />
  </g>
  <circle cx="118" cy="116" r="2.2" fill="#fbbf24" fill-opacity="0.52" />
  <circle cx="400" cy="84" r="2.5" fill="#fbcfe8" fill-opacity="0.52" />
  <circle cx="460" cy="388" r="2" fill="#5eead4" fill-opacity="0.42" />
  <circle cx="58" cy="318" r="1.8" fill="#c4b5fd" fill-opacity="0.42" />
  <circle cx="168" cy="58" r="1.6" fill="#fbbf24" fill-opacity="0.38" />
  <circle cx="346" cy="56" r="1.6" fill="#fbbf24" fill-opacity="0.38" />

  <rect width="512" height="512" rx="112" ry="112" fill="none" stroke="rgba(255,200,90,0.07)" stroke-width="1.5" />
</svg>
`;

async function convertSVG() {
    const assetsDir = path.join(__dirname, 'assets');
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);

    const buffer = Buffer.from(svgCode);

    console.log("Generating icon.png...");
    await sharp(buffer)
        .resize(1024, 1024)
        .png()
        .toFile(path.join(assetsDir, 'icon.png'));

    console.log("Generating adaptive-icon.png...");
    await sharp(buffer)
        .resize(1024, 1024)
        .png()
        .toFile(path.join(assetsDir, 'adaptive-icon.png'));

    console.log("Generating splash-icon.png...");
    // Make the splash slightly smaller inside the box with transparent bg
    await sharp({
        create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
    })
        .composite([{ input: await sharp(buffer).resize(512, 512).toBuffer(), gravity: 'center' }])
        .png()
        .toFile(path.join(assetsDir, 'splash-icon.png'));

    console.log("Done generating all icons!");
}

convertSVG().catch(console.error);
