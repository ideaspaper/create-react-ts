#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const projectName = process.argv[2];

if (!projectName) {
  console.error("Please specify the project name:");
  console.error("  npx create-react-ts <project-name>");
  process.exit(1);
}

const currentDir = process.cwd();
const projectDir = path.join(currentDir, projectName);

if (fs.existsSync(projectDir)) {
  console.error(`The directory ${projectName} already exists.`);
  process.exit(1);
}

const TEMPLATE_REPO = "https://github.com/ideaspaper/create-react-ts.git";

console.log(`Creating a new React app in ${projectDir}.`);

try {
  console.log(`Cloning template from ${TEMPLATE_REPO}...`);
  execSync(`git clone --depth 1 ${TEMPLATE_REPO} ${projectDir}`, {
    stdio: "inherit",
  });
} catch (error) {
  console.error("Failed to clone the template repository.");
  process.exit(1);
}

process.chdir(projectDir);

const templateSubDir = path.join(projectDir, "template");
if (fs.existsSync(templateSubDir)) {
  const moveRecursive = (src, dest) => {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath);
        }
        moveRecursive(srcPath, destPath);
      } else {
        if (entry.name === "_gitignore") {
          fs.renameSync(srcPath, path.join(dest, ".gitignore"));
        } else {
          fs.renameSync(srcPath, destPath);
        }
      }
    }
  };

  console.log("Setting up template structure...");
  moveRecursive(templateSubDir, projectDir);

  fs.rmSync(templateSubDir, { recursive: true, force: true });
}

fs.rmSync(path.join(projectDir, ".git"), { recursive: true, force: true });

const cleanupFiles = [
  "index.js",
  "package-lock.json",
  "README.md",
  ".gitignore",
];
cleanupFiles.forEach((file) => {
  if (file === "index.js") {
    const filePath = path.join(projectDir, file);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});

const packageJsonPath = path.join(projectDir, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

packageJson.name = projectName;
packageJson.version = "0.0.0";

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log(`
Success! Created ${projectName} at ${projectDir}
Inside that directory, you can run several commands:

  npm run dev
    Starts the development server.

  npm run build
    Bundles the app into static files for production.

  npm run test
    Starts the test runner.

  npm run lint
    Lints the code.

We suggest that you begin by typing:

  cd ${projectName}
  npm install
  npm run dev
`);
