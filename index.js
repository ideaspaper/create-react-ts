#!/usr/bin/env node

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const cliPackage = JSON.parse(
  fs.readFileSync(new URL("./package.json", import.meta.url), "utf8"),
);

const templateDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "template",
);

const PRESETS = {
  minimal: {
    hooks: "none",
    commitlint: false,
    coverage: false,
    vitestUi: false,
    e2e: "none",
    git: false,
    install: false,
  },
  standard: {
    hooks: "none",
    commitlint: false,
    coverage: true,
    vitestUi: false,
    e2e: "none",
    git: false,
    install: false,
  },
  team: {
    hooks: "simple-git-hooks",
    commitlint: true,
    coverage: true,
    vitestUi: false,
    e2e: "playwright",
    git: true,
    install: false,
  },
};

const SCRIPT_ORDER = [
  "dev",
  "build",
  "typecheck",
  "lint",
  "lint:fix",
  "format",
  "format:check",
  "preview",
  "test",
  "test:coverage",
  "test:ui",
  "test:watch",
  "test:e2e:install",
  "test:e2e",
  "test:e2e:ui",
  "check",
  "prepare",
];

const packageManagerUserAgent = process.env.npm_config_user_agent ?? "";

const HELP_TEXT = `Usage:
  create-react-ts <project-name> [options]

Options:
  --preset <minimal|standard|team>
      Starter preset. Default: standard

  --pm <npm|pnpm|yarn>
      Package manager used for generated docs and the optional install step

  --hooks <none|simple-git-hooks|husky>
      Git hook strategy. Default comes from the selected preset

  --commitlint / --no-commitlint
      Enable or disable Conventional Commit checks

  --coverage / --no-coverage
      Enable or disable Vitest coverage support

  --vitest-ui / --no-vitest-ui
      Enable or disable Vitest UI

  --e2e <none|playwright>
      Add end-to-end testing support

  --playwright
      Shortcut for --e2e playwright

  --install
      Install dependencies after scaffolding

  --git / --no-git
      Initialize a git repository. Auto-enabled when hooks are selected

  -h, --help
      Show this help message

  -v, --version
      Show CLI version
`;

function exitWithError(message) {
  console.error(message);
  process.exit(1);
}

function printHelp() {
  console.log(HELP_TEXT);
}

function detectPackageManager() {
  if (packageManagerUserAgent.startsWith("pnpm")) {
    return "pnpm";
  }

  if (packageManagerUserAgent.startsWith("yarn")) {
    return "yarn";
  }

  return "npm";
}

function normalizePackageName(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^[._]+/, "")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-");
}

function readOptionValue(args, index, optionName) {
  const nextValue = args[index + 1];

  if (!nextValue || nextValue.startsWith("-")) {
    exitWithError(`Missing value for ${optionName}.`);
  }

  return nextValue;
}

function parseArgs(argv) {
  const flags = {};
  let projectName;

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (!current.startsWith("-")) {
      if (projectName) {
        exitWithError("Please provide only one project name.");
      }

      projectName = current;
      continue;
    }

    const [optionName, inlineValue] = current.split(/=(.*)/s, 2);
    const optionValue = inlineValue ?? null;

    switch (optionName) {
      case "-h":
      case "--help":
        printHelp();
        process.exit(0);
        break;
      case "-v":
      case "--version":
        console.log(cliPackage.version);
        process.exit(0);
        break;
      case "--preset":
        flags.preset = optionValue ?? readOptionValue(argv, index, optionName);
        if (optionValue === null) {
          index += 1;
        }
        break;
      case "--pm":
        flags.packageManager =
          optionValue ?? readOptionValue(argv, index, optionName);
        if (optionValue === null) {
          index += 1;
        }
        break;
      case "--hooks":
        flags.hooks = optionValue ?? readOptionValue(argv, index, optionName);
        if (optionValue === null) {
          index += 1;
        }
        break;
      case "--e2e":
        flags.e2e = optionValue ?? readOptionValue(argv, index, optionName);
        if (optionValue === null) {
          index += 1;
        }
        break;
      case "--playwright":
        flags.e2e = "playwright";
        break;
      case "--commitlint":
        flags.commitlint = true;
        break;
      case "--no-commitlint":
        flags.commitlint = false;
        break;
      case "--coverage":
        flags.coverage = true;
        break;
      case "--no-coverage":
        flags.coverage = false;
        break;
      case "--vitest-ui":
        flags.vitestUi = true;
        break;
      case "--no-vitest-ui":
        flags.vitestUi = false;
        break;
      case "--install":
        flags.install = true;
        break;
      case "--no-install":
        flags.install = false;
        break;
      case "--git":
        flags.git = true;
        break;
      case "--no-git":
        flags.git = false;
        break;
      default:
        exitWithError(`Unknown option: ${current}`);
    }
  }

  return { flags, projectName };
}

function validateEnumOption(value, optionName, supportedValues) {
  if (!supportedValues.includes(value)) {
    exitWithError(
      `Invalid value for ${optionName}: ${value}. Expected one of: ${supportedValues.join(", ")}.`,
    );
  }
}

function resolveOptions(rawFlags) {
  const presetName = rawFlags.preset ?? "standard";

  validateEnumOption(presetName, "--preset", Object.keys(PRESETS));

  const options = {
    packageManager: rawFlags.packageManager ?? detectPackageManager(),
    ...PRESETS[presetName],
    ...Object.fromEntries(
      Object.entries(rawFlags).filter(
        ([key]) => key !== "packageManager" && key !== "preset",
      ),
    ),
    preset: presetName,
  };

  validateEnumOption(options.packageManager, "--pm", ["npm", "pnpm", "yarn"]);
  validateEnumOption(options.hooks, "--hooks", [
    "none",
    "simple-git-hooks",
    "husky",
  ]);
  validateEnumOption(options.e2e, "--e2e", ["none", "playwright"]);

  if (options.hooks !== "none" && rawFlags.git === undefined) {
    options.git = true;
  }

  if (options.hooks === "none" && options.commitlint) {
    exitWithError(
      "Commitlint requires git hooks. Choose --hooks husky or --hooks simple-git-hooks.",
    );
  }

  if (options.hooks !== "none" && options.git === false) {
    exitWithError(
      "Git hooks require a git repository. Remove --no-git or use --hooks none.",
    );
  }

  return options;
}

function sortObjectKeys(object) {
  return Object.fromEntries(
    Object.entries(object).sort(([leftKey], [rightKey]) =>
      leftKey.localeCompare(rightKey),
    ),
  );
}

function orderScripts(scripts) {
  const orderedScripts = {};

  for (const scriptName of SCRIPT_ORDER) {
    if (scripts[scriptName]) {
      orderedScripts[scriptName] = scripts[scriptName];
    }
  }

  for (const [scriptName, scriptCommand] of Object.entries(scripts)) {
    if (!(scriptName in orderedScripts)) {
      orderedScripts[scriptName] = scriptCommand;
    }
  }

  return orderedScripts;
}

function buildLintStagedConfig() {
  return {
    "**/*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "**/*.{css,html,json,md}": ["prettier --write"],
  };
}

function buildSimpleGitHooksConfig(includeCommitlint) {
  const hooks = {
    "pre-commit":
      "if [ -f pnpm-lock.yaml ]; then pnpm exec lint-staged; elif [ -f yarn.lock ]; then yarn lint-staged; else npx lint-staged; fi",
    "pre-push":
      "if [ -f pnpm-lock.yaml ]; then pnpm run test; elif [ -f yarn.lock ]; then yarn test; else npm run test; fi",
  };

  if (includeCommitlint) {
    hooks["commit-msg"] =
      'if [ -f pnpm-lock.yaml ]; then pnpm exec commitlint --edit "$1"; elif [ -f yarn.lock ]; then yarn commitlint --edit "$1"; else npx --no -- commitlint --edit "$1"; fi';
  }

  return hooks;
}

function buildPackageJson(basePackageJson, packageName, options) {
  const packageJson = structuredClone(basePackageJson);
  const scripts = { ...packageJson.scripts };
  const dependencies = { ...packageJson.dependencies };
  const devDependencies = { ...packageJson.devDependencies };

  packageJson.name = packageName || "my-app";
  packageJson.version = "0.0.0";
  packageJson.scripts = scripts;
  packageJson.dependencies = dependencies;
  packageJson.devDependencies = devDependencies;

  if (!options.coverage) {
    delete scripts["test:coverage"];
    delete devDependencies["@vitest/coverage-v8"];
  }

  if (options.vitestUi) {
    scripts["test:ui"] = "vitest --ui";
    devDependencies["@vitest/ui"] = "^4.1.7";
  } else {
    delete scripts["test:ui"];
    delete devDependencies["@vitest/ui"];
  }

  if (options.e2e === "playwright") {
    scripts["test:e2e:install"] = "playwright install";
    scripts["test:e2e"] = "playwright test";
    scripts["test:e2e:ui"] = "playwright test --ui";
    devDependencies["@playwright/test"] = "^1.60.0";
  } else {
    delete scripts["test:e2e:install"];
    delete scripts["test:e2e"];
    delete scripts["test:e2e:ui"];
    delete devDependencies["@playwright/test"];
  }

  if (options.hooks === "husky") {
    scripts.prepare = "husky";
    devDependencies.husky = "^9.1.7";
    devDependencies["lint-staged"] = "^16.4.0";
    delete devDependencies["simple-git-hooks"];
    packageJson["lint-staged"] = buildLintStagedConfig();
    delete packageJson["simple-git-hooks"];
  } else if (options.hooks === "simple-git-hooks") {
    scripts.prepare = "simple-git-hooks";
    devDependencies["simple-git-hooks"] = "^2.13.1";
    devDependencies["lint-staged"] = "^16.4.0";
    delete devDependencies.husky;
    packageJson["lint-staged"] = buildLintStagedConfig();
    packageJson["simple-git-hooks"] = buildSimpleGitHooksConfig(
      options.commitlint,
    );
  } else {
    delete scripts.prepare;
    delete devDependencies.husky;
    delete devDependencies["simple-git-hooks"];
    delete devDependencies["lint-staged"];
    delete packageJson["lint-staged"];
    delete packageJson["simple-git-hooks"];
  }

  if (options.commitlint) {
    devDependencies["@commitlint/cli"] = "^21.0.1";
    devDependencies["@commitlint/config-conventional"] = "^21.0.1";
  } else {
    delete devDependencies["@commitlint/cli"];
    delete devDependencies["@commitlint/config-conventional"];
  }

  packageJson.scripts = orderScripts(scripts);
  packageJson.dependencies = sortObjectKeys(dependencies);
  packageJson.devDependencies = sortObjectKeys(devDependencies);

  return {
    name: packageJson.name,
    private: packageJson.private,
    version: packageJson.version,
    type: packageJson.type,
    engines: packageJson.engines,
    scripts: packageJson.scripts,
    ...(packageJson["lint-staged"]
      ? { "lint-staged": packageJson["lint-staged"] }
      : {}),
    ...(packageJson["simple-git-hooks"]
      ? { "simple-git-hooks": packageJson["simple-git-hooks"] }
      : {}),
    dependencies: packageJson.dependencies,
    devDependencies: packageJson.devDependencies,
  };
}

function renderViteConfig(options) {
  const lines = [
    "import react from '@vitejs/plugin-react';",
    "import { defineConfig } from 'vitest/config';",
    "",
    "export default defineConfig({",
    "  plugins: [react()],",
    "  resolve: {",
    "    tsconfigPaths: true,",
    "  },",
    "  test: {",
    "    include: ['src/**/*.{test,spec}.{ts,tsx}'],",
    "    globals: true,",
    "    environment: 'jsdom',",
    "    setupFiles: './test-setup.ts',",
  ];

  if (options.coverage) {
    lines.push(
      "    coverage: {",
      "      provider: 'v8',",
      "      reporter: ['text', 'html', 'lcov'],",
      "      exclude: ['src/**/*.css', 'src/main.tsx', 'test-setup.ts'],",
      "    },",
    );
  }

  lines.push("  },", "});", "");

  return lines.join("\n");
}

function renderCommitlintConfig() {
  return "module.exports = { extends: ['@commitlint/config-conventional'] };\n";
}

function renderHuskyPreCommit() {
  return [
    "if [ -f pnpm-lock.yaml ]; then",
    "  pnpm exec lint-staged",
    "elif [ -f yarn.lock ]; then",
    "  yarn lint-staged",
    "else",
    "  npx lint-staged",
    "fi",
    "",
  ].join("\n");
}

function renderHuskyPrePush() {
  return [
    "if [ -f pnpm-lock.yaml ]; then",
    "  pnpm run test",
    "elif [ -f yarn.lock ]; then",
    "  yarn test",
    "else",
    "  npm run test",
    "fi",
    "",
  ].join("\n");
}

function renderHuskyCommitMessage() {
  return [
    "if [ -f pnpm-lock.yaml ]; then",
    '  pnpm exec commitlint --edit "$1"',
    "elif [ -f yarn.lock ]; then",
    '  yarn commitlint --edit "$1"',
    "else",
    '  npx --no -- commitlint --edit "$1"',
    "fi",
    "",
  ].join("\n");
}

function renderPlaywrightWebServerCommand(packageManager) {
  if (packageManager === "yarn") {
    return "yarn run dev --host 127.0.0.1 --port 4173";
  }

  return `${packageManager} run dev -- --host 127.0.0.1 --port 4173`;
}

function renderPlaywrightConfig(options) {
  const webServerCommand = renderPlaywrightWebServerCommand(
    options.packageManager,
  );

  return [
    "import { defineConfig, devices } from '@playwright/test';",
    "",
    "export default defineConfig({",
    "  testDir: './e2e',",
    "  fullyParallel: true,",
    "  retries: process.env.CI ? 2 : 0,",
    "  reporter: process.env.CI ? 'line' : 'html',",
    "  use: {",
    "    baseURL: 'http://127.0.0.1:4173',",
    "    trace: 'on-first-retry',",
    "  },",
    "  webServer: {",
    `    command: '${webServerCommand}',`,
    "    url: 'http://127.0.0.1:4173',",
    "    reuseExistingServer: !process.env.CI,",
    "  },",
    "  projects: [",
    "    {",
    "      name: 'chromium',",
    "      use: { ...devices['Desktop Chrome'] },",
    "    },",
    "  ],",
    "});",
    "",
  ].join("\n");
}

function renderPlaywrightSpec() {
  return [
    "import { expect, test } from '@playwright/test';",
    "",
    "test('shows the starter headline', async ({ page }) => {",
    "  await page.goto('/');",
    "",
    "  await expect(",
    "    page.getByRole('heading', {",
    "      level: 1,",
    "      name: /start with a solid react and typescript baseline/i,",
    "    }),",
    "  ).toBeVisible();",
    "});",
    "",
  ].join("\n");
}

function renderInstallCommand(packageManager) {
  return packageManager === "yarn"
    ? "yarn install"
    : `${packageManager} install`;
}

function renderScriptCommand(packageManager, scriptName) {
  if (packageManager === "npm") {
    return `npm run ${scriptName}`;
  }

  return `${packageManager} ${scriptName}`;
}

function renderReadme(displayName, packageName, options, packageJson) {
  const featureList = [
    "React 19 + Vite 8 + TypeScript 6",
    "ESLint flat config with TypeScript, React Hooks, React Refresh, and import sorting",
    "Prettier as a separate formatter",
    "Vitest + Testing Library + jsdom",
    "`@/` imports via Vite's native tsconfig path support",
  ];

  if (options.coverage) {
    featureList.push("V8-powered coverage reporting");
  }

  if (options.vitestUi) {
    featureList.push("Vitest UI");
  }

  if (options.hooks !== "none") {
    featureList.push(`${options.hooks} + lint-staged`);
  }

  if (options.commitlint) {
    featureList.push("commitlint with Conventional Commits");
  }

  if (options.e2e === "playwright") {
    featureList.push("Playwright end-to-end testing");
  }

  const orderedScriptNames = [
    "dev",
    "build",
    "typecheck",
    "lint",
    "lint:fix",
    "format",
    "format:check",
    "preview",
    "test",
    "test:coverage",
    "test:ui",
    "test:watch",
    "test:e2e:install",
    "test:e2e",
    "test:e2e:ui",
    "check",
  ].filter((scriptName) => packageJson.scripts[scriptName]);

  const scriptLines = [
    renderInstallCommand(options.packageManager),
    ...orderedScriptNames.map((scriptName) =>
      renderScriptCommand(options.packageManager, scriptName),
    ),
  ];

  const notes = [];

  if (packageName !== displayName) {
    notes.push(`The generated package name is \`${packageName}\`.`);
  }

  if (options.hooks !== "none") {
    notes.push(
      `Git hooks run lint-staged on pre-commit and the test suite on pre-push via ${options.hooks}.`,
    );
  }

  if (options.commitlint) {
    notes.push("Commit messages are checked against Conventional Commits.");
  }

  if (options.e2e === "playwright") {
    notes.push(
      `Run \`${renderScriptCommand(options.packageManager, "test:e2e:install")}\` once to download Playwright browsers.`,
    );
  }

  const lines = [
    `# ${displayName}`,
    "",
    `A React + TypeScript starter built with Vite and customized from the \`${options.preset}\` preset.`,
    "",
    "## Included tooling",
    "",
    ...featureList.map((feature) => `- ${feature}`),
    "",
    "## Scripts",
    "",
    "```bash",
    ...scriptLines,
    "```",
    "",
    "## Suggested first steps",
    "",
    "1. Replace `src/App.tsx` with your product entry point.",
    "2. Update the metadata in `index.html`.",
    `3. Add your first feature and keep \`${renderScriptCommand(options.packageManager, "check")}\` green.`,
  ];

  if (notes.length > 0) {
    lines.push("", "## Notes", "", ...notes.map((note) => `- ${note}`));
  }

  lines.push("");

  return lines.join("\n");
}

function writeTextFile(filePath, content, mode) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);

  if (mode !== undefined) {
    fs.chmodSync(filePath, mode);
  }
}

function shouldCopyTemplatePath(sourcePath) {
  const relativePath = path.relative(templateDir, sourcePath);

  if (relativePath === "") {
    return true;
  }

  const ignoredEntries = new Set([
    "coverage",
    "dist",
    "node_modules",
    "playwright-report",
    "test-results",
  ]);

  return !relativePath.split(path.sep).some((part) => ignoredEntries.has(part));
}

function initializeGitRepository(projectDir) {
  try {
    execSync("git init", { cwd: projectDir, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function installDependencies(projectDir, packageManager) {
  execSync(renderInstallCommand(packageManager), {
    cwd: projectDir,
    stdio: "inherit",
  });
}

function printSuccessMessage({
  displayName,
  installRan,
  normalizedPackageName,
  options,
  projectDir,
  gitInitialized,
}) {
  const highlightedFeatures = [];

  if (options.coverage) {
    highlightedFeatures.push("coverage");
  }

  if (options.vitestUi) {
    highlightedFeatures.push("Vitest UI");
  }

  if (options.hooks !== "none") {
    highlightedFeatures.push(`hooks: ${options.hooks}`);
  }

  if (options.commitlint) {
    highlightedFeatures.push("commitlint");
  }

  if (options.e2e === "playwright") {
    highlightedFeatures.push("Playwright");
  }

  console.log(`\nSuccess! Created ${displayName} at ${projectDir}`);
  console.log(`Preset: ${options.preset}`);
  console.log(`Package manager: ${options.packageManager}`);

  if (normalizedPackageName !== displayName) {
    console.log(`Package name: ${normalizedPackageName}`);
  }

  if (highlightedFeatures.length > 0) {
    console.log(`Enabled extras: ${highlightedFeatures.join(", ")}`);
  }

  if (gitInitialized) {
    console.log("Git repository: initialized");
  }

  console.log("\nInside that directory, you can run:");

  if (!installRan) {
    console.log(`\n  ${renderInstallCommand(options.packageManager)}`);
  }

  console.log(`  ${renderScriptCommand(options.packageManager, "dev")}`);
  console.log(`  ${renderScriptCommand(options.packageManager, "test")}`);
  console.log(`  ${renderScriptCommand(options.packageManager, "check")}`);

  if (options.e2e === "playwright") {
    console.log(
      `  ${renderScriptCommand(options.packageManager, "test:e2e:install")}`,
    );
    console.log(`  ${renderScriptCommand(options.packageManager, "test:e2e")}`);
  }

  console.log("\nWe suggest that you begin by typing:\n");
  console.log(`  cd ${displayName}`);

  if (!installRan) {
    console.log(`  ${renderInstallCommand(options.packageManager)}`);
  }

  if (options.e2e === "playwright") {
    console.log(
      `  ${renderScriptCommand(options.packageManager, "test:e2e:install")}`,
    );
  }

  console.log(`  ${renderScriptCommand(options.packageManager, "dev")}`);
}

function main() {
  const { flags, projectName } = parseArgs(process.argv.slice(2));

  if (!projectName) {
    printHelp();
    process.exit(1);
  }

  const options = resolveOptions(flags);
  const currentDir = process.cwd();
  const displayName = projectName;
  const projectDir = path.resolve(currentDir, displayName);
  const normalizedPackageName = normalizePackageName(path.basename(projectDir));

  if (fs.existsSync(projectDir)) {
    exitWithError(`The directory ${displayName} already exists.`);
  }

  if (!fs.existsSync(templateDir)) {
    exitWithError("Template files are missing from this package.");
  }

  console.log(`Creating a new React app in ${projectDir}.`);

  try {
    fs.mkdirSync(projectDir, { recursive: true });
    fs.cpSync(templateDir, projectDir, {
      recursive: true,
      filter: shouldCopyTemplatePath,
    });
  } catch (error) {
    fs.rmSync(projectDir, { recursive: true, force: true });
    exitWithError(
      error instanceof Error
        ? `Failed to create the project: ${error.message}`
        : "Failed to create the project.",
    );
  }

  const gitignorePath = path.join(projectDir, "_gitignore");
  if (fs.existsSync(gitignorePath)) {
    fs.renameSync(gitignorePath, path.join(projectDir, ".gitignore"));
  }

  const basePackageJson = JSON.parse(
    fs.readFileSync(path.join(projectDir, "package.json"), "utf8"),
  );
  const packageJson = buildPackageJson(
    basePackageJson,
    normalizedPackageName || "my-app",
    options,
  );

  writeTextFile(
    path.join(projectDir, "package.json"),
    `${JSON.stringify(packageJson, null, 2)}\n`,
  );
  writeTextFile(
    path.join(projectDir, "vite.config.ts"),
    renderViteConfig(options),
  );
  writeTextFile(
    path.join(projectDir, "README.md"),
    renderReadme(
      displayName,
      normalizedPackageName || "my-app",
      options,
      packageJson,
    ),
  );

  if (options.hooks === "husky") {
    writeTextFile(
      path.join(projectDir, ".husky", "pre-commit"),
      renderHuskyPreCommit(),
      0o755,
    );
    writeTextFile(
      path.join(projectDir, ".husky", "pre-push"),
      renderHuskyPrePush(),
      0o755,
    );

    if (options.commitlint) {
      writeTextFile(
        path.join(projectDir, ".husky", "commit-msg"),
        renderHuskyCommitMessage(),
        0o755,
      );
    }
  }

  if (options.commitlint) {
    writeTextFile(
      path.join(projectDir, "commitlint.config.cjs"),
      renderCommitlintConfig(),
    );
  }

  if (options.e2e === "playwright") {
    writeTextFile(
      path.join(projectDir, "playwright.config.ts"),
      renderPlaywrightConfig(options),
    );
    writeTextFile(
      path.join(projectDir, "e2e", "app.spec.ts"),
      renderPlaywrightSpec(),
    );
  }

  let gitInitialized = false;

  if (options.git) {
    gitInitialized = initializeGitRepository(projectDir);

    if (!gitInitialized && options.hooks !== "none") {
      console.warn(
        "Warning: failed to initialize a git repository. Install hooks manually after setting up git.",
      );
    }
  }

  let installRan = false;

  if (options.install) {
    try {
      installDependencies(projectDir, options.packageManager);
      installRan = true;
    } catch {
      console.error(
        "\nDependency installation failed. The project was still created successfully.",
      );
      console.error(
        `Try running ${renderInstallCommand(options.packageManager)} inside ${displayName}.`,
      );
      process.exit(1);
    }
  }

  printSuccessMessage({
    displayName,
    installRan,
    normalizedPackageName: normalizedPackageName || "my-app",
    options,
    projectDir,
    gitInitialized,
  });
}

main();
