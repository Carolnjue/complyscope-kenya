// Copies static assets into the standalone server folder so it can run on its own (required by Next.js standalone output).
import fs from 'fs';
import path from 'path';
const root = process.cwd();
const sa = path.join(root, '.next', 'standalone');
function copy(src, dst) { if (!fs.existsSync(src)) return; fs.cpSync(src, dst, { recursive: true }); }
copy(path.join(root, 'public'), path.join(sa, 'public'));
copy(path.join(root, '.next', 'static'), path.join(sa, '.next', 'static'));
// Passenger (DirectAdmin "Setup Node.js App") starts app.js by default
fs.writeFileSync(path.join(sa, 'app.js'), "process.env.HOSTNAME = process.env.HOSTNAME || '127.0.0.1';\nrequire('./server.js');\n");
fs.mkdirSync(path.join(sa, 'tmp'), { recursive: true });
fs.writeFileSync(path.join(sa, 'tmp', 'restart.txt'), new Date().toISOString());
console.log('standalone bundle ready:', sa);
