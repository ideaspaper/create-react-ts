#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const projectName = process.argv[2];

if (!projectName) {
  console.error("Please specify the project name:");
  console.error("  npx create-react-ts <project-name>");
  process.exit(1);
}

const currentDir = process.cwd();
const projectDir = path.resolve(currentDir, projectName);
const templateDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "template");

const packageManagerUserAgent = process.env.npm_config_user_agent ?? "";

const detectPackageManager = () => {
  if (packageManagerUserAgent.startsWith("pnpm")) {
    return "pnpm";
  }

  if (packageManagerUserAgent.startsWith("yarn")) {
    return "yarn";
  }

  return "npm";
};

const normalizePackageName = value =>
  value
    .trim()
    .toLowerCase()
    .replace(/^[._]+/, "")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-");

if (fs.existsSync(projectDir)) {
  console.error(`The directory ${projectName} already exists.`);
  process.exit(1);
}

console.log(`Creating a new React app in ${projectDir}.`);

try {
  if (!fs.existsSync(templateDir)) {
    throw new Error("Template files are missing from this package.");
  }

  fs.mkdirSync(projectDir, { recursive: true });
  fs.cpSync(templateDir, projectDir, { recursive: true });
} catch (error) {
  fs.rmSync(projectDir, { recursive: true, force: true });
  console.error(
    error instanceof Error
      ? `Failed to create the project: ${error.message}`
      : "Failed to create the project.",
  );
  process.exit(1);
}

const gitignorePath = path.join(projectDir, "_gitignore");
if (fs.existsSync(gitignorePath)) {
  fs.renameSync(gitignorePath, path.join(projectDir, ".gitignore"));
}

const packageJsonPath = path.join(projectDir, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const normalizedProjectName = normalizePackageName(path.basename(projectDir));

packageJson.name = normalizedProjectName || "my-app";
packageJson.version = "0.0.0";

fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

const packageManager = detectPackageManager();
const installCommand = packageManager === "yarn" ? "yarn" : `${packageManager} install`;
const devCommand = packageManager === "yarn" ? "yarn dev" : `${packageManager} run dev`;
const buildCommand = packageManager === "yarn" ? "yarn build" : `${packageManager} run build`;
const testCommand = packageManager === "yarn" ? "yarn test" : `${packageManager} run test`;
const lintCommand = packageManager === "yarn" ? "yarn lint" : `${packageManager} run lint`;
const checkCommand = packageManager === "yarn" ? "yarn check" : `${packageManager} run check`;

if (normalizedProjectName !== path.basename(projectDir)) {
  console.log(`Using npm package name \"${normalizedProjectName}\".`);
}

console.log(`
Success! Created ${projectName} at ${projectDir}
Inside that directory, you can run several commands:

  ${devCommand}
    Starts the development server.

  ${buildCommand}
    Bundles the app into static files for production.

  ${testCommand}
    Runs the test suite.

  ${lintCommand}
    Lints the code.

  ${checkCommand}
    Runs lint, tests, and build together.

We suggest that you begin by typing:

  cd ${projectName}
  ${installCommand}
  ${devCommand}
`);
