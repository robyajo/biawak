const https = require('https');
const fs = require('fs');
const path = require('path');

const REPO_VERSION_URL = 'https://registry.npmjs.org/create-biawak-app/latest';
const TIMEOUT = 2000;

const packageJson = require('../package.json');
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
    console.log(`${fgYellow}│   Untuk upgrade jalankan:                                   │${reset}`);
    console.log(`${fgYellow}│   ${fgCyan}npm install create-biawak-app@latest${reset}${fgYellow}                         │${reset}`);
    console.log(`${fgYellow}│                                                             │${reset}`);
    console.log(`${fgYellow}└─────────────────────────────────────────────────────────────┘${reset}`);
    console.log('\n');
}

checkForUpdates();