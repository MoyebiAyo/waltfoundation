// Generates the social sharing image (OG) and the favicon/app icon set
// from existing source images. Outputs are committed, so this only needs
// re-running when hero.webp or logo.webp changes.
const sharp = require('sharp');
const path = require('path');

const src = (p) => path.join(__dirname, '..', p);
const out = (p) => path.join(__dirname, '..', 'assets', 'img', p);

(async () => {
  // 1200x630 social card from the hero photo
  await sharp(src('assets/img/hero.webp'))
    .resize(1200, 630, { fit: 'cover' })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(out('og-image.jpg'));

  // Square icon set from the logo
  const icons = [
    [512, 'icon-512.png'],
    [192, 'icon-192.png'],
    [180, 'apple-touch-icon.png'],
    [32, 'favicon-32x32.png'],
    [16, 'favicon-16x16.png']
  ];
  for (const [size, name] of icons) {
    await sharp(src('assets/img/logo.webp'))
      .resize(size, size, { fit: 'cover' })
      .png({ compressionLevel: 9 })
      .toFile(out(name));
  }

  console.log('SEO images generated into assets/img/');
})();
