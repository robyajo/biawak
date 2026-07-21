import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_VERSION_URL = 'https://registry.npmjs.org/create-biawak-app/latest';
const TIMEOUT = 2000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8'));
const currentVersion = packageJson.dependencies?.['create-biawak-app'] || packageJson.version;

function checkForUpdates() {
    if (!REPO_VERSION_URL) return;

    const req = https.get(REPO_VERSION_URL, {
        headers: { 'User-Agent': 'NodeJS Update Checker' },
        timeout: TIMEOUT
    }, (res) => {
        let data = '';

        if (res.statusCode !== 200) {
            return;
        }

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const remoteJson = JSON.parse(data);
                const latestVersion = remoteJson.version || remoteJson['dist-tags']?.latest;

                if (latestVersion && isNewer(latestVersion, currentVersion)) {
                    showUpdateMessage(latestVersion, currentVersion);
                }
            } catch (e) {
                // Ignore parsing errors
            }
        });
    });

    req.on('error', (e) => {
        // Ignore network errors
    });

    req.end();
}

function isNewer(latest, current) {
    const lParts = latest.split('.').map(Number);
    const cParts = current.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
        if (lParts[i] > cParts[i]) return true;
        if (lParts[i] < cParts[i]) return false;
    }
    return false;
}

function showUpdateMessage(latest, current) {
    const reset = "\x1b[0m";
    const bright = "\x1b[1m";
    const fgYellow = "\x1b[33m";
    const fgCyan = "\x1b[36m";

    console.log('\n');
    console.log(`${fgYellow}┌─────────────────────────────────────────────────────────────┐${reset}`);
    console.log(`${fgYellow}│                                                             │${reset}`);
    console.log(`${fgYellow}│   ${bright}UPDATE BIAWAK FRAMEWORK TERSEDIA!${reset}${fgYellow}                         │${reset}`);
    console.log(`${fgYellow}│                                                             │${reset}`);
    console.log(`${fgYellow}│   Versi Lokal   : ${fgCyan}${current}${reset}${fgYellow}                                      │${reset}`);
    console.log(`${fgYellow}│   Versi Terbaru : ${fgCyan}${latest}${reset}${fgYellow}                                      │${reset}`);
    console.log(`${fgYellow}│                                                             │${reset}`);
    console.log(`${fgYellow}│   Silakan cek repository untuk melihat perubahan terbaru.   │${reset}`);
    console.log(`${fgYellow}│                                                             │${reset}`);
    console.log(`${fgYellow}│   Langkah Upgrade:                                          │${reset}`);
    console.log(`${fgYellow}│   1. ${fgCyan}npm install -g create-biawak-app@latest${reset}${fgYellow}                 │${reset}`);
    console.log(`${fgYellow}│   2. ${fgCyan}bun run upgrade${reset}${fgYellow} (di folder proyek Anda)                 │${reset}`);
    console.log(`${fgYellow}│                                                             │${reset}`);
    console.log(`${fgYellow}└─────────────────────────────────────────────────────────────┘${reset}`);
    console.log('\n');
}

function cleanUserWorkspace() {
    const cwd = process.cwd();
    
    // Safety check: Do NOT run cleanup if in the framework development workspace
    if (fs.existsSync(path.join(cwd, 'bin', 'release.js')) || fs.existsSync(path.join(cwd, 'website', 'astro.config.mjs'))) {
        return;
    }

    const filesToDelete = ['.agents', 'packages', 'AGENTS.md'];
    
    filesToDelete.forEach(file => {
        const filePath = path.join(cwd, file);
        if (fs.existsSync(filePath)) {
            try {
                fs.rmSync(filePath, { recursive: true, force: true });
                console.log(`\x1b[32m[Biawak Upgrade] Bersihkan berkas developer: ${file}\x1b[0m`);
            } catch (err) {
                // Ignore cleanup errors
            }
        }
    });
}

cleanUserWorkspace();
checkForUpdates();