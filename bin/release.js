const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

function getCommandOutput(command, options = {}) {
    try {
        return execSync(command, {
            stdio: 'pipe',
            encoding: 'utf8',
            ...options
        }).trim();
    } catch (error) {
        const stdout = error.stdout ? error.stdout.toString() : '';
        const stderr = error.stderr ? error.stderr.toString() : '';
        const combined = `${stdout}\n${stderr}`.trim();
        error.combinedOutput = combined;
        throw error;
    }
}

function isOtpError(output) {
    const text = (output || '').toLowerCase();
    return text.includes('one-time pass') ||
        text.includes('otp') ||
        text.includes('eotp');
}

function isPermissionError(output) {
    const text = (output || '').toLowerCase();
    return text.includes('e404') ||
        text.includes('404 not found') ||
        text.includes('e403') ||
        text.includes('permission') ||
        text.includes('not authorized') ||
        text.includes('not in this registry') ||
        text.includes('cannot publish over the previously published versions');
}

// Paths
const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');

// Read current package details
const pkg = require(packageJsonPath);
const packageName = pkg.name || 'create-biawak-app';
const currentVersion = pkg.version || '1.0.0';

console.log(`\n🚀 🦎 Biawak (${packageName}) Release Automation Script`);
console.log(`Current Version: v${currentVersion}\n`);

// Helper to get npm version
function getNpmVersion() {
    try {
        return getCommandOutput(`npm view ${packageName} version`);
    } catch (e) {
        return null;
    }
}

function getNpmUser() {
    try {
        return getCommandOutput('npm whoami');
    } catch (e) {
        return null;
    }
}

// Helper to increment patch version
function incrementPatch(version) {
    const parts = version.split('.').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return version;
    parts[2]++;
    return parts.join('.');
}

// Helper to generate auto commit message
function generateAutoCommitMessage() {
    try {
        const status = execSync('git status --porcelain', { stdio: 'pipe' }).toString().trim();
        if (!status) return 'chore: no changes detected';

        const files = status.split('\n').map(line => line.substring(3).trim());

        const hasDocs = files.some(f => f.endsWith('.md'));
        const hasScripts = files.some(f => f.startsWith('scripts/') || f.startsWith('bin/'));
        const hasPackage = files.some(f => f.includes('package.json'));
        const hasSrc = files.some(f => f.startsWith('src/'));

        let types = [];
        if (hasDocs) types.push('docs');
        if (hasScripts) types.push('scripts');
        if (hasPackage) types.push('deps');
        if (hasSrc) types.push('feat/fix');

        if (types.length === 0) return 'chore: update project files';
        if (hasDocs && !hasSrc && !hasScripts) return 'docs: update documentation';
        if (hasScripts && !hasSrc) return 'chore: update build scripts';

        return `chore: update ${types.join(', ')}`;
    } catch (e) {
        return 'chore: update project files';
    }
}

function updatePackageJsonVersion(filePath, version) {
    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    json.version = version;
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n');
    console.log(`Updated ${path.basename(filePath)} to v${version}`);
}

function createReleaseBlogPost(version, summaryNotes) {
    try {
        const blogDir = path.join(rootDir, 'website', 'src', 'content', 'docs', 'blog');
        if (!fs.existsSync(blogDir)) {
            fs.mkdirSync(blogDir, { recursive: true });
        }

        const slugVersion = version.replace(/\./g, '-');
        const blogFilePath = path.join(blogDir, `v${slugVersion}.md`);

        const dateStr = new Date().toISOString().split('T')[0];

        const content = `---
title: "Biawak v${version} Release Notes 🦎"
description: "Catatan rilis resmi Biawak v${version} - ${summaryNotes || 'Pembaruan dan peningkatan fitur terbaru.'}"
---

## 🦎 Apa yang Baru di Biawak v${version}?

${summaryNotes ? `- 🚀 **Pembaruan Fitur**: ${summaryNotes}` : '- 🚀 **Pembaruan & Perbaikan**: Peningkatan performa dan pemeliharaan arsitektur.'}
- 🛡️ **Stabilitas & Keamanan**: Pembaruan dependensi dan optimasi runtime Bun + Hono.

---

### 🚀 Cara Upgrade Proyek Anda:

\`\`\`bash
# Menggunakan Bun
bun update create-biawak-app@latest

# Atau menggunakan NPM
npm install create-biawak-app@latest
\`\`\`
`;

        fs.writeFileSync(blogFilePath, content, 'utf-8');
        console.log(`📝 [Website Blog] Auto-generated release post: website/src/content/docs/blog/v${slugVersion}.md`);
    } catch (e) {
        console.log('⚠️  Gagal membuat berkas blog rilis otomatis:', e.message);
    }
}

async function main() {
    try {
        // 0. Quick Git Update Check
        const quickGit = await question('\n⚡ Apakah ini hanya Quick Git Update (tanpa release versi NPM baru)? (y/n): ');
        if (quickGit.toLowerCase() === 'y') {
            console.log('\n🤖 Auto-generating commit message...');
            const commitMsg = generateAutoCommitMessage();
            console.log(`📝 Commit Message: "${commitMsg}"`);

            try {
                execSync('git add .', { stdio: 'inherit' });
                execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
                execSync('git push origin HEAD', { stdio: 'inherit' });
                console.log('\n✅ Quick Git Update berhasil didorong ke Git!');
                process.exit(0);
            } catch (e) {
                console.error('\n❌ Error saat operasi Git:', e.message);
                process.exit(1);
            }
        }

        // 1. Check npm version
        console.log('\n🔍 Checking npm registry version...');
        const npmVersion = getNpmVersion();
        const baseVersion = npmVersion || currentVersion;
        const suggestedVersion = incrementPatch(baseVersion);

        console.log(`Latest npm version: ${npmVersion || 'Belum dipublikasikan (menggunakan lokal)'}`);
        console.log(`Current local version: v${currentVersion}`);

        const newVersionInput = await question(`Masukkan versi baru (default patch: ${suggestedVersion}): `);
        const newVersion = newVersionInput.trim() || suggestedVersion;

        if (!newVersion) {
            console.log('❌ Versi harus diisi!');
            process.exit(1);
        }

        // Update package.json
        console.log('\n📦 Updating package.json...');
        updatePackageJsonVersion(packageJsonPath, newVersion);

        // 2. Commit & Tag Git
        const pushGit = await question('\n🚀 1. Publish & push ke Git (Commit & Tag)? (y/n): ');
        if (pushGit.toLowerCase() === 'y') {
            const releaseTitle = await question('Masukkan rincian singkat perubahan (Opsional, cth: fix sqlite driver): ');
            
            // Auto-generate website blog release post
            createReleaseBlogPost(newVersion, releaseTitle);

            const commitMsg = releaseTitle ? `chore: release v${newVersion} - ${releaseTitle}` : `chore: release v${newVersion}`;

            try {
                execSync('git add .', { stdio: 'inherit' });
                execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
            } catch (e) {
                console.log('⚠️  Tidak ada perubahan lokal untuk di-commit.');
            }

            try {
                execSync(`git tag -d v${newVersion}`, { stdio: 'ignore' });
            } catch (e) {}

            execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
            execSync(`git push origin HEAD`, { stdio: 'inherit' });

            try {
                execSync(`git push origin v${newVersion}`, { stdio: 'inherit' });
            } catch (e) {
                console.log('⚠️  Gagal push tag biasa, mencoba force push tag...');
                execSync(`git push origin v${newVersion} --force`, { stdio: 'inherit' });
            }

            console.log('✅ Git commit & tag berhasil dipush!');
        } else {
            console.log('⏭️  Melewati langkah Git push.');
        }

        // 3. NPM Publish
        const publishNpm = await question('\n📦 2. Publish paket ke NPM Registry? (y/n): ');
        if (publishNpm.toLowerCase() === 'y') {
            const npmUser = getNpmUser();
            if (npmUser) {
                console.log(`👤 NPM login aktif sebagai: ${npmUser}`);
            } else {
                console.log('⚠️  Tidak mendeteksi user NPM. Pastikan sudah login dengan `npm login`.');
            }

            try {
                execSync('npm publish --access public', { stdio: 'inherit' });
                console.log(`\n🎉 Paket ${packageName}@${newVersion} berhasil dipublikasikan ke NPM!`);
            } catch (error) {
                const details = error.combinedOutput || error.message || '';

                if (isOtpError(details)) {
                    console.log('\n⚠️  NPM Publish membutuhkan kode OTP 2FA.');
                    const otp = await question('🔐 Masukkan kode OTP Authenticator Anda: ');
                    if (otp && otp.trim() !== '') {
                        execSync(`npm publish --access public --otp=${otp.trim()}`, { stdio: 'inherit' });
                        console.log(`\n🎉 Paket ${packageName}@${newVersion} berhasil dipublikasikan ke NPM!`);
                    } else {
                        console.log('❌ NPM publish dibatalkan karena OTP kosong.');
                        throw error;
                    }
                } else if (isPermissionError(details)) {
                    console.log(`\n❌ NPM Publish gagal. Pastikan versi v${newVersion} belum pernah dipublish sebelumnya.`);
                    if (npmUser) {
                        console.log(`ℹ️  User aktif: ${npmUser}`);
                    }
                    throw error;
                } else {
                    console.log('\n❌ NPM Publish gagal.');
                    if (details) console.log(details);
                    throw error;
                }
            }
        } else {
            console.log('⏭️  Melewati langkah NPM publish.');
        }

        console.log('\n✨ Process Release Selesai!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        rl.close();
    }
}

main();