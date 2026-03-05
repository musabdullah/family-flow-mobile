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
  <!-- Background -->
  <rect width="512" height="512" fill="#FAF9F6" />

  <!-- Connecting line -->
  <polyline points="160,175 256,155 352,175" stroke="#E5E4E2" stroke-width="3" fill="none" />

  <!-- Middle Circle (Teal) -->
  <circle cx="256" cy="155" r="42" fill="#1BBFAE" />
  <circle cx="242" cy="141" r="9" fill="#45DACD" />

  <!-- Left Circle (Coral) -->
  <circle cx="160" cy="175" r="34" fill="#FD7F68" />
  <circle cx="149" cy="164" r="7.5" fill="#FFA496" />

  <!-- Right Circle (Orange) -->
  <circle cx="352" cy="175" r="34" fill="#F5A52A" />
  <circle cx="341" cy="164" r="7.5" fill="#FAD172" />

  <!-- Pills -->
  <!-- Top Pill (Coral) -->
  <rect x="106" y="250" width="300" height="50" rx="25" fill="#FD7F68" />
  <!-- Checkmark -->
  <polyline points="364,275 372,283 388,265" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />

  <!-- Middle Pill (Teal) -->
  <rect x="106" y="325" width="210" height="50" rx="25" fill="#1BBFAE" />

  <!-- Bottom Pill (Orange) -->
  <rect x="106" y="400" width="150" height="50" rx="25" fill="#F5A52A" />
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
