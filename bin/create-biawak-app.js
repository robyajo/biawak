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
   🦎                     /\\___/\\ 
     __  _ _       _     (  o o  )  ${colors.green}B I A W A K  -  A P P${colors.cyan}
    / / (_) |_____| |_    (  =^= )  ${colors.yellow}High-Performance Hono + Bun RESTful API${colors.cyan}
   / _ \\| | / _ \\ \`  \\    (------)  ${colors.dim}"Kadal Kampung, Performa Metropolitan!"${colors.cyan}
  /_.__/|_|_\\___/_|_|_|  (___)___)
${colors.reset}
`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Lizard Crawling Animation Step Helper
async function runWithLizardAnimation(title, fn) {
  const lizardFrames = [
    "🦎 . . . . .",
    " . 🦎 . . . .",
    " . . 🦎 . . .",
    " . . . 🦎 . .",
    " . . . . 🦎 .",
    " . . . . . 🦎",
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

async function main() {
  console.clear();
  console.log(BIAWAK_ASCII);

  let targetDirArg = process.argv[2];
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
      delete pkgData.bin;
      fs.writeFileSync(pkgPath, JSON.stringify(pkgData, null, 2), "utf-8");
    }

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
