#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const type = process.argv[2];
const name = process.argv[3];
const cwd = process.cwd();

// Load .env from current working directory
dotenv.config({ path: path.join(cwd, ".env") });
const dbDriver = process.env.DB_DRIVER || "sqlite";

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

if (!type || !name) {
  console.log(`
${colors.cyan}${colors.bold}🦎 Biawak Code Generator CLI${colors.reset}

${colors.bold}Usage:${colors.reset}
  bun run make route <name>       ${colors.yellow}Create a new Hono API route (Alternative: bun run make:route <name>)${colors.reset}
  bun run make middleware <name>  ${colors.yellow}Create a new custom middleware (Alternative: bun run make:middleware <name>)${colors.reset}
  bun run make schema <name>      ${colors.yellow}Create a new DB schema for SQLite & MySQL (Alternative: bun run make:schema <name>)${colors.reset}

${colors.bold}Examples:${colors.reset}
  bun run make route product
  bun run make middleware rateLimit
  bun run make schema product
`);
  process.exit(1);
}

const formattedName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
const camelCaseName = name.charAt(0).toLowerCase() + name.slice(1);
const pascalCaseName = name.charAt(0).toUpperCase() + name.slice(1);

if (type === "route") {
  const routesDir = path.join(cwd, "src", "routes");
  if (!fs.existsSync(routesDir)) fs.mkdirSync(routesDir, { recursive: true });

  const filePath = path.join(routesDir, `${formattedName}.ts`);
  if (fs.existsSync(filePath)) {
    console.error(`${colors.red}❌ Error: Route file '${filePath}' already exists!${colors.reset}`);
    process.exit(1);
  }

  const routeContent = `import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import z from "zod";

const ${camelCaseName}Router = new Hono();

${camelCaseName}Router.get(
  "/",
  describeRoute({
    tags: ["${pascalCaseName}"],
    summary: "Get list of ${formattedName}s",
    description: "Returns list of ${formattedName} records",
    responses: {
      200: {
        description: "Success",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                success: z.boolean(),
                data: z.array(z.object({ id: z.string(), name: z.string() })),
              })
            ),
          },
        },
      },
    },
  }),
  (c) => {
    return c.json({
      success: true,
      data: [{ id: "1", name: "Sample ${pascalCaseName}" }],
    });
  }
);

export default ${camelCaseName}Router;
`;

  fs.writeFileSync(filePath, routeContent, "utf-8");
  console.log(`\n${colors.green}✨ Created Route:${colors.reset} ${colors.cyan}src/routes/${formattedName}.ts${colors.reset}`);
  console.log(`
${colors.bold}To mount this route in ${colors.yellow}src/routes/index.ts${colors.reset}:
  ${colors.dim}import ${camelCaseName}Router from "./${formattedName}.js";${colors.reset}
  ${colors.dim}apiRouter.route("/${formattedName}s", ${camelCaseName}Router);${colors.reset}
`);
} else if (type === "middleware") {
  const middlewareDir = path.join(cwd, "src", "middleware");
  if (!fs.existsSync(middlewareDir)) fs.mkdirSync(middlewareDir, { recursive: true });

  const filePath = path.join(middlewareDir, `${formattedName}.ts`);
  if (fs.existsSync(filePath)) {
    console.error(`${colors.red}❌ Error: Middleware file '${filePath}' already exists!${colors.reset}`);
    process.exit(1);
  }

  const middlewareContent = `import type { Context, Next } from "hono";

export async function ${camelCaseName}Middleware(c: Context, next: Next) {
  // 🦎 ${pascalCaseName} Middleware Logic
  console.log(\`[${pascalCaseName}] Executing middleware on \${c.req.method} \${c.req.path}\`);

  await next();
}
`;

  fs.writeFileSync(filePath, middlewareContent, "utf-8");
  console.log(`\n${colors.green}✨ Created Middleware:${colors.reset} ${colors.cyan}src/middleware/${formattedName}.ts${colors.reset}\n`);
} else if (type === "schema") {
  console.log(`\n${colors.dim}🦎 Active DB Driver from .env: ${colors.bold}${dbDriver.toUpperCase()}${colors.reset}`);

  const sqliteDir = path.join(cwd, "src", "db", "schema", "sqlite");
  const mysqlDir = path.join(cwd, "src", "db", "schema", "mysql");

  const hasSqliteFolder = fs.existsSync(sqliteDir);
  const hasMysqlFolder = fs.existsSync(mysqlDir);

  const shouldGenerateSqlite = hasSqliteFolder && dbDriver === "sqlite";
  const shouldGenerateMysql = hasMysqlFolder && dbDriver === "mysql";

  let createdSqlite = false;
  let createdMysql = false;

  console.log(`\n${colors.green}✨ Created Schemas:${colors.reset}`);

  if (shouldGenerateSqlite) {
    const sqlitePath = path.join(sqliteDir, `${formattedName}.ts`);
    const sqliteContent = `import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const ${camelCaseName} = sqliteTable("${formattedName}", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});
`;
    fs.writeFileSync(sqlitePath, sqliteContent, "utf-8");
    console.log(`  📄 SQLite: ${colors.cyan}src/db/schema/sqlite/${formattedName}.ts${colors.reset}`);
    createdSqlite = true;
  }

  if (shouldGenerateMysql) {
    const mysqlPath = path.join(mysqlDir, `${formattedName}.ts`);
    const mysqlContent = `import { mysqlTable, varchar, timestamp } from "drizzle-orm/mysql-core";

export const ${camelCaseName} = mysqlTable("${formattedName}", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
`;
    fs.writeFileSync(mysqlPath, mysqlContent, "utf-8");
    console.log(`  📄 MySQL:  ${colors.cyan}src/db/schema/mysql/${formattedName}.ts${colors.reset}`);
    createdMysql = true;
  }

  // Auto-append exports to index files
  let appendedSqlite = false;
  let appendedMysql = false;

  if (createdSqlite) {
    const sqliteIndexPath = path.join(sqliteDir, "index.ts");
    if (fs.existsSync(sqliteIndexPath)) {
      const content = fs.readFileSync(sqliteIndexPath, "utf-8");
      if (!content.includes(`./${formattedName}.js`)) {
        fs.appendFileSync(sqliteIndexPath, `export * from "./${formattedName}.js";\n`, "utf-8");
        appendedSqlite = true;
      }
    }
  }

  if (createdMysql) {
    const mysqlIndexPath = path.join(mysqlDir, "index.ts");
    if (fs.existsSync(mysqlIndexPath)) {
      const content = fs.readFileSync(mysqlIndexPath, "utf-8");
      if (!content.includes(`./${formattedName}.js`)) {
        fs.appendFileSync(mysqlIndexPath, `export * from "./${formattedName}.js";\n`, "utf-8");
        appendedMysql = true;
      }
    }
  }

  // Auto-append export to main index/wrapper
  const mainIndexPath = path.join(cwd, "src", "db", "schema", "index.ts");
  let appendedMain = false;

  if (fs.existsSync(mainIndexPath)) {
    const content = fs.readFileSync(mainIndexPath, "utf-8");
    if (content.includes("activeSchema")) {
      const targetString = `activeSchema.${camelCaseName}`;
      if (!content.includes(targetString)) {
        const line = `export const ${camelCaseName} = activeSchema.${camelCaseName};\n`;
        fs.appendFileSync(mainIndexPath, line, "utf-8");
        appendedMain = true;
      }
    }
  }

  if (appendedSqlite || appendedMysql || appendedMain) {
    console.log(`\n${colors.green}🔗 Auto-linked Schemas to Indexes:${colors.reset}`);
    if (appendedSqlite) console.log(`  🔗 ${colors.dim}Appended export to sqlite index (src/db/schema/sqlite/index.ts)${colors.reset}`);
    if (appendedMysql) console.log(`  🔗 ${colors.dim}Appended export to mysql index (src/db/schema/mysql/index.ts)${colors.reset}`);
    if (appendedMain) console.log(`  🔗 ${colors.dim}Appended export to dynamic schema wrapper (src/db/schema/index.ts)${colors.reset}`);
  }

  if (dbDriver === "mysql" && hasSqliteFolder) {
    console.log(`\n${colors.yellow}⚠️  Note: SQLite schema was not generated because DB_DRIVER is set to "mysql".${colors.reset}`);
    console.log(`  To avoid TypeScript compilation errors in ${colors.cyan}src/db/schema/index.ts${colors.reset}, you can:`);
    console.log(`  1. Delete the SQLite schema folder completely if you are migrating fully to MySQL.`);
    console.log(`  2. Or, change ${colors.cyan}src/db/schema/index.ts${colors.reset} to export directly:`);
    console.log(`     ${colors.bold}export * from "./mysql/index.js";${colors.reset}\n`);
  } else {
    console.log(`\n${colors.bold}Next Steps:${colors.reset}`);
    console.log(`  1. Run ${colors.yellow}bun run db:generate${colors.reset} to create migrations.`);
    console.log(`  2. Import the new schemas from ${colors.cyan}src/db/schema/index.js${colors.reset} in your route files.\n`);
  }
} else {
  console.error(`${colors.red}❌ Error: Unknown generator type '${type}'. Use 'route', 'middleware', or 'schema'.${colors.reset}`);
  process.exit(1);
}
