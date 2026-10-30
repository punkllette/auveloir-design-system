import sharp from 'sharp';
import { stat } from 'node:fs/promises';
const images = ['eter-precision-studio', 'nexo_preview', 'porsche_preview'];
for (const name of images) {
  const base = `public/assets/overview/assets/${name}`;
  const { width } = await sharp(`${base}.png`).metadata();
  for (const size of [...new Set([480, 800, 1200, width].filter(size => size <= width))]) {
    await sharp(`${base}.png`).resize({ width: size }).avif({ quality: 50, effort: 6 }).toFile(`${base}-${size}.avif`);
    await sharp(`${base}.png`).resize({ width: size }).webp({ quality: 72, effort: 6 }).toFile(`${base}-${size}.webp`);
    console.log(`${name} ${size}px: AVIF ${Math.round((await stat(`${base}-${size}.avif`)).size / 1024)} KiB`);
  }
}
