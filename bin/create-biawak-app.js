#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import readline from "node:readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateDir = path.resolve(__dirname, "..");

// ANSI Color Helpers
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m",
  red: "\x1b[31m",
  dim: "\x1b[2m",
};

const BIAWAK_ASCII = `
${colors.cyan}${colors.bold}
          __/\\_
        /   o o\\     ${colors.green}B I A W A K  -  A P P${colors.cyan}
        \\   \\_//     ${colors.yellow}High-Performance Hono + Bun RESTful API${colors.cyan}
      /\\_/     \\     ${colors.dim}"Kadal Kampung, Performa Metropolitan!"${colors.cyan}
     /          \\__
     \\_/\\_/\\_/____/
${colors.reset}
`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Lizard Crawling Animation Step Helper
async function runWithLizardAnimation(title, fn) {
  const lizardFrames = [
    "🦎  \\_/\\_/",
    "🦎  _/\\_/\\",
    "🦎  /\\_/\\_",
  ];

  let frameIdx = 0;
  const interval = setInterval(() => {
    process.stdout.write(`\r${colors.cyan}[${lizardFrames[frameIdx]}]${colors.reset} ${colors.bold}${title}${colors.reset}  `);
    frameIdx = (frameIdx + 1) % lizardFrames.length;
  }, 120);

  try {
    const result = await fn();
    clearInterval(interval);
    process.stdout.write(`\r${colors.green}[ 🦎 ✅ DONE ]${colors.reset} ${colors.bold}${title}${colors.reset}\n`);
    return result;
  } catch (error) {
    clearInterval(interval);
    process.stdout.write(`\r${colors.red}[ 🦎 ❌ ERROR ]${colors.reset} ${colors.bold}${title}${colors.reset}\n`);
    throw error;
  }
}

async function promptInput(question, defaultValue) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${colors.yellow}? ${colors.reset}${colors.bold}${question}${colors.reset} ${colors.dim}(${defaultValue})${colors.reset}: `, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

async function runUpgrade() {
  const cwd = process.cwd();
  const pkgPath = path.join(cwd, "package.json");

  if (!fs.existsSync(pkgPath)) {
    console.error(`${colors.red}❌ Error: package.json not found in current directory! Make sure you are in a Biawak project root.${colors.reset}`);
    process.exit(1);
  }

  console.log(`\n${colors.cyan}${colors.bold}🦎 Biawak Framework - Upgrade Assistant${colors.reset}`);
  
  // Read template package.json from framework distribution
  const templatePkgPath = path.resolve(__dirname, "../package.json");
  if (!fs.existsSync(templatePkgPath)) {
    console.error(`${colors.red}❌ Error: Framework template package.json not found!${colors.reset}`);
    process.exit(1);
  }

  const userPkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const templatePkg = JSON.parse(fs.readFileSync(templatePkgPath, "utf-8"));

  console.log(`\n🔄 Comparing dependencies...`);

  let updated = false;

  const syncDeps = (type) => {
    if (!templatePkg[type]) return;
    if (!userPkg[type]) userPkg[type] = {};

    for (const [dep, version] of Object.entries(templatePkg[type])) {
      if (userPkg[type][dep] !== version) {
        console.log(`  ➕ ${type === "dependencies" ? "Dep" : "DevDep"}: ${colors.yellow}${dep}${colors.reset} -> ${colors.green}${version}${colors.reset}`);
        userPkg[type][dep] = version;
        updated = true;
      }
    }
  };

  syncDeps("dependencies");
  syncDeps("devDependencies");

  // Get current version of the framework package
  const currentFrameworkVersion = templatePkg.version || "latest";
  if (!userPkg.devDependencies) userPkg.devDependencies = {};
  if (userPkg.devDependencies["create-biawak-app"] !== `^${currentFrameworkVersion}`) {
    console.log(`  ➕ DevDep: ${colors.yellow}create-biawak-app${colors.reset} -> ${colors.green}^${currentFrameworkVersion}${colors.reset}`);
    userPkg.devDependencies["create-biawak-app"] = `^${currentFrameworkVersion}`;
    updated = true;
  }

  // Cleanup scripts block in user's package.json
  if (userPkg.scripts) {
    if (userPkg.scripts.release) {
      console.log(`  ➖ Remove dev-only script: ${colors.red}release${colors.reset}`);
      delete userPkg.scripts.release;
      updated = true;
    }
    
    const makeCommandRewrites = {
      "make": "biawak-make",
      "make:route": "biawak-make route",
      "make:middleware": "biawak-make middleware",
      "make:schema": "biawak-make schema",
      "upgrade": "npx create-biawak-app upgrade"
    };

    for (const [key, val] of Object.entries(makeCommandRewrites)) {
      if (userPkg.scripts[key] !== val) {
        console.log(`  🔧 Rewrite script: ${colors.yellow}${key}${colors.reset} -> ${colors.green}${val}${colors.reset}`);
        userPkg.scripts[key] = val;
        updated = true;
      }
    }
  }

  if (updated) {
    fs.writeFileSync(pkgPath, JSON.stringify(userPkg, null, 2), "utf-8");
    console.log(`\n${colors.green}✔ Updated package.json successfully!${colors.reset}`);

    const packageManager = fs.existsSync(path.join(cwd, "bun.lockb")) || fs.existsSync(path.join(cwd, "bun.lock")) ? "bun" : "npm";
    
    await runWithLizardAnimation(`Re-installing packages with ${packageManager} install...`, async () => {
      const installCmd = packageManager === "bun" ? "bun install" : "npm install";
      execSync(installCmd, { cwd, stdio: "ignore" });
    });

    console.log(`\n${colors.green}${colors.bold}✨ Upgrade completed successfully! All dependencies are up-to-date. 🦎${colors.reset}\n`);
  } else {
    console.log(`\n${colors.green}✔ Your dependencies are already up-to-date with the latest framework version!${colors.reset}\n`);
  }
}

async function main() {
  console.clear();
  console.log(BIAWAK_ASCII);

  let targetDirArg = process.argv[2];
  if (targetDirArg === "upgrade") {
    await runUpgrade();
    return;
  }
  if (!targetDirArg) {
    targetDirArg = await promptInput("Target project directory name?", "my-biawak-app");
  }

  const targetDir = path.resolve(process.cwd(), targetDirArg);
  const projectName = path.basename(targetDir);

  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    console.error(`${colors.red}❌ Error: Directory '${targetDirArg}' already exists and is not empty!${colors.reset}`);
    process.exit(1);
  }

  console.log(`\n🚀 Creating a new Biawak project in ${colors.cyan}${targetDir}${colors.reset}\n`);

  // Step 1: Copy Template Files
  await runWithLizardAnimation("Crawling & copying project template files...", async () => {
    fs.mkdirSync(targetDir, { recursive: true });

    const ignoreList = [
      ".git",
      "node_modules",
      "dist",
      "sqlite.db",
      "sqlite.db-journal",
      ".env",
      "bin",
      "website",
      ".DS_Store",
      ".agents",
      "packages",
      "AGENTS.md",
      "bun.lock",
      "package-lock.json",
      "README.md",
    ];

    function copyDirRecursive(src, dest) {
      fs.mkdirSync(dest, { recursive: true });
      const entries = fs.readdirSync(src, { withFileTypes: true });

      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (srcPath === targetDir || srcPath.startsWith(targetDir + path.sep)) continue;
        if (ignoreList.includes(entry.name)) continue;

        if (entry.isDirectory()) {
          copyDirRecursive(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }

    copyDirRecursive(templateDir, targetDir);

    // Initialize .env from .env.example
    const envExamplePath = path.join(targetDir, ".env.example");
    const envPath = path.join(targetDir, ".env");
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
    }

    // Ensure database migration folders exist out of the box
    fs.mkdirSync(path.join(targetDir, "src", "db", "drizzle", "sqlite"), { recursive: true });
    fs.mkdirSync(path.join(targetDir, "src", "db", "drizzle", "mysql"), { recursive: true });

    // Clean up package.json for target project
    const pkgPath = path.join(targetDir, "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkgData = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      pkgData.name = projectName;
      pkgData.version = "0.1.0";

      // Get current version of the framework package
      const templatePkgPath = path.resolve(__dirname, "../package.json");
      const templatePkg = JSON.parse(fs.readFileSync(templatePkgPath, "utf-8"));
      const currentFrameworkVersion = templatePkg.version || "latest";

      // Remove developer-only fields & scripts
      delete pkgData.bin;
      if (pkgData.scripts) {
        delete pkgData.scripts.release; // Remove developer-only release script
        
        // Rewrite make scripts to use local bin mapping instead of raw path node bin/biawak-make.js
        pkgData.scripts.make = "biawak-make";
        pkgData.scripts["make:route"] = "biawak-make route";
        pkgData.scripts["make:middleware"] = "biawak-make middleware";
        pkgData.scripts["make:schema"] = "biawak-make schema";
        pkgData.scripts.upgrade = "npx create-biawak-app upgrade";
      }

      // Add create-biawak-app as a devDependency to link binaries locally!
      if (!pkgData.devDependencies) pkgData.devDependencies = {};
      pkgData.devDependencies["create-biawak-app"] = `^${currentFrameworkVersion}`;

      fs.writeFileSync(pkgPath, JSON.stringify(pkgData, null, 2), "utf-8");
    }

    // Generate custom starter README.md
    const readmeContent = `# ${projectName} 🦎\nHigh-Performance RESTful API ditenagai Hono v4 & Bun v1.3.\n\n## 🚀 Mulai Cepat\n\n1. Jalankan development server:\n\`\`\`bash\nbun run dev\n\`\`\`\n\n2. Akses portal developer di browser Anda:\n[http://localhost:8000/](http://localhost:8000/)\n\n## 🛠️ Generator CLI\nBiawak CLI mempermudah pembuatan file route, middleware, dan skema database secara instan:\n- \`bun run make route <name>\`\n- \`bun run make middleware <name>\`\n- \`bun run make schema <name>\`\n\n## 📖 Dokumentasi Lengkap\nKunjungi [Biawak Documentation](https://biawak-doc.vercel.app/) untuk panduan lebih lanjut.\n`;
    fs.writeFileSync(path.join(targetDir, "README.md"), readmeContent, "utf-8");

    await sleep(400);
  });

  // Step 2: Detect Package Manager & Install Dependencies
  const isBunAvailable = () => {
    try {
      execSync("bun --version", { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  };

  const packageManager = isBunAvailable() ? "bun" : "npm";

  await runWithLizardAnimation(`Scaling dependencies with ${packageManager} install...`, async () => {
    const installCmd = packageManager === "bun" ? "bun install" : "npm install";
    execSync(installCmd, { cwd: targetDir, stdio: "ignore" });
    await sleep(400);
  });

  // Step 3: Initialize SQLite Database & Push Schema
  await runWithLizardAnimation("Laying database eggs (Initial SQLite db:push)...", async () => {
    try {
      const pushCmd = packageManager === "bun" ? "bun run db:push" : "npx drizzle-kit push";
      execSync(pushCmd, { cwd: targetDir, stdio: "ignore" });
    } catch (e) {
      // Fallback push command
      try {
        execSync("npx drizzle-kit push", { cwd: targetDir, stdio: "ignore" });
      } catch {}
    }
    await sleep(400);
  });

  // Step 4: Seed Database (Default Admin & User accounts)
  await runWithLizardAnimation("Seeding default Admin & User accounts...", async () => {
    try {
      const seedCmd = packageManager === "bun" ? "bun run db:seed" : "npx tsx src/db/seed.ts";
      execSync(seedCmd, { cwd: targetDir, stdio: "ignore" });
    } catch (e) {
      try {
        execSync("bun run src/db/seed.ts", { cwd: targetDir, stdio: "ignore" });
      } catch {}
    }
    await sleep(400);
  });

  // Completion Screen
  console.log(`
${colors.green}${colors.bold}✨ 🦎 Biawak project created successfully! 🦎 ✨${colors.reset}

${colors.bold}Project Location:${colors.reset} ${colors.cyan}${targetDir}${colors.reset}
${colors.bold}Database:${colors.reset} ${colors.yellow}Zero-Config SQLite (sqlite.db)${colors.reset} ${colors.dim}(Set DB_DRIVER=mysql in .env to switch to MySQL anytime)${colors.reset}

${colors.bold}Get Started:${colors.reset}
  ${colors.cyan}cd ${targetDirArg}${colors.reset}
  ${colors.cyan}${packageManager === "bun" ? "bun run dev" : "npm run dev"}${colors.reset}

${colors.bold}Seeded Accounts:${colors.reset}
  👑 ${colors.bold}Admin:${colors.reset} admin@gmail.com  / Password123
  👤 ${colors.bold}User:${colors.reset}  user@gmail.com   / Password123

${colors.dim}Documentation & Swagger UI available at http://localhost:8000/${colors.reset}
`);
}

main().catch((err) => {
  console.error(`\n${colors.red}❌ Installation failed:${colors.reset}`, err.message || err);
  process.exit(1);
});
