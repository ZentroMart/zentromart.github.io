/**
 * ZentroMart — Catalog Build & Chunk Generator Script
 * Validates data/products.json and generates client-side chunks (25 items/page)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const productsPath = path.join(rootDir, 'data', 'products.json');
const categoriesPath = path.join(rootDir, 'data', 'categories.json');
const manifestPath = path.join(rootDir, 'data', 'catalog', 'manifest.json');
const chunksDir = path.join(rootDir, 'data', 'catalog', 'chunks');

if (!fs.existsSync(chunksDir)) {
  fs.mkdirSync(chunksDir, { recursive: true });
}

console.log('📦 Reading products from:', productsPath);
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

console.log(`✅ Loaded ${products.length} products and ${categories.length} categories.`);

// Validate Schema
const idSet = new Set();
const slugSet = new Set();

products.forEach((p, index) => {
  if (!p.id) throw new Error(`Product at index ${index} missing id`);
  if (!p.slug) throw new Error(`Product ${p.id} missing slug`);
  if (idSet.has(p.id)) throw new Error(`Duplicate product ID: ${p.id}`);
  if (slugSet.has(p.slug)) throw new Error(`Duplicate slug: ${p.slug}`);
  idSet.add(p.id);
  slugSet.add(p.slug);

  if (typeof p.price !== 'number') throw new Error(`Product ${p.id} has invalid price`);
  if (!Array.isArray(p.images) || p.images.length === 0) {
    console.warn(`⚠️ Product ${p.id} has no images array, setting placeholder`);
    p.images = ['assets/images/placeholder.svg'];
  }
});

const PAGE_SIZE = 25;
const totalPages = Math.ceil(products.length / PAGE_SIZE);
const chunks = [];

for (let page = 1; page <= totalPages; page++) {
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, products.length);
  const chunkItems = products.slice(start, end);
  const chunkFileName = `chunk-${page}.json`;
  const chunkFilePath = path.join(chunksDir, chunkFileName);

  fs.writeFileSync(chunkFilePath, JSON.stringify(chunkItems, null, 2), 'utf8');

  chunks.push({
    page,
    file: `data/catalog/chunks/${chunkFileName}`,
    count: chunkItems.length,
    range: [start + 1, end]
  });

  console.log(`📄 Wrote ${chunkFileName}: ${chunkItems.length} products (items ${start + 1}–${end})`);
}

const manifest = {
  totalProducts: products.length,
  pageSize: PAGE_SIZE,
  totalPages,
  lastUpdated: new Date().toISOString(),
  chunks,
  searchIndexFile: 'data/products.json'
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log('✨ Catalog build complete! Manifest generated at data/catalog/manifest.json');
