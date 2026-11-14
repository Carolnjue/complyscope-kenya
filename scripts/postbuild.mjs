// Copies static assets into the standalone server folder so it can run on its own (required by Next.js standalone output).
import fs from 'fs';
import path from 'path';
const root = process.cwd();
const sa = path.join(root, '.next', 'standalone');
function copy(src, dst) { if (!fs.existsSync(src)) return; fs.cpSync(src, dst, { recursive: true }); }
copy(path.join(root, 'public'), path.join(sa, 'public'));
copy(path.join(root, '.next', 'static'), path.join(sa, '.next', 'static'));
// Passenger (DirectAdmin "Setup Node.js App") starts app.js by default
fs.writeFileSync(path.join(sa, 'app.js'), `process.env.HOSTNAME = process.env.HOSTNAME || '127.0.0.1';
// Restart after each deploy: the workflow uploads deployed.txt last, once every other file is in place.
// When it changes, this process exits and Passenger starts a fresh one on the next request.
const fs = require('fs'), path = require('path');
const stamp = path.join(__dirname, 'deployed.txt');
const read = () => { try { return fs.readFileSync(stamp, 'utf8'); } catch { return ''; } };
const started = read();
setInterval(() => { const now = read(); if (now && now !== started) process.exit(0); }, 20000).unref();
require('./server.js');
`);
fs.mkdirSync(path.join(sa, 'tmp'), { recursive: true });
fs.writeFileSync(path.join(sa, 'tmp', 'restart.txt'), new Date().toISOString());
console.log('standalone bundle ready:', sa);
