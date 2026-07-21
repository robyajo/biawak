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
const websiteDir = path.join(rootDir, 'website');
const packageJsonPath = path.join(rootDir, 'package.json');
const websitePackageJsonPath = path.join(websiteDir, 'package.json');

// Read current version
const pkg = require(packageJsonPath);
const currentVersion = pkg.version;

console.log(`\n🚀 lapeeh Release Automation Script`);
console.log(`Current Version: ${currentVersion}\n`);

// Helper to get git changes
function getGitChanges() {
    try {
        // Try to find the last tag
        let lastTag = '';
        try {
            lastTag = execSync('git describe --tags --abbrev=0', { stdio: 'pipe' }).toString().trim();
        } catch (e) {
            // No tags found, maybe fetch all commits
            lastTag = '';
        }

        const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';
        const logs = execSync(`git log ${range} --pretty=format:"%s"`, { stdio: 'pipe' }).toString().trim();

        if (!logs) return { raw: [], categorized: {} };

        const raw = logs.split('\n').map(l => l.trim()).filter(l => l);

        const categorized = {
            feat: [],
            fix: [],
            docs: [],
            perf: [],
            refactor: [],
            chore: [],
            other: []
        };

        raw.forEach(msg => {
            // Simple conventional commit parsing
            const lower = msg.toLowerCase();
            if (lower.startsWith('feat') || lower.startsWith('add') || lower.startsWith('new')) categorized.feat.push(msg);
            else if (lower.startsWith('fix') || lower.startsWith('bug')) categorized.fix.push(msg);
            else if (lower.startsWith('docs')) categorized.docs.push(msg);
            else if (lower.startsWith('perf')) categorized.perf.push(msg);
            else if (lower.startsWith('refactor') || lower.startsWith('style')) categorized.refactor.push(msg);
            else if (lower.startsWith('chore') || lower.startsWith('test') || lower.startsWith('ci')) categorized.chore.push(msg);
            else if (!msg.startsWith('Merge') && !msg.includes('release v') && !msg.includes('Update version')) categorized.other.push(msg);
        });

        return { raw, categorized };
    } catch (e) {
        return { raw: [], categorized: {} };
    }
}

// Helper to get npm version
function getNpmVersion() {
    try {
        return getCommandOutput('npm view lapeeh version');
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
    if (parts.length !== 3 || parts.some(isNaN)) return version; // Fallback
    parts[2]++;
    return parts.join('.');
}

// Helper to generate auto commit message
function generateAutoCommitMessage() {
    try {
        const status = execSync('git status --porcelain', { stdio: 'pipe' }).toString().trim();
        if (!status) return 'chore: no changes detected';

        const files = status.split('\n').map(line => line.substring(3).trim());

        const hasDocs = files.some(f => f.startsWith('website/') || f.startsWith('doc/') || f.endsWith('.md'));
        const hasScripts = files.some(f => f.startsWith('scripts/'));
        const hasPackage = files.some(f => f.includes('package.json'));
        const hasSrc = files.some(f => !f.startsWith('website/') && !f.startsWith('doc/') && !f.startsWith('scripts/') && !f.includes('package.json') && !f.startsWith('.'));

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

// Helper to parse changelog entry with structure
function parseChangelogEntry(filePath, version) {
    try {
        if (!fs.existsSync(filePath)) return null;
        const content = fs.readFileSync(filePath, 'utf8');

        // 1. Find the header line to extract Title
        // Regex matches: ## [Date] - Day, Date - Title (vVersion)
        const headerRegex = new RegExp(`## \\[.*?\\] - .*? - (.*?) \\(v${version}\\)`, 'i');
        const headerMatch = content.match(headerRegex);
        const title = headerMatch ? headerMatch[1].trim() : null;

        // 2. Extract the body
        const bodyRegex = new RegExp(`## \\[.*?\\] - .*?v${version}.*?([\\s\\S]*?)(?=\\n## \\[|$)`, 'i');
        const bodyMatch = content.match(bodyRegex);

        if (!bodyMatch) return null;

        let rawBody = bodyMatch[1].trim();

        // 3. Extract Intro (text before first ###)
        let intro = '';
        let features = rawBody;

        const firstHeaderIndex = rawBody.indexOf('###');
        if (firstHeaderIndex > 0) {
            intro = rawBody.substring(0, firstHeaderIndex).trim();
            features = rawBody.substring(firstHeaderIndex).trim();
        } else if (firstHeaderIndex === -1 && !rawBody.startsWith('-') && !rawBody.startsWith('*')) {
            // If no subheaders and doesn't start with list, treat as intro
            intro = rawBody;
            features = '';
        }

        return {
            title,
            intro,
            features
        };
    } catch (e) {
        return null;
    }
}

async function main() {
    try {
        // 0. Quick Git Update Check
        const quickGit = await question('\n⚡ Apakah ini hanya Quick Git Update (tanpa rilis versi)? (y/n): ');
        if (quickGit.toLowerCase() === 'y') {
            console.log('\n🤖 Auto-generating commit message...');
            const commitMsg = generateAutoCommitMessage();
            console.log(`📝 Commit Message: "${commitMsg}"`);

            try {
                console.log('🔄 Syncing documentation (just in case)...');
                try {
                    execSync('node scripts/sync-docs.js', { cwd: websiteDir, stdio: 'inherit' });
                } catch (e) {
                    console.log('⚠️ Warning: Doc sync failed, continuing...');
                }

                execSync('git add .', { stdio: 'inherit' });
                execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
                execSync('git push origin HEAD', { stdio: 'inherit' });
                console.log('✅ Quick Git Update selesai!');
                process.exit(0);
            } catch (e) {
                console.error('❌ Error during git operations:', e.message);
                process.exit(1);
            }
        }

        // 1. Check versions and ask for new one
        console.log('🔍 Checking npm version...');
        const npmVersion = getNpmVersion();
        const baseVersion = npmVersion || currentVersion;
        const suggestedVersion = incrementPatch(baseVersion);

        console.log(`Latest npm version: ${npmVersion || 'Not found (using local)'}`);
        console.log(`Current local version: ${currentVersion}`);

        const newVersionInput = await question(`Enter new version (default: ${suggestedVersion}): `);
        const newVersion = newVersionInput.trim() || suggestedVersion;

        if (!newVersion) {
            console.log('❌ Version is required');
            process.exit(1);
        }

        // Always update package.json locally first
        console.log('\n📦 Updating package.json files...');
        updatePackageJson(packageJsonPath, newVersion);
        updatePackageJson(websitePackageJsonPath, newVersion);

        // 2. Auto-generate Blog
        console.log('\n📝 Auto-generating blog posts...');
        const createBlog = 'y';
        let blogTitleEN = '';

        if (createBlog.toLowerCase() === 'y') {

            const useAuto = 'y';

            let titleID, descriptionID, introID, featureListID;
            let titleEN, descriptionEN, introEN, featureListEN;

            if (useAuto.toLowerCase() === 'y') {
                console.log('\n🤖 Auto-detecting changes from Git & Changelog...');
                const { raw, categorized } = getGitChanges();

                // Try to read from CHANGELOG.md first
                const parsedID = parseChangelogEntry(path.join(rootDir, 'doc/id/CHANGELOG.md'), newVersion);
                const parsedEN = parseChangelogEntry(path.join(rootDir, 'doc/en/CHANGELOG.md'), newVersion);

                // Helper to generate list from categories
                const generateFeatureList = (lang) => {
                    let sections = [];
                    const isId = lang === 'id';

                    if (categorized && categorized.feat && categorized.feat.length > 0) {
                        sections.push(isId ? '### ✨ Fitur Baru' : '### ✨ New Features');
                        categorized.feat.forEach(m => sections.push(`* ${m}`));
                    }
                    if (categorized && categorized.fix && categorized.fix.length > 0) {
                        sections.push(isId ? '### 🐛 Perbaikan Bug' : '### 🐛 Bug Fixes');
                        categorized.fix.forEach(m => sections.push(`* ${m}`));
                    }
                    if (categorized && categorized.perf && categorized.perf.length > 0) {
                        sections.push(isId ? '### ⚡ Peningkatan Performa' : '### ⚡ Performance Improvements');
                        categorized.perf.forEach(m => sections.push(`* ${m}`));
                    }
                    if (categorized && categorized.refactor && categorized.refactor.length > 0) {
                        sections.push(isId ? '### ♻️ Refactoring' : '### ♻️ Refactoring');
                        categorized.refactor.forEach(m => sections.push(`* ${m}`));
                    }
                    if (categorized && categorized.docs && categorized.docs.length > 0) {
                        sections.push(isId ? '### 📚 Dokumentasi' : '### 📚 Documentation');
                        categorized.docs.forEach(m => sections.push(`* ${m}`));
                    }
                    if (categorized && categorized.chore && categorized.chore.length > 0) {
                        sections.push(isId ? '### 🔧 Tugas & Pemeliharaan' : '### 🔧 Tasks & Chores');
                        categorized.chore.forEach(m => sections.push(`* ${m}`));
                    }
                    if (categorized && categorized.other && categorized.other.length > 0) {
                        sections.push(isId ? '### � Lainnya' : '### � Others');
                        categorized.other.forEach(m => sections.push(`* ${m}`));
                    }

                    // Fallback
                    if (sections.length === 0) {
                        if (raw && raw.length > 0) {
                            sections.push(isId ? '### 📋 Daftar Perubahan' : '### 📋 Changelog');
                            raw.forEach(m => sections.push(`* ${m}`));
                        } else {
                            return isId ? '* Pemeliharaan rutin dan pembaruan dependensi.' : '* Routine maintenance and dependency updates.';
                        }
                    }

                    return sections.join('\n\n');
                };

                if (parsedID) {
                    console.log('✅ Found entry in doc/id/CHANGELOG.md');
                    titleID = parsedID.title || `Update Terbaru v${newVersion}`;
                    introID = parsedID.intro || `Kami dengan bangga mengumumkan rilis **lapeeh v${newVersion}**. Update ini menghadirkan **${parsedID.title || 'berbagai fitur baru'}** untuk meningkatkan pengalaman pengembangan Anda.`;
                    descriptionID = parsedID.intro ? parsedID.intro.split('\n')[0] : `Rilis versi ${newVersion} hadir dengan berbagai pembaruan dan perbaikan.`;
                    featureListID = parsedID.features;
                } else {
                    console.log('⚠️ No entry in doc/id/CHANGELOG.md, using git logs...');

                    if (categorized && categorized.feat && categorized.feat.length > 0) {
                        titleID = 'Fitur Baru & Peningkatan';
                    } else if (categorized && categorized.fix && categorized.fix.length > 0) {
                        titleID = 'Perbaikan Bug & Peningkatan Stabilitas';
                    } else {
                        titleID = 'Rilis Pemeliharaan & Update Rutin';
                    }

                    descriptionID = (categorized && categorized.feat && categorized.feat.length > 0)
                        ? `Menghadirkan: ${categorized.feat.slice(0, 2).map(f => f.replace(/^feat: ?/i, '')).join(', ')}`
                        : 'Pembaruan rutin dan perbaikan bug.';
                    introID = `Kami dengan bangga mengumumkan rilis **lapeeh v${newVersion}**.`;
                    featureListID = generateFeatureList('id');
                }

                if (parsedEN) {
                    console.log('✅ Found entry in doc/en/CHANGELOG.md');
                    titleEN = parsedEN.title || `Latest Update v${newVersion}`;
                    introEN = parsedEN.intro || `We are proud to announce the release of **lapeeh v${newVersion}**. This update brings **${parsedEN.title || 'various new features'}** to enhance your development experience.`;
                    descriptionEN = parsedEN.intro ? parsedEN.intro.split('\n')[0] : `Release version ${newVersion} comes with various updates and improvements.`;
                    featureListEN = parsedEN.features;
                } else {
                    console.log('⚠️ No entry in doc/en/CHANGELOG.md, using git logs...');

                    if (categorized && categorized.feat && categorized.feat.length > 0) {
                        titleEN = 'New Features & Improvements';
                    } else if (categorized && categorized.fix && categorized.fix.length > 0) {
                        titleEN = 'Bug Fixes & Stability Improvements';
                    } else {
                        titleEN = 'Maintenance Release & Routine Updates';
                    }

                    descriptionEN = (categorized && categorized.feat && categorized.feat.length > 0)
                        ? `Featuring: ${categorized.feat.slice(0, 2).map(f => f.replace(/^feat: ?/i, '')).join(', ')}`
                        : 'Routine maintenance and bug fixes.';
                    introEN = `We are proud to announce the release of **lapeeh v${newVersion}**.`;
                    featureListEN = generateFeatureList('en');
                }
            } else {
                console.log('\n📝 Manual Blog Entry');
                console.log('Silakan masukkan detail blog secara manual.');

                // ID Inputs
                titleID = await question('Judul Blog (ID): ');
                descriptionID = await question('Deskripsi Singkat (ID): ');
                const contentID = await question('Konten Utama/Fitur (ID) - Gunakan format Markdown jika perlu: ');
                introID = `Rilis versi ${newVersion} telah hadir.`; // Fallback for manual
                featureListID = contentID;

                console.log('\n--- English Version ---');

                // EN Inputs
                titleEN = await question('Blog Title (EN): ');
                descriptionEN = await question('Short Description (EN): ');
                const contentEN = await question('Main Content/Features (EN): ');
                introEN = `Release version ${newVersion} is here.`; // Fallback for manual
                featureListEN = contentEN;

                // Set defaults if empty
                if (!titleID) titleID = `Update v${newVersion}`;
                if (!descriptionID) descriptionID = `Pembaruan versi ${newVersion}`;
                if (!featureListID) featureListID = '* Pembaruan rutin';

                if (!titleEN) titleEN = `Update v${newVersion}`;
                if (!descriptionEN) descriptionEN = `Update version ${newVersion}`;
                if (!featureListEN) featureListEN = '* Routine updates';
            }

            blogTitleEN = titleEN; // Save for commit message

            console.log('📝 Generating blog posts...');
            const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const dateString = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            const dateStringEn = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

            const blogFileName = `release-v${newVersion}.md`;

            // Indonesian Blog Content
            const idContent = `---
title: "Rilis lapeeh v${newVersion}: ${titleID}"
date: ${date}
author: Tim lapeeh
description: "${descriptionID.replace(/"/g, '\\"')}"
---

# Rilis lapeeh v${newVersion}: ${titleID}

Ditulis pada **${dateString}** oleh **Tim lapeeh**

${introID}

## Apa yang Baru? 🚀

${featureListID}

## Cara Upgrade

Bagi pengguna baru, cukup jalankan:

\`\`\`bash
npx lapeeh init my-project
\`\`\`

Bagi pengguna lama yang ingin update ke versi terbaru:

\`\`\`bash
npm install lapeeh@latest
\`\`\`

Terima kasih telah menjadi bagian dari perjalanan lapeeh Framework!
`;

            // English Blog Content
            const enContent = `---
title: "Release lapeeh v${newVersion}: ${titleEN}"
date: ${date}
author: lapeeh Team
description: "${descriptionEN.replace(/"/g, '\\"')}"
---

# Release lapeeh v${newVersion}: ${titleEN}

Written on **${dateStringEn}** by **lapeeh Team**

${introEN}

## What's New? 🚀

${featureListEN}

## How to Upgrade

For new users, simply run:

\`\`\`bash
npx lapeeh init my-project
\`\`\`

For existing users who want to update to the latest version:

\`\`\`bash
npm install lapeeh@latest
\`\`\`

Thank you for being part of the lapeeh Framework journey!
`;

            fs.writeFileSync(path.join(websiteDir, 'blog', blogFileName), idContent);
            fs.writeFileSync(path.join(websiteDir, 'en/blog', blogFileName), enContent);

            console.log('📑 Updating blog indexes...');
            updateBlogIndex(path.join(websiteDir, 'blog/index.md'), newVersion, titleID, dateString, descriptionID, blogFileName, 'id');
            updateBlogIndex(path.join(websiteDir, 'en/blog/index.md'), newVersion, titleEN, dateStringEn, descriptionEN, blogFileName, 'en');
        } else {
            console.log('⏭️  Skipping blog generation.');
        }

        // 3. Question: Documentation
        const updateDocs = await question('\n2. Apa Anda ingin update dokumentasi? (y/n): ');
        if (updateDocs.toLowerCase() === 'y') {
            console.log('\n📚 Documentation Update:');
            console.log('Sistem akan menjalankan sinkronisasi otomatis:');
            console.log('  - Menyalin file dari `doc/id` ke `website/docs`');
            console.log('  - Menyalin file dari `doc/en` ke `website/en/docs`');
            console.log('  - Mengubah nama file menjadi format URL-friendly (contoh: GETTING_STARTED.md -> getting-started.md)');

            console.log('\n⚠️  Manual Action Required (If applicable):');
            console.log('Jika ada package/method baru, silakan update file berikut secara manual sekarang:');
            console.log('  - website/docs/packages.md');
            console.log('  - website/docs/api.md');

            await question('Tekan Enter untuk menjalankan sinkronisasi otomatis (setelah Anda selesai update manual)...');

            console.log('🔄 Syncing documentation...');
            execSync('node scripts/sync-docs.js', { cwd: websiteDir, stdio: 'inherit' });
        } else {
            console.log('⏭️  Skipping documentation sync.');
        }

        // 4. Question: Git
        const pushGit = await question('\n3. Apa ingin publish ke Git? (y/n): ');
        if (pushGit.toLowerCase() === 'y') {
            const commitMsg = blogTitleEN
                ? `chore: release v${newVersion} - ${blogTitleEN}`
                : `chore: release v${newVersion}`;

            try {
                execSync('git add .', { stdio: 'inherit' });
                execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
            } catch (e) {
                console.log('⚠️  No changes to commit or commit failed. Continuing...');
            }

            try {
                // Delete tag if it exists locally to avoid "already exists" error
                execSync(`git tag -d v${newVersion}`, { stdio: 'ignore' });
            } catch (e) {
                // Ignore if tag doesn't exist
            }

            execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
            execSync(`git push origin HEAD`, { stdio: 'inherit' });

            try {
                execSync(`git push origin v${newVersion}`, { stdio: 'inherit' });
            } catch (e) {
                console.log('⚠️  Tag push failed. Trying force push (updating existing tag)...');
                execSync(`git push origin v${newVersion} --force`, { stdio: 'inherit' });
            }

            console.log('✅ Git push & tag complete');
        } else {
            console.log('⏭️  Skipping Git push.');
        }

        // 5. Question: NPM
        const publishNpm = await question('\n4. Apa ingin publish ke NPM? (y/n): ');
        if (publishNpm.toLowerCase() === 'y') {
            const npmUser = getNpmUser();
            if (npmUser) {
                console.log(`👤 NPM login terdeteksi sebagai: ${npmUser}`);
            } else {
                console.log('⚠️  Tidak bisa mendeteksi user NPM. Pastikan sudah login dengan `npm login`.');
            }

            try {
                execSync('npm publish', { stdio: 'inherit' });
                console.log('✅ NPM publish complete');
            } catch (error) {
                const details = error.combinedOutput || error.message || '';

                if (isOtpError(details)) {
                    console.log('\n⚠️  NPM Publish gagal karena membutuhkan OTP 2FA.');
                    const otp = await question('🔐 Masukkan kode OTP (Authenticator App) Anda: ');
                    if (otp && otp.trim() !== '') {
                        execSync(`npm publish --otp=${otp.trim()}`, { stdio: 'inherit' });
                        console.log('✅ NPM publish complete');
                    } else {
                        console.log('❌ NPM publish dibatalkan karena OTP kosong.');
                        throw error;
                    }
                } else if (isPermissionError(details)) {
                    console.log('\n❌ NPM Publish gagal karena akun ini tidak punya akses publish ke paket `lapeeh`, atau versinya sudah bermasalah di registry.');
                    if (npmUser) {
                        console.log(`ℹ️  User aktif: ${npmUser}`);
                    }
                    console.log('ℹ️  Cek dengan: `npm whoami`, `npm owner ls lapeeh`, atau gunakan package name/scope yang memang Anda miliki.');
                    throw error;
                } else {
                    console.log('\n❌ NPM Publish gagal karena alasan lain, bukan OTP.');
                    if (details) {
                        console.log(details);
                    }
                    throw error;
                }
            }
        } else {
            console.log('⏭️  Skipping NPM publish.');
        }

        console.log('\n✨ Proses selesai!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        rl.close();
    }
}

function updatePackageJson(filePath, version) {
    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    json.version = version;
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n');
    console.log(`Updated ${path.basename(filePath)} to ${version}`);
}

function updateBlogIndex(filePath, version, title, date, description, fileName, lang) {
    let content = fs.readFileSync(filePath, 'utf8');

    const readMore = lang === 'id' ? 'Baca selengkapnya' : 'Read more';
    const releaseTag = lang === 'id' ? 'Rilis' : 'Release';

    // Construct new entry
    const newEntry = `## 🚀 [${releaseTag} v${version}: ${title}](./${fileName.replace('.md', '')})

_${date}_ • 👤 lapeeh Team • 🏷️ _Release_

${description} [${readMore} →](./${fileName.replace('.md', '')})

---

`;

    const separator = '---';
    const parts = content.split(separator);

    if (parts.length >= 2) {
        parts.splice(1, 0, '\n\n' + newEntry.trim() + '\n\n');
        content = parts.join(separator);
    } else {
        content = content + '\n\n' + newEntry;
    }

    fs.writeFileSync(filePath, content);
}

main();