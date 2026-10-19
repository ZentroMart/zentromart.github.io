/**
 * ZentroMart — Zero-Dependency Local Static Server
 * Runs out-of-the-box with standard Node.js (no npm install required).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0].split('#')[0];
  try {
    reqUrl = decodeURIComponent(reqUrl);
  } catch (e) {}

  if (reqUrl === '/') reqUrl = '/index.html';

  let filePath = path.join(ROOT_DIR, reqUrl);

  // Security check: restrict within ROOT_DIR
  if (!filePath.startsWith(ROOT_DIR)) {
    res.statusCode = 403;
    res.end('Access Denied');
    return;
  }

  let stats;
  try {
    stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      stats = fs.statSync(filePath);
    }
  } catch (e) {
    // Clean URL fallback: e.g. /shop -> /shop.html
    const htmlFallback = filePath + '.html';
    try {
      stats = fs.statSync(htmlFallback);
      filePath = htmlFallback;
    } catch (e2) {
      // 404 fallback
      const notFoundPath = path.join(ROOT_DIR, '404.html');
      try {
        const notFoundContent = fs.readFileSync(notFoundPath);
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(notFoundContent);
        return;
      } catch (e3) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache'
  });

  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});

function startServer(portToTry) {
  server.listen(portToTry, () => {
    const url = `http://localhost:${portToTry}/`;
    console.log(`================================================================`);
    console.log(`  ZentroMart Local Server Running at: ${url}`);
    console.log(`================================================================`);
    console.log(`- Root Directory: ${ROOT_DIR}`);
    console.log(`- WhatsApp Orders: +92 318 3085519`);
    console.log(`- Press Ctrl+C in this window anytime to stop.\n`);

    // Open default browser automatically
    const startCmd = process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`;

    exec(startCmd, (err) => {
      if (err) {
        console.log(`Please open your browser to: ${url}`);
      }
    });
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = Number(server.address()?.port || PORT) + 1;
    console.log(`[INFO] Port ${PORT} is currently occupied. Switching to port ${nextPort}...`);
    startServer(nextPort);
  } else {
    console.error('Server error:', err);
  }
});

startServer(PORT);
